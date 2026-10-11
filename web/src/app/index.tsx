import { AuthProvider } from "@/auth/provider";
import { ThemeProvider } from "@/theme";

import { AppRouter } from "./router";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
