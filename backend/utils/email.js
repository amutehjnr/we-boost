// utils/email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'WeBoost <onboarding@resend.dev>';

// Every send is wrapped so a failed email never breaks the calling
// request (an order/task/withdrawal action should still succeed even
// if the notification email fails to send).
const send = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error(`Email send failed (${subject} -> ${to}):`, error);
  }
};

const wrapper = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #dc2626;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #888;">— WeBoost</p>
  </div>
`;

exports.sendVerificationEmail = (to, fullName, verifyUrl) =>
  send({
    to,
    subject: 'Verify your email — WeBoost',
    html: wrapper('Confirm your email', `
      <p>Hi ${fullName},</p>
      <p>Thanks for signing up! Please confirm this is really your email address by clicking below:</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Verify My Email
        </a>
      </p>
      <p style="font-size: 13px; color: #888;">This link expires in 24 hours. Some features, like withdrawals, require a verified email.</p>
    `)
  });

exports.sendWelcomeEmail = (to, fullName) =>
  send({
    to,
    subject: 'Welcome to WeBoost 🎉',
    html: wrapper('Welcome to WeBoost!', `
      <p>Hi ${fullName},</p>
      <p>Your email is verified and your account is fully set up. You can now place orders, complete tasks, and withdraw earnings.</p>
    `)
  });

exports.sendTaskVerifiedEmail = (to, fullName, { approved, reward, platform, taskType, verificationNotes }) =>
  send({
    to,
    subject: approved ? 'Task approved — you got paid!' : 'Task rejected',
    html: wrapper(
      approved ? 'Task Approved ✅' : 'Task Rejected',
      approved
        ? `<p>Hi ${fullName},</p><p>Your ${platform} ${taskType} task was approved. ₦${Number(reward).toLocaleString()} has been added to your wallet.</p>`
        : `<p>Hi ${fullName},</p><p>Your ${platform} ${taskType} task was rejected.</p>${verificationNotes ? `<p>Reason: ${verificationNotes}</p>` : ''}`
    )
  });

exports.sendWithdrawalStatusEmail = (to, fullName, { status, amount, reason }) =>
  send({
    to,
    subject: status === 'Completed' ? 'Withdrawal sent' : 'Withdrawal rejected',
    html: wrapper(
      status === 'Completed' ? 'Withdrawal Sent 💸' : 'Withdrawal Rejected',
      status === 'Completed'
        ? `<p>Hi ${fullName},</p><p>Your withdrawal of ₦${Number(amount).toLocaleString()} has been sent to your bank account.</p>`
        : `<p>Hi ${fullName},</p><p>Your withdrawal of ₦${Number(amount).toLocaleString()} was rejected and refunded to your wallet.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}`
    )
  });

exports.sendPaymentSuccessEmail = (to, fullName, amount) =>
  send({
    to,
    subject: 'Wallet funded successfully',
    html: wrapper('Payment Received', `
      <p>Hi ${fullName},</p>
      <p>₦${Number(amount).toLocaleString()} has been added to your wallet.</p>
    `)
  });

exports.sendAdminWithdrawalAlertEmail = ({ fullName, amount, bankName, accountNumber }) => {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  if (!adminEmail) return;
  return send({
    to: adminEmail,
    subject: `New withdrawal request — ₦${Number(amount).toLocaleString()}`,
    html: wrapper('New Withdrawal Request', `
      <p>${fullName} requested a withdrawal of ₦${Number(amount).toLocaleString()}.</p>
      <p>Bank: ${bankName} — ${accountNumber}</p>
      <p>Review it in the admin panel under Withdrawals.</p>
    `)
  });
};