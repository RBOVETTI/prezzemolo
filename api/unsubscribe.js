import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = req.method === 'GET' ? req.query.email : req.body.email;

  if (!email) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Errore - Cancellazione Dati</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          h1 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1>Email non specificata</h1>
        <p>Per procedere con la cancellazione dei dati, è necessario specificare un indirizzo email.</p>
        <a href="/">Torna alla home</a>
      </body>
      </html>
    `);
  }

  try {
    // Rimuovi l'email da Google Sheets
    await removeFromGoogleSheets(email);

    // Pagina di conferma
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dati Cancellati</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 { color: #2e2e38; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .success-icon { font-size: 64px; color: #4caf50; margin-bottom: 20px; }
          .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #d4af37;
            color: #2e2e38;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Dati Cancellati con Successo</h1>
          <p>I tuoi dati associati all'email <strong>${email}</strong> sono stati rimossi dal nostro database.</p>
          <p>Non riceverai più comunicazioni da parte nostra.</p>
          <p>Grazie per averci dato fiducia.</p>
          <a href="/" class="button">Torna alla home</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Errore unsubscribe:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Errore</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          h1 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1>Errore</h1>
        <p>Si è verificato un errore durante la cancellazione dei dati. Riprova più tardi o contattaci direttamente.</p>
        <a href="/">Torna alla home</a>
      </body>
      </html>
    `);
  }
}

async function removeFromGoogleSheets(email) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Leggi tutte le righe
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Leads!A:F',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return;
    }

    // Trova la riga con l'email e cancellala
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][2] === email) { // La colonna C (index 2) contiene l'email
        await sheets.spreadsheets.values.clear({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: `Leads!A${i + 1}:F${i + 1}`,
        });
      }
    }
  } catch (error) {
    console.error('Errore rimozione da Google Sheets:', error);
    throw error;
  }
}
