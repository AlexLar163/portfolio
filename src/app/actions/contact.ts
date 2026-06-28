"use server";

import { Resend } from "resend";

export type ContactState = {
  status: "idle" | "success" | "error";
  reason?: "invalid" | "config" | "send";
} | null;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("company") || "").trim()) {
    return { status: "success" };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 5) {
    return { status: "error", reason: "invalid" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — email not sent.");
    return { status: "error", reason: "config" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO || "alexlar163@gmail.com"],
      replyTo: email,
      subject: `Portfolio · nuevo mensaje de ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });
    return { status: "success" };
  } catch (error) {
    console.error("[contact] send failed", error);
    return { status: "error", reason: "send" };
  }
}
