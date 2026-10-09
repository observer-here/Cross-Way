import { Field, Input, Submit } from "@/shared/ui/field";

export function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-[#070b18] px-6 text-white">
      <h1 className="text-3xl font-semibold">CrossWay</h1>
      <p className="mt-2 text-sm text-white/50">Sign in with email. A wallet is created for you.</p>
      <form className="mt-10 flex max-w-sm flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <Field label="Email">
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Submit>Continue</Submit>
      </form>
    </main>
  );
}
