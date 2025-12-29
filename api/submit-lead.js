import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Configurazione CORS per Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, company, role, articleTitle, pdfUrl, gdprConsent } = req.body;

    // Validazione dati
    if (!name || !email || !articleTitle || !pdfUrl || !gdprConsent) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email non valida' });
    }

    // 1. Salva su Google Sheets (se consenso dato)
    if (gdprConsent) {
      await saveToGoogleSheets({ name, email, company, role, articleTitle, timestamp: new Date().toISOString() });
    }

    // 2. Invia email all'utente
    await sendEmailToUser({ name, email, articleTitle, pdfUrl });

    // 3. Invia notifica a te (opzionale)
    await sendNotificationToOwner({ name, email, company, role, articleTitle });

    return res.status(200).json({
      success: true,
      message: 'Lead salvato con successo',
      downloadUrl: pdfUrl
    });

  } catch (error) {
    console.error('Errore submit-lead:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

// Funzione per salvare su Google Sheets
async function saveToGoogleSheets(data) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Leads!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          data.timestamp,
          data.name,
          data.email,
          data.company || '',
          data.role || '',
          data.articleTitle
        ]],
      },
    });
  } catch (error) {
    console.error('Errore Google Sheets:', error);
    throw error;
  }
}

// Funzione per inviare email all'utente
async function sendEmailToUser({ name, email, articleTitle, pdfUrl }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"All you need is thought" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Il tuo documento: ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #2e2e38; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2e2e38; color: #d4af37; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 15px 30px; background-color: #d4af37; color: #2e2e38; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .footer a { color: #d4af37; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>All you need is thought</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name}!</h2>
            <p>Grazie per il tuo interesse. Ecco il documento che hai richiesto:</p>
            <h3>${articleTitle}</h3>
            <p style="text-align: center;">
              <a href="${pdfUrl}" class="button">Scarica il PDF</a>
            </p>
            <p>Se il download non parte automaticamente, puoi usare il link qui sopra.</p>
            <p>Buona lettura!</p>
          </div>
          <div class="footer">
            <p>Hai ricevuto questa email perché hai richiesto il download di un documento.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL.trim()}/privacy-policy">Privacy Policy</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL.trim()}/api/unsubscribe?email=${encodeURIComponent(email)}">Cancella i miei dati</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Funzione per notifica al proprietario
async function sendNotificationToOwner({ name, email, company, role, articleTitle }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `Nuovo lead: ${name} - ${articleTitle}`,
    html: `
      <h2>Nuovo lead generato</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Azienda:</strong> ${company || 'N/A'}</p>
      <p><strong>Ruolo:</strong> ${role || 'N/A'}</p>
      <p><strong>Documento:</strong> ${articleTitle}</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
