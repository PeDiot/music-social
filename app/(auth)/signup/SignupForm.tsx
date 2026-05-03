"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signupAction, type SignupState } from "@/features/auth/actions";

const initial: SignupState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-2xl bg-rose-500 text-white font-medium hover:bg-rose-600 active:scale-[0.99] transition disabled:opacity-50"
    >
      {pending ? "Création…" : "Créer mon compte"}
    </button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-rose-600">{messages[0]}</p>;
}

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initial);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40"
        />
        <FieldError messages={fe.email} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Nom d&apos;utilisateur
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={20}
          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40"
        />
        <FieldError messages={fe.username} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Nom (optionnel)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={50}
          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40"
        />
        <FieldError messages={fe.password} />
      </div>
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
