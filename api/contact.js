const nodemailer = require("nodemailer");

// Vercel serverless function. Set SMTP_USER and SMTP_PASS (Gmail app password)
// in the Vercel project's Environment Variables.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS = {
  project: "Project Inquiry",
  job: "Job Opportunity",
  collaboration: "Collaboration",
  other: "Other",
};

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const subject = SUBJECTS[body.subject] || "Other";
  const message = String(body.message || "").trim().slice(0, 5000);

  if (!name || !message || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Please fill in all fields with a valid email." });
    return;
  }

  const user = process.env.SMTP_USER;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: process.env.SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${user}>`,
      to: user,
      replyTo: `"${name.replace(/"/g, "")}" <${email}>`,
      subject: `[Portfolio] ${subject} - ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `<p><b>Name:</b> ${escapeHtml(name)}<br><b>Email:</b> ${escapeHtml(email)}<br><b>Subject:</b> ${subject}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("sendMail failed:", err);
    res.status(500).json({ error: "Could not send your message. Please email me directly." });
  }
};
