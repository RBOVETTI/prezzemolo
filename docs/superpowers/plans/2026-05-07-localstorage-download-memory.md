# localStorage Download Memory — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evitare che a un visitatore già registrato venga mostrato il form di download, usando localStorage per ricordare i documenti già richiesti senza conservare dati personali.

**Architecture:** Due modifiche indipendenti: `LeadGenModal.jsx` aggiunge la logica localStorage (lettura all'apertura, scrittura dopo submit riuscito, schermata alternativa) e `PrivacyPolicy.jsx` aggiunge la disclosure nella sezione Cookie. Nessuna API nuova, nessun file nuovo.

**Tech Stack:** React 19, localStorage API (nativa browser), Tailwind CSS.

---

## File Map

| File | Azione | Responsabilità |
|---|---|---|
| `src/components/LeadGenModal.jsx` | Modifica | Logica localStorage: lettura, scrittura, schermata accesso diretto |
| `src/pages/PrivacyPolicy.jsx` | Modifica | Aggiunge paragrafo localStorage nella sezione 4 |

---

## Task 1: LeadGenModal.jsx — localStorage logic

**Files:**
- Modify: `src/components/LeadGenModal.jsx`

Il file attuale (`src/components/LeadGenModal.jsx`) ha questi stati: `formData`, `errors`, `isSubmitting`, `showThankYou`, `downloadUrl`. Ha tre schermate: form, thank-you. Aggiungiamo una quarta schermata "accesso diretto" e la logica localStorage.

- [ ] **Step 1: Sostituisci l'intero file con la versione aggiornata**

```jsx
import React, { useState } from 'react';
import Modal from './Modal';

const LS_KEY = 'prezzemolo_downloads';

function getDownloaded() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDownloaded(title) {
  try {
    const prev = getDownloaded();
    if (!prev.includes(title)) {
      localStorage.setItem(LS_KEY, JSON.stringify([...prev, title]));
    }
  } catch {
    // localStorage non disponibile (es. modalità privata con restrizioni)
  }
}

export default function LeadGenModal({ isOpen, onClose, article }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    gdprConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [forceForm, setForceForm] = useState(false);

  if (!article) return null;

  const protectedOpt = article.options?.find(o => o.type === 'protected-download');
  const directUrl = protectedOpt?.file ? window.location.origin + protectedOpt.file : null;
  const alreadyDownloaded = !forceForm && getDownloaded().includes(article.title);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Il nome deve contenere almeno 2 caratteri' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Inserisci un indirizzo email valido' : '';
      case 'gdprConsent':
        return !value ? 'Devi accettare la privacy policy per procedere' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, fieldValue) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      gdprConsent: validateField('gdprConsent', formData.gdprConsent),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          articleTitle: article.title,
          pdfUrl: window.location.origin + protectedOpt?.file,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        saveDownloaded(article.title);
        setDownloadUrl(data.downloadUrl);
        setShowThankYou(true);
        setTimeout(() => window.open(data.downloadUrl, '_blank'), 1000);
      } else {
        alert('Errore: ' + (data.error || 'Si è verificato un errore'));
      }
    } catch {
      alert('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Schermata: accesso diretto (già registrato)
  if (alreadyDownloaded && directUrl) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4 text-accent-warm">↓</div>
          <h2 className="text-3xl font-serif font-medium text-accent-warm mb-4">{article.title}</h2>
          <p className="text-text-secondary mb-6">
            Hai già richiesto questo documento. Puoi scaricarlo direttamente.
          </p>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 transition-colors"
          >
            Scarica il documento
          </a>
          <div className="mt-6">
            <button
              onClick={() => setForceForm(true)}
              className="text-sm text-text-secondary hover:text-accent-warm underline"
            >
              Non sei tu? Registra un nuovo accesso
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Schermata: grazie / download avviato
  if (showThankYou) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4 text-accent-warm">✓</div>
          <h2 className="text-3xl font-serif font-medium text-accent-warm mb-4">Grazie!</h2>
          <p className="text-text-secondary mb-4">
            Il download del documento dovrebbe partire automaticamente.
          </p>
          <p className="text-text-secondary mb-6">
            Riceverai anche un'email con il link al documento.
          </p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 transition-colors"
            >
              Download manuale
            </a>
          )}
        </div>
      </Modal>
    );
  }

  // Schermata: form
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 max-h-[85vh] overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-medium text-accent-warm mb-3">{article.title}</h2>
          {article.valueProposition && (
            <p className="text-lg text-text-secondary">{article.valueProposition}</p>
          )}
        </div>

        {article.coverImage && (
          <div className="mb-6">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {article.benefits && article.benefits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-serif font-medium text-text-primary mb-4">Cosa troverai in questo documento:</h3>
            <ul className="space-y-2">
              {article.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-accent-warm mr-2">✓</span>
                  <span className="text-text-secondary">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-serif font-medium text-text-primary mb-4">Compila il form per scaricare il documento</h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">Nome e Cognome *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Mario Rossi"
              className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-500' : 'border-accent-cold/20'} rounded text-text-primary placeholder-text-secondary/50 focus:border-accent-cold focus:outline-none`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mario.rossi@example.com"
              className={`w-full px-4 py-3 bg-white border ${errors.email ? 'border-red-500' : 'border-accent-cold/20'} rounded text-text-primary placeholder-text-secondary/50 focus:border-accent-cold focus:outline-none`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-text-primary mb-1">Azienda</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Nome azienda"
              className="w-full px-4 py-3 bg-white border border-accent-cold/20 rounded text-text-primary placeholder-text-secondary/50 focus:border-accent-cold focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-1">Ruolo</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Es. CTO, CFO, Manager"
              className="w-full px-4 py-3 bg-white border border-accent-cold/20 rounded text-text-primary placeholder-text-secondary/50 focus:border-accent-cold focus:outline-none"
            />
          </div>

          <div className="pt-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="gdprConsent"
                checked={formData.gdprConsent}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-accent-warm"
                required
              />
              <span className="ml-3 text-sm text-text-secondary">
                Ho letto e accetto la{' '}
                <a href="/privacy-policy" target="_blank" className="text-accent-warm hover:underline">
                  Privacy Policy
                </a>{' '}
                e acconsento al trattamento dei miei dati personali. *
              </span>
            </label>
            {errors.gdprConsent && <p className="text-red-500 text-sm mt-1">{errors.gdprConsent}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? 'Invio in corso...' : 'Scarica il documento'}
          </button>

          <p className="text-xs text-text-secondary text-center">* Campi obbligatori</p>
        </form>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Verifica manuale nel browser**

Avvia il dev server:
```bash
npm run dev
```

Checklist:
1. Apri un articolo con `protected-download` → deve apparire il form (prima visita)
2. Compila e invia → deve apparire la schermata "Grazie"
3. Chiudi la modale e riaprila sullo stesso articolo → deve apparire la schermata "Scarica il documento" (accesso diretto)
4. Clicca "Non sei tu? Registra un nuovo accesso" → deve riapparire il form
5. Apri un articolo diverso → deve apparire il form (localStorage distingue per titolo)
6. Apri la console browser → `JSON.parse(localStorage.getItem('prezzemolo_downloads'))` deve mostrare l'array con il titolo

- [ ] **Step 3: Commit**

```bash
git add src/components/LeadGenModal.jsx
git commit -m "feat: localStorage per ricordare documenti già scaricati"
```

---

## Task 2: PrivacyPolicy.jsx — disclosure localStorage

**Files:**
- Modify: `src/pages/PrivacyPolicy.jsx` (righe 68-79, sezione 4)

- [ ] **Step 1: Aggiungi il paragrafo localStorage nella sezione 4**

Nella sezione 4 "Cookie e Tecnologie di Tracciamento", dopo il paragrafo esistente `<p className="mt-2">I cookie tecnici non richiedono...</p>`, aggiungi:

```jsx
<h3 className="text-xl font-medium text-accent-warm mb-2 mt-4">4.1 Memoria locale (localStorage)</h3>
<p>
  Questo sito utilizza il <strong>localStorage</strong> del browser per ricordare i documenti
  che hai già richiesto, al fine di evitarti di ripetere la registrazione ad ogni visita.
</p>
<p className="mt-2">
  In questo storage vengono salvati esclusivamente i <strong>titoli dei documenti scaricati</strong>,
  senza alcun dato personale (nessuna email, nome o altro identificativo).
  Questi dati rimangono sul tuo dispositivo e non vengono mai trasmessi ai nostri server.
</p>
<p className="mt-2">
  Puoi eliminarli in qualsiasi momento dalle impostazioni del tuo browser:<br />
  <em>Impostazioni → Privacy → Cancella dati di navigazione → Dati dei siti</em>
</p>
```

La sezione 4 completa deve quindi diventare:

```jsx
<section>
  <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">4. Cookie e Tecnologie di Tracciamento</h2>
  <p>
    Questo sito utilizza <strong>esclusivamente cookie tecnici</strong> necessari per il funzionamento
    del sito (es. gestione della sessione, preferenze utente).
  </p>
  <p className="mt-2">
    Non utilizziamo cookie di profilazione o di terze parti per il tracciamento degli utenti.
  </p>
  <p className="mt-2">
    I cookie tecnici non richiedono il consenso dell'utente ai sensi del GDPR.
  </p>

  <h3 className="text-xl font-medium text-accent-warm mb-2 mt-4">4.1 Memoria locale (localStorage)</h3>
  <p>
    Questo sito utilizza il <strong>localStorage</strong> del browser per ricordare i documenti
    che hai già richiesto, al fine di evitarti di ripetere la registrazione ad ogni visita.
  </p>
  <p className="mt-2">
    In questo storage vengono salvati esclusivamente i <strong>titoli dei documenti scaricati</strong>,
    senza alcun dato personale (nessuna email, nome o altro identificativo).
    Questi dati rimangono sul tuo dispositivo e non vengono mai trasmessi ai nostri server.
  </p>
  <p className="mt-2">
    Puoi eliminarli in qualsiasi momento dalle impostazioni del tuo browser:<br />
    <em>Impostazioni → Privacy → Cancella dati di navigazione → Dati dei siti</em>
  </p>
</section>
```

- [ ] **Step 2: Verifica manuale**

Con il dev server attivo, vai su `http://localhost:5173/privacy-policy` e verifica che la sezione 4 mostri il nuovo paragrafo "4.1 Memoria locale" con il testo corretto.

- [ ] **Step 3: Commit e push**

```bash
git add src/pages/PrivacyPolicy.jsx
git commit -m "feat: aggiunge disclosure localStorage in Privacy Policy"
git push
```
