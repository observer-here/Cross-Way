export type User = {
  id: string;
  email: string;
  username: string | null;
  user_id: string | null;
  wallet: string;
  created_at: number;
  updated_at: number;
  has_avatar: boolean;
};

export type PublicUser = {
  id: string;
  wallet: string;
  username: string | null;
  userId: string | null;
  email: string;
  has_avatar: boolean;
  updated_at: number;
};

export type LookupQuery = {
  email?: string;
  username?: string;
  userId?: string;
  wallet?: string;
};

export type ProfilePatch = {
  username?: string;
  userId?: string;
};
