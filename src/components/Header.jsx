import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-bg border-b border-accent-cold/10 py-8 z-40">
      <div className="container mx-auto px-5 max-w-6xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-text-primary mb-1 tracking-wide">
            All you need is thought
          </h1>
          <p className="text-text-secondary text-sm md:text-base font-serif">
            di Riccardo Bovetti
          </p>
          <p className="text-text-secondary text-base md:text-lg font-serif italic">
            Una raccolta di testicoli variegati (intesi come piccoli testi, naturalmente)
          </p>
        </div>

        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {/* Bottone admin */}
          <button
            onClick={() => navigate('/admin')}
            title="Area admin"
            className="text-text-secondary hover:text-accent-warm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>

          {/* Torna a rbovetti.com */}
          <a
            href="https://www.rbovetti.com"
            title="Torna a rbovetti.com"
            className="text-text-secondary hover:text-accent-warm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
