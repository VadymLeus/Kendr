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

const siteColors = {
    blue: '#3182ce',
    green: '#38a169',
    orange: '#dd6b20',
    red: '#e53e3e',
    purple: '#805ad5',
    yellow: '#d69e2e',
    lime: '#8cc152',
    gray: '#718096'
};

const getAccentHex = (colorName) => {
    return siteColors[colorName] || siteColors.blue;
};

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
            <h2 style="color: #3182ce;">Ласкаво просимо до Kendr!</h2>
            <p>Дякуємо за реєстрацію. Щоб активувати ваш акаунт, будь ласка, підтвердіть вашу електронну пошту.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Підтвердити Email</a>
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
            <h2 style="color: #3182ce; text-align: center;">Відновлення пароля</h2>
            <p>Ми отримали запит на скидання пароля для вашого акаунту Kendr.</p>
            <p>Якщо це були не ви, просто проігноруйте цей лист.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Скинути пароль</a>
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

exports.sendDigitalGoodsEmail = async (toEmail, customerName, digitalItems, siteAccentColor = 'blue') => {
    const accentHex = getAccentHex(siteAccentColor);
    let itemsHtml = digitalItems.map(item => {
        const isUrl = item.digital_file_url.startsWith('http://') || item.digital_file_url.startsWith('https://');
        return `
            <div style="margin-bottom: 24px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h3 style="margin-top: 0; margin-bottom: 16px; color: #1a202c; font-size: 18px; text-align: center; border-bottom: 1px solid #edf2f7; padding-bottom: 12px;">
                    ${item.product_name}
                </h3>
                
                ${isUrl 
                    ? `<div style="text-align: center; margin-top: 24px; margin-bottom: 8px;">
                           <a href="${item.digital_file_url}" style="display: inline-block; background-color: ${accentHex}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                               Переглянути
                           </a>
                       </div>`
                    : `<div style="margin-top: 16px;">
                           <p style="color: #718096; font-size: 14px; margin-bottom: 8px; text-align: center;">Ваш секретний текст або код:</p>
                           <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; border: 1px dashed #cbd5e0; font-family: monospace; word-break: break-all; color: #2d3748; text-align: center; font-size: 16px; font-weight: bold;">
                               ${item.digital_file_url}
                           </div>
                       </div>`
                }
            </div>
        `;
    }).join('');

    const html = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2d3748; background-color: #f8fafc; padding: 32px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="color: ${accentHex}; margin-bottom: 8px; font-size: 24px;">Дякуємо за покупку, ${customerName}!</h2>
                <p style="font-size: 16px; color: #4a5568; margin-top: 0;">Оплата успішно підтверджена. Ваші матеріали готові до використання.</p>
            </div>
            <div>
                ${itemsHtml}
            </div>
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #a0aec0; font-size: 13px; margin: 0; line-height: 1.5;">Це автоматичний лист.<br>Якщо у вас виникли проблеми з доступом до матеріалів, зверніться до продавця.</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: 'Ваші цифрові товари готові!',
            html: html,
        });
        console.log(`Лист з цифровими товарами успішно надіслано на ${toEmail} (Колір теми: ${siteAccentColor})`);
    } catch (error) {
        console.error('Помилка надсилання цифрових товарів на email:', error);
    }
};