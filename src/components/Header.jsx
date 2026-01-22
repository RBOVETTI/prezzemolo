export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-bg border-b border-accent-cold/10 py-8 z-40">
      <div className="container mx-auto px-5 max-w-6xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-text-primary mb-1 tracking-wide">
            All you need is thought
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-serif italic">
            Una raccolta di testicoli variegati (intesi come piccoli testi, naturalmente)
          </p>
        </div>

        {/* Home icon - torna a rbovetti.com */}
        <a
          href="https://www.rbovetti.com"
          title="Torna a rbovetti.com"
          className="text-text-secondary hover:text-accent-warm transition-colors ml-4 flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 md:w-10 md:h-10"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </a>
      </div>
    </header>
  );
}
