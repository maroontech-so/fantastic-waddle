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
      let overallSuccess = true;

      for (const recipient of recipients) {
        if (!recipient || !recipient.includes("@")) continue;

        console.log(`[Email Dispatch] Commencing multi-stage dispatch for: ${recipient}`);

        const sendersToTry = [
          { name: "Root Domain", address: "AdvocoDe <no-reply@studenthubmku.xyz>" },
          { name: "Subdomain", address: "AdvocoDe <no-reply@advocade.studenthubmku.xyz>" },
          { name: "Resend Onboarding Sandbox", address: "AdvocoDe <onboarding@resend.dev>" }
        ];

        const attempts = [];
        let recipientSuccess = false;
        let successfulFrom = null;
        let finalResponseData = null;
        let finalResponseStatus = 500;

        for (const sender of sendersToTry) {
          console.log(`[Email Dispatch] Trying sender "${sender.name}": ${sender.address}`);
          try {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: sender.address,
                to: recipient,
                subject: subject,
                html: html
              })
            });

            const status = response.status;
            const data = await response.json();
            console.log(`[Email Dispatch] Sender "${sender.name}" returned status ${status}:`, data);

            attempts.push({
              senderType: sender.name,
              fromAddress: sender.address,
              status,
              data
            });

            finalResponseStatus = status;
            finalResponseData = data;

            if (status >= 200 && status < 300) {
              recipientSuccess = true;
              successfulFrom = sender.address;
              break; // Stop trying subsequent senders if one succeeds!
            }
          } catch (senderErr: any) {
            console.error(`[Email Dispatch] Error trying sender "${sender.name}":`, senderErr);
            attempts.push({
              senderType: sender.name,
              fromAddress: sender.address,
              status: "Fetch Exception",
              data: { error: senderErr.message || "Failed to communicate with Resend API" }
            });
          }
        }

        if (!recipientSuccess) {
          overallSuccess = false;
        }

        results.push({
          recipient,
          success: recipientSuccess,
          status: finalResponseStatus,
          fromUsed: successfulFrom || "None succeeded",
          data: finalResponseData,
          attempts
        });
      }

      res.json({
        success: overallSuccess,
        results,
        message: overallSuccess 
          ? "All emails dispatched successfully." 
          : "Some or all email dispatches failed. Look at 'attempts' in the diagnostic results for details."
      });
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
