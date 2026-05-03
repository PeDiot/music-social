import { NewPostForm } from "./NewPostForm";

export const metadata = { title: "Publier · Resound" };

export default function NewPostPage() {
  return (
    <div className="py-8 max-w-2xl mx-auto">
      <header className="mb-8 px-1">
        <h1 className="text-3xl font-bold tracking-tight">Publier un morceau</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Cherche un morceau, écoute l&apos;extrait, donne-lui une note.
        </p>
      </header>
      <NewPostForm />
    </div>
  );
}
