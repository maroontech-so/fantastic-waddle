import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // API Route to securely dispatch emails via Resend
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required parameters: to, subject, html" });
    }

    const apiKey = process.env.RESEND_API_KEY || "re_JpiqwqpZ_GAK48avCX4GtfYtrYw5khDLV";

    try {
      const recipients = Array.isArray(to) ? to : [to];
      const results = [];

      for (const recipient of recipients) {
        if (!recipient || !recipient.includes("@")) continue;

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "AdvocoDe Network <no-reply@advocade.studenthubmku.xyz>",
            to: recipient,
            subject: subject,
            html: html
          })
        });

        const data = await response.json();
        results.push({ recipient, status: response.status, data });
      }

      res.json({ success: true, results });
    } catch (error: any) {
      console.error("Resend API Email Dispatch Error:", error);
      res.status(500).json({ error: error.message || "Internal email server failure" });
    }
  });

  // Integrate Vite Dev Server Middleware or Serve Compiled Static Assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AdvocoDe Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
