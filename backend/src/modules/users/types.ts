export type User = {
  id: string;
  email: string;
  username: string | null;
  user_id: string | null;
  wallet: string;
  created_at: number;
  updated_at: number;
};

export type PublicUser = {
  wallet: string;
  username: string | null;
  userId: string | null;
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
