import OpenAI from 'openai';

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

const LANG_NAMES = { en: 'English', yo: 'Yoruba', ha: 'Hausa', ig: 'Igbo' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, fromLang, toLang } = req.body;
  if (!text || !fromLang || !toLang) return res.status(400).json({ error: 'Missing fields' });

  if (fromLang === toLang) return res.status(200).json({ translated: text });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const from   = LANG_NAMES[fromLang] || fromLang;
  const to     = LANG_NAMES[toLang]   || toLang;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional Nigerian language translator. Translate the user's text from ${from} to ${to}. Return ONLY the translated text — no explanations, no quotes, no extra words.`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const translated = completion.choices[0].message.content.trim();
    return res.status(200).json({ translated });
  } catch (err) {
    console.error('Translation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
