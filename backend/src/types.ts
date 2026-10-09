export type Env = {
  DB: D1Database;
  PRIVY_APP_ID: string;
  PRIVY_APP_SECRET: string;
  FRONTEND_ORIGIN: string;
  CONTRACT_ADDRESS: string;
  CHAIN_ID: string;
  RPC_URL: string;
  USDC: string;
  EURC: string;
};

export type AppVars = { userId: string };

export type User = {
  id: string;
  email: string;
  username: string | null;
  user_id: string | null;
  wallet: string;
  created_at: number;
  updated_at: number;
};
