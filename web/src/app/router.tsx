import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/auth/guard";
import { HistoryPage } from "@/pages/history";
import { HomePage } from "@/pages/home";
import { LandingPage } from "@/pages/landing";
import { LinksPage } from "@/pages/links";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";
import { PayPage } from "@/pages/pay";
import { RequestPage } from "@/pages/request";
import { ScanPage } from "@/pages/scan";
import { SendPage } from "@/pages/send";
import { SettingsPage } from "@/pages/settings";
import { TxPage } from "@/pages/tx";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Navigate to="/app" replace />} />
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/pay/:id" element={<PayPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/tx/:hash" element={<TxPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
