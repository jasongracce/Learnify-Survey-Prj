import { Resend } from "resend";

const DEFAULT_FROM = "Learnify Team <noreply@learnify.academy>";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY!);
  }
  return resendClient;
}

function isEnabled(): boolean {
  if (!process.env.RESEND_API_KEY) return false;
  if (process.env.EMAIL_ENABLED === "false") return false;
  return true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SUBJECT =
  "Thanks for your feedback — Learnify beta / ขอบคุณสำหรับความคิดเห็นของคุณ";

function buildText(name: string): string {
  return `Hi ${name},

Thanks for taking the time to share your feedback on Learnify — it
genuinely helps us shape what we build next.

You're now on the early access list for our beta. We're targeting
June 2026 for the first invites, and we'll email you then with
access details. No action needed from you in the meantime.

— The Learnify Team

--------

สวัสดีค่ะ ${name},

ขอบคุณที่สละเวลาแบ่งปันความคิดเห็นเกี่ยวกับ Learnify ให้พวกเรา — คำตอบ
ของคุณช่วยให้ทีมเราพัฒนาผลิตภัณฑ์ได้ดียิ่งขึ้น

ตอนนี้คุณอยู่ในรายชื่อผู้ทดลองใช้งานตัวทดลอง (รุ่นเบต้า) แล้ว เราตั้งเป้าที่จะเปิดให้
ทดลองใช้งานในเดือนมิถุนายน 2569 จะมีส่งอีเมลแจ้งรายละเอียด
การเข้าใช้งานส่งให้เมื่อตอนนั้นมาถึง ระหว่างรอนี้ยังไม่ต้องดำเนินการใดๆ เราจะกลับมาเร็วๆ นี้!

— ทีม Learnify
`;
}

function buildHtml(name: string): string {
  const safeName = escapeHtml(name);
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;line-height:1.55;font-size:15px;">
      <p>Hi ${safeName},</p>
      <p>Thanks for taking the time to share your feedback on Learnify — it genuinely helps us shape what we build next.</p>
      <p>You're now on the early access list for our beta. We're targeting <strong>June 2026</strong> for the first invites, and we'll email you then with access details. No action needed from you in the meantime.</p>
      <p>— The Learnify Team</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0;">
      <p>สวัสดีค่ะ ${safeName},</p>
      <p>ขอบคุณที่สละเวลาแบ่งปันความคิดเห็นเกี่ยวกับ Learnify ให้พวกเรา — คำตอบของคุณช่วยให้ทีมเราพัฒนาผลิตภัณฑ์ได้ดียิ่งขึ้น</p>
      <p>ตอนนี้คุณอยู่ในรายชื่อผู้ทดลองใช้งานตัวทดลอง (รุ่นเบต้า) แล้ว เราตั้งเป้าที่จะเปิดให้ทดลองใช้งานในเดือน<strong>มิถุนายน 2569</strong> จะมีส่งอีเมลแจ้งรายละเอียดการเข้าใช้งานส่งให้เมื่อตอนนั้นมาถึง ระหว่างรอนี้ยังไม่ต้องดำเนินการใดๆ เราจะกลับมาเร็วๆ นี้!</p>
      <p>— ทีม Learnify</p>
    </div>
  </body>
</html>`;
}

export async function sendSurveyConfirmation(args: {
  to: string;
  name: string;
}): Promise<void> {
  if (!isEnabled()) {
    console.log("email disabled — skipping send");
    return;
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const resend = getResend();

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: SUBJECT,
    text: buildText(args.name),
    html: buildHtml(args.name),
  });

  if (error) {
    throw new Error(
      `resend error ${error.name} (${error.statusCode ?? "?"}): ${error.message}`,
    );
  }
}
