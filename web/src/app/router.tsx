import { BrowserRouter, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/auth/guard";
import { HistoryPage } from "@/pages/history";
import { HomePage } from "@/pages/home";
import { LandingPage } from "@/pages/landing";
import { LinksPage } from "@/pages/links";
import { LoginPage } from "@/pages/login";
import { PayPage } from "@/pages/pay";
import { RequestPage } from "@/pages/request";
import { SendPage } from "@/pages/send";
import { SettingsPage } from "@/pages/settings";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/pay/:id" element={<PayPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
