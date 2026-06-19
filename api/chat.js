export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
  }

  try {
    const { message, contents, systemInstruction, generationConfig } = req.body;

    // The user explicitly requested to call the gemini-pro endpoint:
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    // Construct the payload for Gemini API
    // We prefer `contents` if sent (for chat history), else fallback to creating it from `message`
    let geminiPayload = {
      contents: contents || [{ role: "user", parts: [{ text: message || "Hello" }] }]
    };

    if (systemInstruction) {
      geminiPayload.systemInstruction = systemInstruction;
    }
    if (generationConfig) {
      geminiPayload.generationConfig = generationConfig;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
