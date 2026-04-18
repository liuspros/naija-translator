const OpenAI = require('openai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const mp3 = await client.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: true } };
