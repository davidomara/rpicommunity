import { createHash, randomBytes } from "node:crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { withAppUrl } from "@/lib/app-path";

const RESET_TOKEN_TTL_HOURS = 1;
const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() || "";
const RESET_EMAIL_FROM =
  process.env.RESET_EMAIL_FROM?.trim() ||
  process.env.EMAIL_FROM?.trim() ||
  "";
const RESET_URL_BASE = withAppUrl("/reset-password");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim().toLowerCase();
}

function getEmailDomain(value: string) {
  const address = extractEmailAddress(value);
  return address.split("@")[1] || "";
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isPasswordResetEmailConfigured() {
  return Boolean(
    RESEND_API_KEY &&
    RESET_EMAIL_FROM &&
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(RESET_URL_BASE)
  );
}

export function getPasswordResetEmailConfigError() {
  if (isPasswordResetEmailConfigured()) return "";
  return "Password reset email is not configured. Set RESEND_API_KEY, RESET_EMAIL_FROM, and APP_URL.";
}

export function getPasswordResetDeliveryErrorMessage(error: unknown) {
  const fallback = "Unable to send the password reset email right now. Please try again later.";

  if (!(error instanceof Error)) return fallback;

  const details = error.message.toLowerCase();
  if (details.includes("domain is not verified")) {
    const senderDomain = getEmailDomain(RESET_EMAIL_FROM);
    return senderDomain
      ? `Password reset email is blocked because the sender domain ${senderDomain} is not verified in Resend. Verify that domain in Resend, or change RESET_EMAIL_FROM to a verified sender.`
      : "Password reset email is blocked because the sender domain is not verified in Resend. Verify the domain in Resend, or change RESET_EMAIL_FROM to a verified sender.";
  }

  if (details.includes("403") && details.includes("resend.dev")) {
    return "Resend rejected the sender address. The resend.dev test sender only works in limited testing. Use a verified domain in RESET_EMAIL_FROM for normal password reset emails.";
  }

  return fallback;
}

export async function issuePasswordResetToken(userId: string) {
  const now = new Date();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = addHours(now, RESET_TOKEN_TTL_HOURS);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      expiresAt: { lt: now }
    }
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt
    }
  });

  return {
    rawToken,
    tokenHash,
    expiresAt,
    resetUrl: withAppUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`)
  };
}

export async function revokeOtherPasswordResetTokens(userId: string, tokenHash: string) {
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
      NOT: {
        token: tokenHash
      }
    },
    data: {
      usedAt: new Date()
    }
  });
}

export async function getValidPasswordResetToken(rawToken: string) {
  if (!rawToken) return null;

  const token = await prisma.passwordResetToken.findUnique({
    where: { token: hashPasswordResetToken(rawToken) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return null;
  }

  return token;
}

export async function revokePasswordResetToken(tokenHash: string) {
  await prisma.passwordResetToken.deleteMany({
    where: { token: tokenHash }
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresAt
}: {
  to: string;
  name: string;
  resetUrl: string;
  expiresAt: Date;
}) {
  const escapedName = escapeHtml(name);
  const escapedResetUrl = escapeHtml(resetUrl);
  const expiryText = expiresAt.toLocaleString("en-UG", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: RESET_EMAIL_FROM,
      to: [to],
      subject: "Reset your RPIC Community password",
      text: [
        `Hello ${name},`,
        "",
        "We received a request to reset your RPIC Community password.",
        `Open this link to choose a new password: ${resetUrl}`,
        "",
        `This link expires on ${expiryText}.`,
        "",
        "If you did not request this, you can ignore this email."
      ].join("\n"),
      html: [
        "<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#0f172a\">",
        `<p>Hello ${escapedName},</p>`,
        "<p>We received a request to reset your RPIC Community password.</p>",
        `<p><a href="${escapedResetUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:600">Reset password</a></p>`,
        `<p>If the button does not work, copy this link into your browser:<br /><a href="${escapedResetUrl}">${escapedResetUrl}</a></p>`,
        `<p>This link expires on ${escapeHtml(expiryText)}.</p>`,
        "<p>If you did not request this, you can ignore this email.</p>",
        "</div>"
      ].join("")
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email delivery failed: ${response.status} ${errorText}`);
  }
}
