import nodemailer from "nodemailer"

export function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.")
  }
  const port = Number(process.env.SMTP_PORT || 587)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

export async function sendMail(opts: { to: string; subject: string; html: string; from?: string }) {
  const transporter = getTransport()
  const from = opts.from || (process.env.MAIL_FROM as string) || "noreply@example.com"
  await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html })
}
