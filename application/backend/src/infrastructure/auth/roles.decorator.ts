import { SetMetadata } from '@nestjs/common';
import type { AppRole } from '../../domain/auth/enums/app-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
