// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
    } catch (error) {
        console.error('Помилка надсилання email-сповіщення:', error);
    }
};

exports.sendVerificationEmail = async (toEmail, token) => {
    const link = `${clientUrl}/verify-email?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4299e1;">Ласкаво просимо до Kendr!</h2>
            <p>Дякуємо за реєстрацію. Щоб активувати ваш акаунт, будь ласка, підтвердіть вашу електронну пошту.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Підтвердити Email</a>
            </div>
            <p style="color: #718096; font-size: 14px;">Або перейдіть за посиланням: <br> <a href="${link}">${link}</a></p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: 'Підтвердження реєстрації на Kendr',
            html: html,
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

exports.sendPasswordResetEmail = async (toEmail, token) => {
    const link = `${clientUrl}/reset-password?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #ed8936; text-align: center;">Відновлення пароля</h2>
            <p>Ми отримали запит на скидання пароля для вашого акаунту Kendr.</p>
            <p>Якщо це були не ви, просто проігноруйте цей лист.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Скинути пароль</a>
            </div>
            <p style="color: #718096; font-size: 14px;">Або перейдіть за посиланням: <br> <a href="${link}">${link}</a></p>
            <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">Посилання дійсне протягом 1 години.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: 'Відновлення пароля Kendr',
            html: html,
        });
    } catch (error) {
        console.error('Error sending reset email:', error);
        throw error;
    }
};