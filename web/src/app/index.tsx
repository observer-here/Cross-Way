import { AuthProvider } from "@/auth/provider";

import { AppRouter } from "./router";

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
