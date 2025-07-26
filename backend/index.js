const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        inputs: `User: ${userMessage}\nGenie:`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    const reply =
      response.data[0]?.generated_text?.split("Genie:")[1]?.trim() ||
      "Hmm, I'm thinking...";

    res.json({ reply });
  } catch (error) {
    console.error("Hugging Face API Error:", error.message);
    res.status(500).json({ error: "Genie is tired, try again!" });
  }
});

app.listen(PORT, () => {
  console.log(`🧞‍♂️ Genie is running on http://localhost:${PORT}`);
});
