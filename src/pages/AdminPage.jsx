import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [leadsData, setLeadsData] = useState({});
  const [articlesData, setArticlesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedLeads, setSelectedLeads] = useState({});
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [leadsRes, articlesRes] = await Promise.all([
          fetch('/api/get-leads', { credentials: 'same-origin' }),
          fetch('/articles.json'),
        ]);
        const leads = await leadsRes.json();
        const articles = await articlesRes.json();
        if (!cancelled) {
          setLeadsData(leads);
          setArticlesData(articles.articles || []);
        }
      } catch (err) {
        console.error('Errore caricamento dati:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [authenticated]);

  useEffect(() => {
    if (selectedArticle && leadsData[selectedArticle]) {
      const defaults = {};
      leadsData[selectedArticle].forEach(l => { defaults[l.email] = true; });
      setSelectedLeads(defaults);
    } else {
      setSelectedLeads({});
    }
    setSendResult(null);
  }, [selectedArticle, leadsData]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('Password non valida');
      }
    } catch {
      setAuthError('Errore di connessione');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSend() {
    const activeLeads = (leadsData[selectedArticle] || []).filter(l => selectedLeads[l.email]);
    const article = articlesData.find(a => a.title === selectedArticle);
    const protectedOpt = article?.options?.find(o => o.type === 'protected-download');

    if (!protectedOpt?.file) {
      setSendResult({ ok: false, error: 'PDF non trovato per questo articolo' });
      return;
    }

    const pdfUrl = window.location.origin + protectedOpt.file;

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/send-update', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleTitle: selectedArticle,
          pdfUrl,
          message,
          leads: activeLeads.map(l => ({ name: l.name, email: l.email })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult({ ok: true, count: data.sent });
        setMessage('');
      } else {
        setSendResult({ ok: false, error: data.error });
      }
    } catch {
      setSendResult({ ok: false, error: 'Errore di connessione' });
    } finally {
      setSending(false);
    }
  }

  const currentLeads = leadsData[selectedArticle] || [];
  const activeCount = Object.values(selectedLeads).filter(Boolean).length;
  const canSend = selectedArticle && activeCount > 0 && message.trim().length > 0;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-serif font-medium text-accent-warm mb-6 text-center">Area Admin</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-accent-cold/20 rounded focus:outline-none focus:border-accent-cold"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full py-3 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 disabled:opacity-50"
            >
              {authLoading ? 'Verifica...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg pt-32 md:pt-36 pb-16">
        <div className="container mx-auto px-5 max-w-6xl">
          <h2 className="text-3xl font-serif font-medium text-accent-warm mb-8">Invia aggiornamento</h2>

          {loading ? (
            <p className="text-text-secondary">Caricamento dati...</p>
          ) : (
            <>
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-primary mb-2">Documento</label>
                <select
                  value={selectedArticle}
                  onChange={e => setSelectedArticle(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-2 border border-accent-cold/20 rounded bg-white focus:outline-none focus:border-accent-cold"
                >
                  <option value="">-- seleziona documento --</option>
                  {Object.keys(leadsData).map(title => (
                    <option key={title} value={title}>
                      {title} ({leadsData[title].length})
                    </option>
                  ))}
                </select>
              </div>

              {selectedArticle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-3">
                      Lead ({activeCount}/{currentLeads.length} selezionati)
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {currentLeads.map(lead => (
                        <label
                          key={lead.email}
                          className="flex items-start gap-3 p-3 bg-white rounded border border-accent-cold/10 cursor-pointer hover:border-accent-cold/30"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeads[lead.email] || false}
                            onChange={e =>
                              setSelectedLeads(prev => ({ ...prev, [lead.email]: e.target.checked }))
                            }
                            className="mt-1 accent-accent-warm"
                          />
                          <div>
                            <p className="font-medium text-text-primary text-sm">{lead.name}</p>
                            <p className="text-text-secondary text-xs">{lead.email}</p>
                            {lead.company && (
                              <p className="text-text-secondary text-xs">{lead.company}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Commento aggiornamento
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={8}
                        placeholder="Descrivi cosa è cambiato nel documento..."
                        className="w-full px-4 py-3 border border-accent-cold/20 rounded focus:outline-none focus:border-accent-cold resize-none"
                      />
                    </div>

                    {sendResult && (
                      <p className={sendResult.ok ? 'text-green-600 font-medium' : 'text-red-500'}>
                        {sendResult.ok
                          ? `✓ Inviate ${sendResult.count} email con successo`
                          : `Errore: ${sendResult.error}`}
                      </p>
                    )}

                    <button
                      onClick={handleSend}
                      disabled={!canSend || sending}
                      className="px-6 py-3 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                    >
                      {sending ? 'Invio in corso...' : `Invia aggiornamento (${activeCount})`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
