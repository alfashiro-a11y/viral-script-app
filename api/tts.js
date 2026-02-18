export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text kosong" });
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  contents: [
    {
      parts: [{ text: text }]
    }
  ],
  generationConfig: {
    responseModalities: ["AUDIO"],
    audioConfig: {
      audioEncoding: "LINEAR16"
    }
  }
})
      }
    );

    const data = await response.json();

const audioBase64 =
  data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

if (!audioBase64) {
  console.log(JSON.stringify(data, null, 2));
  return res.status(500).json({ error: "Audio tidak ditemukan" });
}

const audioBuffer = Buffer.from(audioBase64, "base64");

res.setHeader("Content-Type", "audio/wav");
res.send(audioBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
