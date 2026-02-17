export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/ISI_VOICE_ID_KAMU",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          output_format: "pcm_44100",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const audioBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "no-store");

    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
