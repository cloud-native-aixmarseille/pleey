import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';

export type PublicUserProfile = Omit<UserProfileSnapshot, 'avatarVersion'> & {
  avatarUri: string | null;
};
