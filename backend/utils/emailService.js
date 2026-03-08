// backend/utils/emailService.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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

const platformAccent = '#4299e1';
const FROM_EMAIL = 'Kendr <info@kendr.online>';
exports.sendSubmissionNotification = async (toEmail, siteTitle, formData) => {
    const { name, email, subject, message } = formData;
    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
                    <h1 style="color: #0f172a; font-size: 20px; margin: 0;">Нова заявка з сайту "${siteTitle}" 📥</h1>
                </div>
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; font-size: 15px;"><strong>👤 Від:</strong> ${name} (<a href="mailto:${email}" style="color: ${platformAccent};">${email}</a>)</p>
                    <p style="margin: 0; font-size: 15px;"><strong>📝 Тема:</strong> ${subject || 'Без теми'}</p>
                </div>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; font-size: 16px; line-height: 1.6; color: #1e293b;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
                    Ви можете переглянути всі заявки в панелі керування вашим сайтом на <a href="${clientUrl}" style="color: ${platformAccent}; text-decoration: none; font-weight: 600;">Kendr</a>.
                </p>
            </div>
        </div>
    `;

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            subject: `Нова заявка з форми на сайті "${siteTitle}"`,
            html: html,
        });
        if (error) console.error('Помилка Resend API (Submission):', error);
    } catch (error) {
        console.error('Критична помилка надсилання email-сповіщення:', error);
    }
};

exports.sendVerificationEmail = async (toEmail, token) => {
    const link = `${clientUrl}/verify-email?token=${token}`;
    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Ласкаво просимо до Kendr!</h1>
                </div>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #475569; text-align: center;">
                    Дякуємо за реєстрацію. Щоб активувати ваш акаунт та отримати доступ до всіх можливостей платформи, будь ласка, підтвердіть вашу електронну пошту.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${link}" style="display: inline-block; background-color: ${platformAccent}; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                        Підтвердити Email
                    </a>
                </div>
                <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 0; text-align: center;">
                    Або скопіюйте та вставте це посилання у ваш браузер:<br>
                    <a href="${link}" style="color: ${platformAccent}; word-break: break-all; text-decoration: none; display: inline-block; margin-top: 8px;">${link}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                    Якщо ви не створювали акаунт на Kendr, просто проігноруйте цей лист.
                </p>
            </div>
        </div>
    `;

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            subject: 'Підтвердження реєстрації на Kendr',
            html: html,
        });
        if (error) console.error('Помилка Resend API (Verification):', error);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

exports.sendPasswordResetEmail = async (toEmail, token) => {
    const link = `${clientUrl}/reset-password?token=${token}`;
    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Відновлення пароля</h1>
                </div>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #475569; text-align: center;">
                    Ми отримали запит на скидання пароля для вашого акаунту Kendr. Натисніть кнопку нижче, щоб створити новий пароль.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${link}" style="display: inline-block; background-color: ${platformAccent}; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                        Скинути пароль
                    </a>
                </div>
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="display: inline-block; background-color: #f8fafc; color: #64748b; padding: 8px 16px; border-radius: 20px; font-size: 13px; border: 1px solid #e2e8f0;">
                         Посилання дійсне протягом 1 години
                    </span>
                </div>
                <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 0; text-align: center;">
                    Або перейдіть за посиланням:<br>
                    <a href="${link}" style="color: ${platformAccent}; word-break: break-all; text-decoration: none; display: inline-block; margin-top: 8px;">${link}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                    Якщо ви не робили цього запиту, проігноруйте цей лист – ваш пароль залишиться незмінним.
                </p>
            </div>
        </div>
    `;

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            subject: 'Відновлення пароля Kendr',
            html: html,
        });
        if (error) console.error('Помилка Resend API (Reset Password):', error);
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
                <h3 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 18px; text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
                    ${item.product_name}
                </h3>
                
                ${isUrl 
                    ? `<div style="text-align: center; margin-top: 24px; margin-bottom: 8px;">
                           <a href="${item.digital_file_url}" style="display: inline-block; background-color: ${accentHex}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">
                               Отримати доступ
                           </a>
                       </div>`
                    : `<div style="margin-top: 16px;">
                           <p style="color: #64748b; font-size: 14px; margin-bottom: 12px; text-align: center;">Ваш секретний текст або код:</p>
                           <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px dashed #cbd5e0; font-family: monospace; word-break: break-all; color: #0f172a; text-align: center; font-size: 16px; font-weight: 600;">
                               ${item.digital_file_url}
                           </div>
                       </div>`
                }
            </div>
        `;
    }).join('');

    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="color: ${accentHex}; font-size: 24px; margin: 0 0 12px 0;">Дякуємо за покупку, ${customerName}! 🛍️</h2>
                    <p style="font-size: 16px; color: #475569; margin: 0; line-height: 1.5;">Оплата успішно підтверджена. Ваші матеріали готові до використання.</p>
                </div>
                <div>
                    ${itemsHtml}
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6; text-align: center;">
                    Це автоматичний лист.<br>Якщо у вас виникли проблеми з доступом до матеріалів, зверніться до продавця.
                </p>
            </div>
        </div>
    `;

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            subject: 'Ваші цифрові товари готові!',
            html: html,
        });
        
        if (error) {
            console.error('Помилка Resend API (Digital Goods):', error);
        } else {
            console.log(`Лист з цифровими товарами успішно надіслано на ${toEmail}`);
        }
    } catch (error) {
        console.error('Помилка надсилання цифрових товарів на email:', error);
    }
};