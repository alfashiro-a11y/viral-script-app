export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tidak ada respon dari Gemini";

    res.status(200).json({ result: output });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
