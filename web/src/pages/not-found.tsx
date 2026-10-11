import { Link } from "react-router-dom";

import { Logo } from "@/shared/ui/logo";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <img src="/logo.png" alt="" className="mt-10 h-40 w-40 object-contain" />
      <h1 className="mt-10 text-3xl font-extrabold">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">The page you are looking for doesn&apos;t exist or may have been moved.</p>
      <Link to="/" className="mt-8 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white">
        Go Back Home
      </Link>
    </div>
  );
}
