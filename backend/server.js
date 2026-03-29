import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



app.post("/enhance", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ enhanced: "Please enter a prompt" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Improve this prompt for AI image generation" },
        { role: "user", content: text }
      ]
    });

    const enhancedText =
      response?.choices?.[0]?.message?.content || "No response from AI";

    res.json({ enhanced: enhancedText });

  } catch (e) {
    console.error("Enhance Error:", e.message);
    res.json({ enhanced: "Error enhancing text" });
  }
});



app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.json({ image: "" });
    }

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const image_base64 = result?.data?.[0]?.b64_json;

    if (!image_base64) {
      return res.json({ image: "" });
    }

    const imageUrl = `data:image/png;base64,${image_base64}`;

    res.json({ image: imageUrl });

  } catch (e) {
    console.error("Image Error:", e.message);
    res.json({ image: "" });
  }
});



app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ analysis: "Please upload an image" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image and suggest 3 creative variations." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    });

    const analysisText =
      response?.choices?.[0]?.message?.content || "No analysis available";

    
    fs.unlinkSync(req.file.path);

    res.json({ analysis: analysisText });

  } catch (e) {
    console.error("Analysis Error:", e.message);
    res.json({ analysis: "Error analyzing image" });
  }
});


app.listen(5000, () => console.log("Server running on http://localhost:5000"));
