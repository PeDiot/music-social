import Link from "next/link";

import { SignupForm } from "./SignupForm";

export const metadata = { title: "Inscription · Resound" };

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Crée ton compte</h1>
        <p className="text-sm text-neutral-500">
          Découvre et partage ce que tu écoutes.
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-neutral-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
