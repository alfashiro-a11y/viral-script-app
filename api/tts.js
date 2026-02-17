export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text kosong" });
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/6cd1df740eb2408696be0a3f6957bb09",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          output_format: "wav",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: errText });
    }

    const audioBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "no-cache");

    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
