/**
 * Placeholder WhatsApp service. In production, integrate with WhatsApp Business API.
 */
export async function sendDischarge({ mobile, text, pdfUrl }) {
  // Stub: no external API call
  return {
    messageId: `stub-${Date.now()}`,
    sentAt: new Date(),
  };
}
