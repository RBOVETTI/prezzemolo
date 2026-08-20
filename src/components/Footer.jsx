export default function Footer() {
  return (
    <footer className="bg-bg border-t border-accent-cold/10 py-8 mt-12 text-center">
      <div className="container mx-auto px-5 max-w-6xl">
        <p className="text-text-secondary text-sm">
          &copy; 2026 Riccardo Bovetti - Tutti i diritti riservati
        </p>
        <a href="https://rbovetti.com/ai-transparency/" target="_blank" rel="noreferrer" className="text-text-secondary text-sm hover:text-text-primary">
          AI Transparency
        </a>
      </div>
    </footer>
  );
}
