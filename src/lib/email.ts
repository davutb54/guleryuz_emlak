import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@guleryuzgayrimenkul.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://guleryuzgayrimenkul.com";

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <div style="background:#0E2545;border:1px solid rgba(212,167,68,0.15);border-radius:16px;padding:40px;">
        <div style="margin-bottom:32px;">
          <span style="background:#D4A744;color:#0A1628;font-size:13px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:0.1em;">GÜLERYÜZ GAYRİMENKUL</span>
        </div>
        ${body}
        <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:#6B7280;font-size:11px;margin:0;">Bu emaili almak istemiyorsanız profil sayfanızdan aboneliğinizi iptal edebilirsiniz.</p>
          <p style="color:#6B7280;font-size:11px;margin:8px 0 0;">© 2026 Güleryüz Gayrimenkul, Eskişehir</p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCommentApprovedEmail({
  to,
  userName,
  listingTitle,
  listingSlug,
}: {
  to: string;
  userName: string;
  listingTitle: string;
  listingSlug: string;
}) {
  if (!resend) return;

  const listingUrl = `${SITE_URL}/tr/ilan/${listingSlug}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Yorumunuz yayınlandı — Güleryüz Gayrimenkul",
    html: baseTemplate(
      "Yorumunuz yayınlandı",
      `<h1 style="color:#F5F1E8;font-size:24px;font-weight:600;margin:0 0 16px;">Merhaba ${userName},</h1>
      <p style="color:#C0C5CC;font-size:15px;line-height:1.6;margin:0 0 24px;">
        "<strong style="color:#F5F1E8;">${listingTitle}</strong>" ilanına yazdığınız yorum admin tarafından onaylandı ve artık herkese görünür.
      </p>
      <a href="${listingUrl}" style="display:inline-block;background:#D4A744;color:#0A1628;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">İlanı Görüntüle</a>`
    ),
  }).catch((err) => console.error("[email] sendCommentApprovedEmail:", err));
}

export async function sendSearchAlertEmail({
  to,
  userName,
  alertName,
  listings,
}: {
  to: string;
  userName: string;
  alertName: string;
  listings: { title: string; slug: string; price: string; district: string }[];
}) {
  if (!resend || listings.length === 0) return;

  const listingRows = listings
    .map(
      (l) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <a href="${SITE_URL}/tr/ilan/${l.slug}" style="color:#D4A744;font-size:14px;font-weight:600;text-decoration:none;">${l.title}</a>
            <p style="color:#C0C5CC;font-size:12px;margin:4px 0 0;">${l.district} · ${l.price}</p>
          </td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${listings.length} yeni ilan: "${alertName}" — Güleryüz Gayrimenkul`,
    html: baseTemplate(
      `Yeni ilanlar: ${alertName}`,
      `<h1 style="color:#F5F1E8;font-size:24px;font-weight:600;margin:0 0 8px;">Merhaba ${userName},</h1>
      <p style="color:#C0C5CC;font-size:15px;line-height:1.6;margin:0 0 24px;">
        "<strong style="color:#F5F1E8;">${alertName}</strong>" aramanızla eşleşen <strong style="color:#D4A744;">${listings.length} yeni ilan</strong> bulundu.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${listingRows}
      </table>
      <a href="${SITE_URL}/tr/ilanlar" style="display:inline-block;background:#D4A744;color:#0A1628;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">Tüm İlanları Gör</a>`
    ),
  }).catch((err) => console.error("[email] sendSearchAlertEmail:", err));
}
