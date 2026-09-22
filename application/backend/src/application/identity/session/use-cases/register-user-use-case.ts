import { Inject, Injectable } from '@nestjs/common';
import { CaptchaAction } from '../../../../domain/identity/enums/captcha-action.enum';
import { PasswordTooShortError, UserAlreadyExistsError } from '../../../../domain/identity/errors';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import { PasswordService } from '../../../../domain/identity/services/password-service';
import { UserAvatarService } from '../../../../domain/identity/services/user-avatar-service';
import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';
import { DefaultWorkspaceService } from '../../../../domain/organization/services/default-workspace-service';
import { type CaptchaPort, CaptchaPortProvider } from '../../captcha/ports/captcha.port';
import type { RegisterUserDto } from '../dto/register-user-dto';

/**
 * Register User Use Case
 * Handles user registration logic
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly userAvatarService: UserAvatarService,
    private readonly defaultWorkspaceService: DefaultWorkspaceService,
    @Inject(CaptchaPortProvider) private readonly captcha: CaptchaPort,
  ) {}

  async execute(dto: RegisterUserDto, peer: string): Promise<UserProfileSnapshot> {
    await this.captcha.verify(CaptchaAction.SIGNUP, dto.captchaToken, peer);
    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new UserAlreadyExistsError({
        email: dto.email,
        username: dto.username,
      });
    }

    // Validate password strength
    if (!this.passwordService.isValidPassword(dto.password)) {
      throw new PasswordTooShortError({ passwordLength: dto.password.length });
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Generate random avatar
    const avatar = this.userAvatarService.generateAvatar();

    // Create user
    const created = await this.userRepository.create(dto.username, dto.email, hashedPassword, avatar);

    await this.defaultWorkspaceService.ensure(created.id);

    return created.toProfileSnapshot();
  }
}
