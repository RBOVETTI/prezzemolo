import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg py-12">
      <SEOHead
        title="Privacy Policy"
        description="Informativa sulla privacy e cookie policy del sito writing.rbovetti.com di Riccardo Bovetti."
        url="/privacy-policy"
      />
      <div className="container mx-auto px-5 max-w-4xl">
        <Link to="/" className="text-accent-warm hover:underline mb-8 inline-block">
          ← Torna alla home
        </Link>

        <h1 className="text-4xl font-serif font-light text-text-primary mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg p-8 text-text-secondary space-y-6 border border-accent-cold/10">
          <p className="text-sm text-text-secondary">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT')}
          </p>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">1. Introduzione</h2>
            <p>
              La presente Privacy Policy descrive le modalità di trattamento dei dati personali degli utenti
              che visitano il sito web <strong>All you need is thought</strong> e utilizzano i servizi di download
              di contenuti digitali.
            </p>
            <p className="mt-2">
              Il Titolare del trattamento si impegna a proteggere la privacy degli utenti e a trattare i dati
              personali in conformità al Regolamento (UE) 2016/679 (GDPR) e alla normativa italiana vigente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">2. Titolare del Trattamento</h2>
            <p>
              Il Titolare del trattamento dei dati è il proprietario del sito web, raggiungibile via email
              all'indirizzo indicato sul sito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">3. Dati Raccolti e Finalità del Trattamento</h2>
            <h3 className="text-xl font-medium text-accent-warm mb-2">3.1 Dati raccolti tramite form</h3>
            <p>Quando richiedi il download di un documento protetto, raccogliamo:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Nome e Cognome:</strong> per personalizzare le comunicazioni</li>
              <li><strong>Email:</strong> per inviarti il documento richiesto e comunicazioni correlate</li>
              <li><strong>Azienda (opzionale):</strong> per comprendere meglio il tuo profilo professionale</li>
              <li><strong>Ruolo (opzionale):</strong> per personalizzare i contenuti futuri</li>
            </ul>

            <h3 className="text-xl font-medium text-accent-warm mb-2 mt-4">3.2 Finalità del trattamento</h3>
            <p>I tuoi dati vengono trattati per le seguenti finalità:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Invio del documento richiesto via email</li>
              <li>Gestione della richiesta di download</li>
              <li>Comunicazioni relative al contenuto scaricato</li>
              <li>Invio di newsletter e aggiornamenti (solo con consenso esplicito)</li>
            </ul>

            <h3 className="text-xl font-medium text-accent-warm mb-2 mt-4">3.3 Base giuridica del trattamento</h3>
            <p>
              Il trattamento dei dati è basato sul consenso esplicito dell'utente (art. 6, par. 1, lett. a GDPR),
              fornito mediante la compilazione del form e l'accettazione della presente Privacy Policy.
            </p>
          </section>

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

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">5. Modalità di Trattamento e Conservazione</h2>
            <p>
              I dati personali vengono trattati con strumenti automatizzati e conservati in modo sicuro
              su server protetti (Google Sheets).
            </p>
            <p className="mt-2">
              <strong>Periodo di conservazione:</strong> I dati vengono conservati fino a quando non richiedi
              la cancellazione o revochi il consenso, e comunque non oltre 24 mesi dall'ultima interazione.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">6. Comunicazione e Diffusione dei Dati</h2>
            <p>
              I tuoi dati personali non vengono ceduti a terzi per finalità commerciali.
            </p>
            <p className="mt-2">
              I dati possono essere comunicati a fornitori di servizi terzi che ci assistono nella gestione
              del sito (es. servizio email, hosting), che agiscono come Responsabili del Trattamento secondo
              contratti che garantiscono la sicurezza e la riservatezza dei dati.
            </p>
            <p className="mt-2">
              Fornitori utilizzati:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Vercel:</strong> hosting del sito web</li>
              <li><strong>Google (Gmail, Google Sheets):</strong> invio email e archiviazione dati</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">7. Diritti dell'Interessato</h2>
            <p>
              Ai sensi degli articoli 15-22 del GDPR, hai diritto di:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li><strong>Accesso:</strong> ottenere conferma dell'esistenza dei tuoi dati e ricevere una copia</li>
              <li><strong>Rettifica:</strong> correggere dati inesatti o incompleti</li>
              <li><strong>Cancellazione:</strong> richiedere la cancellazione dei tuoi dati ("diritto all'oblio")</li>
              <li><strong>Limitazione:</strong> limitare il trattamento in determinate circostanze</li>
              <li><strong>Portabilità:</strong> ricevere i dati in formato strutturato e trasferirli a un altro titolare</li>
              <li><strong>Opposizione:</strong> opporti al trattamento per motivi legittimi</li>
              <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento</li>
            </ul>

            <div className="bg-bg p-4 rounded mt-4 border border-accent-cold/10">
              <p className="font-medium text-accent-warm mb-2">Come esercitare i tuoi diritti:</p>
              <p className="mb-2">
                Puoi esercitare i tuoi diritti in qualsiasi momento inviando una richiesta via email
                o utilizzando il link di cancellazione automatica presente in ogni email.
              </p>
              <a
                href="/api/unsubscribe"
                className="text-accent-warm hover:underline font-medium"
              >
                Cancella i miei dati →
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">8. Sicurezza dei Dati</h2>
            <p>
              Adottiamo misure di sicurezza tecniche e organizzative adeguate per proteggere i dati personali
              da accessi non autorizzati, perdita, distruzione o divulgazione.
            </p>
            <p className="mt-2">
              Misure adottate:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Connessione HTTPS crittografata</li>
              <li>Accesso ai dati limitato al personale autorizzato</li>
              <li>Backup regolari dei dati</li>
              <li>Sistemi di autenticazione sicuri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">9. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di modificare o aggiornare la presente Privacy Policy in qualsiasi momento.
              Le modifiche saranno pubblicate su questa pagina con l'indicazione della data di ultimo aggiornamento.
            </p>
            <p className="mt-2">
              Ti invitiamo a consultare periodicamente questa pagina per rimanere informato.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">10. Reclami</h2>
            <p>
              Se ritieni che il trattamento dei tuoi dati personali violi il GDPR, hai il diritto di proporre
              reclamo al Garante per la Protezione dei Dati Personali:
            </p>
            <div className="bg-bg p-4 rounded mt-2 border border-accent-cold/10">
              <p className="font-medium text-text-primary">Garante per la Protezione dei Dati Personali</p>
              <p>Piazza Venezia, 11 - 00187 Roma</p>
              <p>Tel: +39 06 696771</p>
              <p>Email: garante@gpdp.it</p>
              <p>Sito web: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent-warm hover:underline">www.garanteprivacy.it</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-medium text-text-primary mb-4">11. Contatti</h2>
            <p>
              Per qualsiasi domanda relativa alla presente Privacy Policy o al trattamento dei dati personali,
              puoi contattarci all'indirizzo email indicato sul sito.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-accent-cold text-white font-medium rounded hover:bg-accent-cold/90 transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
