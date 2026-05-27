import nodemailer from "nodemailer";

let cachedTransporter;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for production email delivery`);
  return value;
}

async function createTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.NODE_ENV === "production") {
    cachedTransporter = nodemailer.createTransport({
      host: requireEnv("SMTP_HOST"),
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: requireEnv("SMTP_USER"),
        pass: requireEnv("SMTP_PASS")
      }
    });
    return cachedTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return cachedTransporter;
}

export async function sendRegistrationOtp(email, otp) {
  const transporter = await createTransporter();
  const from = process.env.MAIL_FROM || "Complaint to Action <no-reply@complaint-to-action.local>";
  const info = await transporter.sendMail({
    from,
    to: email,
    subject: "Verify your Complaint to Action account",
    text: `Your Complaint to Action verification OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your Complaint to Action verification OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`Registration OTP preview: ${previewUrl}`);

  return { messageId: info.messageId, previewUrl };
}
