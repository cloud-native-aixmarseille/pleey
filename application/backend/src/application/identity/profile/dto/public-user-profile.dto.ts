import type { UserProfileSnapshot } from '../../../../domain/auth/types/user-profile-snapshot';

export type PublicUserProfile = Omit<UserProfileSnapshot, 'avatarVersion'> & {
  avatarUri: string | null;
};
