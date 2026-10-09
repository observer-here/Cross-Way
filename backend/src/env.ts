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

export type AppEnv = {
  Bindings: Env;
  Variables: { userId: string };
};
