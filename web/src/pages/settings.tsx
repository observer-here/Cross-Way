import { Field, Input, Submit } from "@/shared/ui/field";

export function SettingsPage() {
  return (
    <section className="max-w-md">
      <h1 className="text-xl font-semibold">Settings</h1>
      <form className="mt-8 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <Field label="Username">
          <Input name="username" placeholder="alice" />
        </Field>
        <Field label="User ID">
          <Input name="userId" placeholder="user-42" />
        </Field>
        <Submit>Save</Submit>
      </form>
    </section>
  );
}
