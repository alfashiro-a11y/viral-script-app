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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text }]
            }
          ],
          generationConfig: {
            responseMimeType: "audio/pcm"
          }
        })
      }
    );

    const data = await response.json();

    const pcmBase64 =
      data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!pcmBase64) {
      return res.status(500).json({ error: "Gagal generate audio", data });
    }

    const pcmBuffer = Buffer.from(pcmBase64, "base64");

    const wav = createWav(pcmBuffer);

    res.setHeader("Content-Type", "audio/wav");
    res.send(wav);

  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}

function createWav(pcmBuffer) {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;

  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmBuffer.length;

  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);

  return buffer;
}
