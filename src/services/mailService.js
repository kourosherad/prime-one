/**
 * Mail service. Uses Nodemailer in production; in development (MAIL_TRANSPORT=console)
 * it logs the rendered email to the console so flows (verify, reset) work without SMTP.
 */
const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (env.mail.transport === 'console') {
    transporter = {
      sendMail: async (opts) => {
        logger.info(`\n[MAIL:console] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text || opts.html || ''}\n`);
        return { messageId: 'console-' + Date.now() };
      },
    };
  } else {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
    });
  }
  return transporter;
};

const send = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  return t.sendMail({
    from: `"${env.mail.fromName}" <${env.mail.from}>`,
    to,
    subject,
    text,
    html,
  });
};

// Templated emails. Each returns a Promise.
const verifyEmail = (to, { name, link }) =>
  send({
    to,
    subject: 'تأیید ایمیل — Prime One',
    text: `${name || 'کاربر گرامی'}،\nبرای تأیید ایمیل روی لینک زیر کلیک کنید:\n${link}`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial"><h2>Prime One</h2><p>${name || 'کاربر گرامی'}،</p><p>برای تأیید ایمیل روی دکمه زیر کلیک کنید:</p><p><a href="${link}" style="background:#FFB300;color:#000;padding:10px 20px;border-radius:10px;text-decoration:none">تأیید ایمیل</a></p></div>`,
  });

const resetPassword = (to, { name, link }) =>
  send({
    to,
    subject: 'بازیابی رمز عبور — Prime One',
    text: `${name || 'کاربر گرامی'}،\nبرای تنظیم رمز عبور جدید روی لینک زیر کلیک کنید:\n${link}`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial"><h2>Prime One</h2><p>${name || 'کاربر گرامی'}،</p><p>برای تنظیم رمز عبور جدید روی دکمه زیر کلیک کنید:</p><p><a href="${link}" style="background:#FFB300;color:#000;padding:10px 20px;border-radius:10px;text-decoration:none">بازیابی رمز عبور</a></p></div>`,
  });

const orderConfirmation = (to, { name, orderNumber, total }) =>
  send({
    to,
    subject: `تأیید سفارش ${orderNumber} — Prime One`,
    text: `${name || 'کاربر گرامی'}، سفارش شما با شماره ${orderNumber} ثبت شد. مبلغ: ${total} تومان.`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial"><h2>Prime One</h2><p>${name || 'کاربر گرامی'}،</p><p>سفارش شما با شماره <b>${orderNumber}</b> با موفقیت ثبت شد.</p><p>مبلغ پرداختی: <b>${total} تومان</b></p></div>`,
  });

module.exports = { mailService: { send, verifyEmail, resetPassword, orderConfirmation } };
