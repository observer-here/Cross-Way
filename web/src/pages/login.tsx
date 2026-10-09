import { Field, Input, Submit } from "@/shared/ui/field";

export function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">CrossWay</h1>
      <p className="mt-2 text-sm text-zinc-500">Sign in with email. A wallet is created for you.</p>
      <form className="mt-10 flex max-w-sm flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <Field label="Email">
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Submit>Continue</Submit>
      </form>
    </main>
  );
}
