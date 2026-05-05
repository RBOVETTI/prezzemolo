import nodemailer from 'nodemailer';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { articleTitle, pdfUrl, message, leads } = req.body || {};

  if (!articleTitle || !pdfUrl || !message || !Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    for (const lead of leads) {
      await sendUpdateEmail(transporter, { ...lead, articleTitle, pdfUrl, message });
    }
    return res.status(200).json({ sent: leads.length });
  } catch (error) {
    console.error('Errore send-update:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

async function sendUpdateEmail(transporter, { name, email, articleTitle, pdfUrl, message }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://writing.rbovetti.com';

  await transporter.sendMail({
    from: `"All you need is thought" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Aggiornamento disponibile: ${articleTitle}`,
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
          .update-box { background-color: #fff; border-left: 4px solid #d4af37; padding: 15px 20px; margin: 20px 0; }
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
            <p>Abbiamo aggiornato il documento che hai scaricato:</p>
            <h3>${articleTitle}</h3>
            <div class="update-box">
              <p>${message}</p>
            </div>
            <p style="text-align: center;">
              <a href="${pdfUrl}" class="button">Scarica la versione aggiornata</a>
            </p>
          </div>
          <div class="footer">
            <p>Hai ricevuto questa email perché hai in precedenza scaricato questo documento.</p>
            <p>
              <a href="${siteUrl}/privacy-policy">Privacy Policy</a> |
              <a href="${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}">Cancella i miei dati</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
