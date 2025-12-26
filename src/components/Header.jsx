export default function Header() {
  return (
    <header className="bg-dark-light border-b-4 border-primary py-12 mb-12">
      <div className="container mx-auto px-5 max-w-6xl">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Biblioteca Articoli
        </h1>
        <p className="text-text-muted text-lg">
          Una raccolta di articoli organizzati per topic e lingua
        </p>
      </div>
    </header>
  );
}
