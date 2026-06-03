export type UserId = string & {
  readonly __identifierBrand: 'UserId';
};

export interface User {
  readonly id: UserId;
  readonly username: string;
  readonly email: string;
  readonly avatarUri?: string | null;
  readonly createdAt?: string | null;
}
