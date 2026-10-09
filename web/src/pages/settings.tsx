import { Field, Input, Submit } from "@/shared/ui/field";

export function SettingsPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form className="panel mt-8 flex flex-col gap-5 p-6" onSubmit={(e) => e.preventDefault()}>
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
