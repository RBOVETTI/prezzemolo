# localStorage Download Memory — Design Spec
Date: 2026-05-07

## Obiettivo
Evitare che a un visitatore già registrato venga mostrato nuovamente il form di download. Il browser ricorda localmente i titoli dei documenti già richiesti, senza conservare dati personali.

---

## Architettura

**File modificati:**
- `src/components/LeadGenModal.jsx` — logica localStorage (lettura + scrittura)
- `src/pages/PrivacyPolicy.jsx` — aggiornamento sezione 4 "Cookie e Tecnologie di Tracciamento"

**Nessun file nuovo, nessuna API nuova.**

---

## Comportamento

### Chiave localStorage
```
prezzemolo_downloads  →  ["Titolo A", "Titolo B"]
```
Array di stringhe con i titoli degli articoli già scaricati. Nessun dato personale.

### Flusso prima visita (invariato)
1. Utente clicca "Scarica"
2. Modale apre con form completo
3. Utente compila e invia
4. Submit riuscito → titolo aggiunto a `prezzemolo_downloads` in localStorage
5. Modale mostra schermata "Grazie" (comportamento attuale)

### Flusso visita successiva (nuovo)
1. Utente clicca "Scarica"
2. Modale apre → controlla `prezzemolo_downloads` in localStorage
3. Titolo già presente → mostra schermata "Accesso diretto" invece del form:
   - Titolo del documento
   - Bottone "Scarica il documento" — URL costruito da `window.location.origin + article.options.find(o => o.type === 'protected-download')?.file` (nessuna chiamata API)
   - Link secondario "Non sei tu? Registra un nuovo accesso" → mostra il form normale
4. Titolo non presente → comportamento invariato (form)

---

## Modifiche a LeadGenModal.jsx

### Lettura (all'apertura della modale)
```javascript
const downloaded = JSON.parse(localStorage.getItem('prezzemolo_downloads') || '[]');
const alreadyDownloaded = downloaded.includes(article.title);
```
Se `alreadyDownloaded` è true → mostrare la schermata "Accesso diretto".

### Scrittura (dopo submit riuscito)
```javascript
const downloaded = JSON.parse(localStorage.getItem('prezzemolo_downloads') || '[]');
if (!downloaded.includes(article.title)) {
  localStorage.setItem('prezzemolo_downloads', JSON.stringify([...downloaded, article.title]));
}
```

### Stato aggiuntivo
```javascript
const [forceForm, setForceForm] = useState(false);
```
`forceForm` diventa `true` quando l'utente clicca "Non sei tu? Registra un nuovo accesso", bypassando il check localStorage.

---

## Modifiche a PrivacyPolicy.jsx

Nella sezione **4. Cookie e Tecnologie di Tracciamento**, aggiungere dopo il testo esistente:

> **Memoria locale (localStorage)**
>
> Questo sito utilizza il localStorage del browser per ricordare i documenti che hai già richiesto, al fine di evitarti di ripetere la registrazione. In questo storage vengono salvati esclusivamente i **titoli dei documenti scaricati**, senza alcun dato personale (nessuna email, nome o altro). Questi dati rimangono sul tuo dispositivo e non vengono mai trasmessi ai nostri server. Puoi eliminarli in qualsiasi momento dalle impostazioni del tuo browser (Impostazioni → Privacy → Cancella dati di navigazione → Dati dei siti).

---

## Note GDPR
- Nessun dato personale nel localStorage → esenzione "strettamente necessario" applicabile
- Cookie banner invariato
- Privacy Policy aggiornata con disclosure trasparente
