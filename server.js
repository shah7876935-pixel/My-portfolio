require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = 3000;

// OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Website files
// Only the public front-end assets below are served. Server-side source,
// package manifests, docs and .env must never be reachable over HTTP.
const PUBLIC_FILES = new Set(["index.html", "style.css", "script.js"]);

app.use((req, res, next) => {

    // API routes are handled further down and must pass through
    if (req.path === "/api" || req.path.startsWith("/api/")) {
        return next();
    }

    const requested = path.basename(decodeURIComponent(req.path));

    if (requested === "" || PUBLIC_FILES.has(requested)) {
        return next();
    }

    res.status(404).send("Not found");

});

app.use(express.static(__dirname, {
    index: "index.html",
    extensions: false,
    dotfiles: "ignore"
}));

// JSON requests
app.use(express.json({ limit: "16kb" }));


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ===============================
// GENERAL AI CHATBOT
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const message = req.body.message;

        // Check message
        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        // Send message to OpenAI
        const response = await client.responses.create({

            model: "gpt-5.6-luna",

            instructions: `
You are a helpful general-purpose AI assistant.

Answer the user's questions clearly, accurately and naturally.

You can help with:
- General knowledge
- Programming
- Web development
- HTML, CSS and JavaScript
- Mathematics
- Science
- Education
- Writing
- Translation
- Technology
- Everyday questions

Keep answers easy to understand.

If the user asks something you are unsure about,
say that you are not certain instead of inventing facts.

Do not claim to have real-time information unless
the required information is actually available to you.
`,

            input: message,

            max_output_tokens: 1500
        });

        // Get AI answer
        const answer = response.output_text;

        // Send answer back to website
        res.json({
            reply: answer
        });

    } catch (error) {

        console.error("OpenAI Error:", error);

        res.status(500).json({
            error: "AI chatbot is temporarily unavailable. Please try again."
        });
    }
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log("   Ahmad Shah Portfolio Website");
    console.log("====================================");
    console.log("");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("AI Chatbot: Ready 🤖");
    console.log("");

});