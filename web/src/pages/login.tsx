import { Field, Input, Submit } from "@/shared/ui/field";
import { Logo } from "@/shared/ui/logo";

export function LoginPage() {
  return (
    <main className="app-sky flex min-h-screen flex-col items-center justify-center px-6">
      <Logo />
      <p className="mt-4 text-sm text-slate-500">Sign in with email. A wallet is created for you.</p>
      <form className="panel mt-8 flex w-full max-w-sm flex-col gap-5 p-6" onSubmit={(e) => e.preventDefault()}>
        <Field label="Email">
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Submit>Continue</Submit>
      </form>
    </main>
  );
}
