import { google } from 'googleapis';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Leads!A:F',
    });

    const rows = response.data.values || [];

    // Raggruppa per articleTitle (col F), deduplica per email (vince l'entry più recente)
    const grouped = {};
    for (const row of rows) {
      const [, name, email, company, role, articleTitle] = row;
      if (!articleTitle || !email) continue;

      if (!grouped[articleTitle]) grouped[articleTitle] = {};
      grouped[articleTitle][email] = {
        name: name || '',
        email,
        company: company || '',
        role: role || '',
      };
    }

    const result = {};
    for (const [title, emailMap] of Object.entries(grouped)) {
      result[title] = Object.values(emailMap);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Errore get-leads:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}
