const OpenAI = require('openai');

module.exports.config = { api: { bodyParser: { sizeLimit: '10mb' } } };

const WHISPER_LANG = { en: 'en', yo: 'yo', ha: 'ha', ig: 'ig' };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { audio, language, mimeType } = req.body;
  if (!audio) return res.status(400).json({ error: 'No audio provided' });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { toFile } = OpenAI;

    const buffer = Buffer.from(audio, 'base64');
    const ext    = mimeType?.includes('mp4') ? 'mp4' : mimeType?.includes('ogg') ? 'ogg' : 'webm';
    const file   = await toFile(buffer, `audio.${ext}`, { type: mimeType || 'audio/webm' });

    const result = await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: WHISPER_LANG[language] || 'en',
    });

    return res.status(200).json({ text: result.text });
  } catch (err) {
    console.error('Whisper error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '10mb' } } };
