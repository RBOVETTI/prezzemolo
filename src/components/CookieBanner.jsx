import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già accettato
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-light border-t-2 border-primary p-4 shadow-2xl z-50">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-text-muted">
          <p>
            Questo sito utilizza <strong>solo cookie tecnici</strong> necessari per il corretto funzionamento.
            Non usiamo cookie di profilazione o di tracciamento.{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Leggi la Privacy Policy
            </Link>
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="px-6 py-2 bg-primary text-dark font-bold rounded hover:bg-primary-dark transition-colors whitespace-nowrap"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
