// backend/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

exports.sendSubmissionNotification = async (toEmail, siteTitle, formData) => {
    const { name, email, subject, message } = formData;

    const html = `
        <h2>Нова заявка з сайту "${siteTitle}"</h2>
        <p><strong>Від:</strong> ${name} (${email})</p>
        <p><strong>Тема:</strong> ${subject || 'Без теми'}</p>
        <hr>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Ви можете переглянути цю заявку в панелі керування вашим сайтом.</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: `Нова заявка з форми на сайті "${siteTitle}"`,
            html: html,
        });
        console.log('Email-сповіщення успішно надіслано до:', toEmail);
    } catch (error) {
        console.error('Помилка надсилання email-сповіщення:', error);
    }
};