import { Resend } from "resend";

console.log(process.env.RESEND_API_KEY)
// Initialize Resend with your API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendMail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      // "onboarding@resend.dev" is required by Resend for testing until you verify your domain
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    // Handle API-level errors from Resend
    if (error) {
      console.error("[RESEND ERROR]:", error);
      return { success: false, error };
    }

    // Success
    console.log(`[EMAIL SENT] ID: ${data?.id} | To: ${to}`);
    return { success: true, data };
  } catch (err) {
    // Handle network or unexpected code errors
    console.error("[EMAIL EXCEPTION]:", err);
    return { success: false, error: err };
  }
}
