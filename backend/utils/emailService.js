// backend/utils/emailService.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const siteColors = { blue: '#3182ce', green: '#38a169', orange: '#dd6b20', red: '#e53e3e', purple: '#805ad5', yellow: '#d69e2e', lime: '#8cc152', gray: '#718096' };
const getAccentHex = (colorName) => siteColors[colorName] || siteColors.blue;
const platformAccent = '#4299e1';
const platformDanger = '#ef4444';
const FROM_EMAIL = 'Kendr <info@kendr.online>';

exports.sendSubmissionNotification = async (toEmail, siteTitle, formData) => {
    const { name, email, subject, message } = formData;
    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
                    <h1 style="color: #0f172a; font-size: 20px; margin: 0;">Нова заявка з сайту "${siteTitle}"</h1>
                </div>
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; font-size: 15px;"><strong>Від:</strong> ${name} (<a href="mailto:${email}" style="color: ${platformAccent};">${email}</a>)</p>
                    <p style="margin: 0; font-size: 15px;"><strong>Тема:</strong> ${subject || 'Без теми'}</p>
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
            from: FROM_EMAIL, to: toEmail, subject: `Нова заявка з форми на сайті "${siteTitle}"`, html: html,
        });
        if (error) console.error('Помилка Resend API (Submission):', error);
    } catch (error) {
        console.error('Критична помилка надсилання email-сповіщення:', error);
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
                    <h2 style="color: ${accentHex}; font-size: 24px; margin: 0 0 12px 0;">Дякуємо за покупку, ${customerName}!</h2>
                    <p style="font-size: 16px; color: #475569; margin: 0; line-height: 1.5;">Оплата успішно підтверджена. Ваші матеріали готові до використання.</p>
                </div>
                <div>${itemsHtml}</div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6; text-align: center;">
                    Це автоматичний лист.<br>Якщо у вас виникли проблеми з доступом до матеріалів, зверніться до продавця.
                </p>
            </div>
        </div>
    `;
    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL, to: toEmail, subject: 'Ваші цифрові товари готові!', html: html,
        });
        if (error) console.error('Помилка Resend API (Digital Goods):', error);
    } catch (error) {
        console.error('Помилка надсилання цифрових товарів на email:', error);
    }
};

exports.sendAccountBannedEmail = async (toEmail, username, isDeleted = false) => {
    const title = isDeleted ? 'Акаунт видалено' : 'Акаунт заблоковано';
    const actionText = isDeleted ? 'було остаточно видалено' : 'було назавжди заблоковано';
    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border-top: 6px solid ${platformDanger}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Увага, ${username}</h1>
                </div>
                <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; border: 1px solid #fecaca; margin-bottom: 24px; text-align: center;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #991b1b; font-weight: 500;">
                        Ваш акаунт на платформі Kendr ${actionText}.
                    </p>
                </div>
                <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                    Цей захід був вжитий адміністрацією платформи через порушення Умов використання або систематичні скарги.
                    Всі ваші сайти, завантажені медіафайли та персональні дані ${isDeleted ? 'видалені без можливості відновлення' : 'більше не доступні в мережі'}.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            </div>
        </div>
    `;
    try {
        await resend.emails.send({ from: FROM_EMAIL, to: toEmail, subject: `Важливе сповіщення: ${title} | Kendr`, html: html });
    } catch (error) { console.error('Помилка надсилання листа про блокування акаунту:', error); }
};

exports.sendSiteBannedEmail = async (toEmail, siteTitle, reason) => {
    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border-top: 6px solid #f59e0b; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #0f172a; font-size: 22px; margin: 0;">Ваш сайт призупинено</h1>
                </div>
                <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px;">
                    Повідомляємо, що ваш сайт <strong>"${siteTitle}"</strong> був заблокований або видалений адміністратором платформи.
                </p>
                <div style="background-color: #fffbeb; border-radius: 12px; padding: 20px; border: 1px solid #fde68a; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 15px; color: #92400e;"><strong>Причина:</strong> ${reason || 'Порушення правил платформи'}</p>
                </div>
                <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                    Якщо ви отримаєте 3 страйки (блокування сайтів), ваш обліковий запис буде назавжди заблоковано. Будь ласка, перегляньте правила нашої платформи.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${clientUrl}/admin/support" style="display: inline-block; background-color: #475569; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px;">
                        Оскаржити в Підтримці
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Kendr Administration Team</p>
            </div>
        </div>
    `;
    try {
        await resend.emails.send({ from: FROM_EMAIL, to: toEmail, subject: `Увага: Ваш сайт "${siteTitle}" призупинено | Kendr`, html: html });
    } catch (error) { console.error('Помилка надсилання листа про блокування сайту:', error); }
};

exports.sendOtpEmail = async (toEmail, code, purpose) => {
    let title = '';
    let message = '';
    let highlightColor = platformAccent;
    if (purpose === 'VERIFY_EMAIL') {
        title = 'Підтвердження пошти';
        message = 'Ваш код для завершення реєстрації на платформі Kendr:';
    } else if (purpose === '2FA') {
        title = 'Підтвердження входу';
        message = 'Ви намагаєтесь увійти до панелі адміністратора. Ваш код:';
        highlightColor = '#e53e3e';
    } else if (purpose === 'RESET_PASSWORD') {
        title = 'Відновлення пароля';
        message = 'Ви надіслали запит на скидання пароля. Ваш код підтвердження:';
        highlightColor = '#d69e2e';
    } else {
        return;
    }

    const html = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #0f172a; font-size: 22px; margin: 0;">${title}</h2>
                </div>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px; text-align: center;">
                    ${message}
                </p>
                <div style="text-align: center; margin: 24px 0;">
                    <div style="display: inline-block; background-color: #f8fafc; color: ${highlightColor}; padding: 16px 32px; border-radius: 12px; font-size: 34px; font-weight: bold; letter-spacing: 8px; border: 1px solid #e2e8f0;">
                        ${code}
                    </div>
                </div>
                <p style="font-size: 14px; color: #64748b; text-align: center; font-weight: 500;">
                    Код дійсний протягом обмеженого часу. Нікому його не повідомляйте.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                    Якщо ви не виконували цю дію, просто проігноруйте цей лист.
                </p>
            </div>
        </div>
    `;
    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            subject: `${title} | Kendr`,
            html: html,
        });
        if (error) console.error(`Помилка Resend API (${purpose}):`, error);
    } catch (error) {
        console.error(`Помилка відправки OTP коду (${purpose}):`, error);
    }
};