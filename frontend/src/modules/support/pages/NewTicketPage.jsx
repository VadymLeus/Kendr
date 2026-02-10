// frontend/src/modules/support/pages/NewTicketPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Helmet } from 'react-helmet-async';
import { Send, Info, FileText, ArrowLeft, ShieldAlert, Tag, AlignLeft, AlertCircle, HelpCircle, Wrench, CreditCard, MessageSquare, Handshake } from 'lucide-react';

const TICKET_CATEGORIES = [
    { value: 'general', label: 'Загальні питання', icon: HelpCircle },
    { value: 'technical', label: 'Технічна проблема', icon: Wrench },
    { value: 'billing', label: 'Оплата та тариф', icon: CreditCard },
    { value: 'complaint', label: 'Скарга на контент', icon: MessageSquare },
    { value: 'partnership', label: 'Співпраця', icon: Handshake }
];

const NewTicketPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('general');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const isAppeal = useMemo(() => !!location.state?.site, [location.state]);
    const appealSite = location.state?.site;
    useEffect(() => {
        if (isAppeal && appealSite) {
            setSubject(`Апеляція блокування: ${appealSite.site_path}`);
            setCategory('appeal');
            setBody(
                `Я, власник сайту "${appealSite.title}" (/${appealSite.site_path}), не погоджуюся з рішенням про блокування.\n\n` +
                `Пояснення ситуації:\n[Напишіть тут ваші аргументи]\n\n` +
                `Я зобов'язуюсь усунути порушення, якщо вони будуть підтверджені.`
            );
        }
    }, [isAppeal, appealSite]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) {
            toast.warning('Будь ласка, заповніть всі обов\'язкові поля');
            return;
        }
        setLoading(true);
        try {
            await apiClient.post('/support', { 
                subject, 
                body,
                type: isAppeal ? 'appeal' : category,
                siteId: appealSite?.id
            });

            toast.success('Тікет успішно створено! Очікуйте відповідь.');
            navigate('/support/my-tickets');
        } catch (error) {
            console.error(error);
            toast.error('Не вдалося створити звернення. Спробуйте пізніше.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        header: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        backBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--platform-text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '8px',
            width: 'fit-content'
        },
        titleRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--platform-text-primary)',
            margin: 0
        },
        card: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--platform-text-primary)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        inputWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            background: 'var(--platform-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '8px',
            color: 'var(--platform-text-primary)',
            fontSize: '14px',
            transition: 'all 0.2s',
            outline: 'none'
        },
        appealBanner: {
            background: 'color-mix(in srgb, var(--platform-warning), transparent 95%)',
            border: '1px solid color-mix(in srgb, var(--platform-warning), transparent 80%)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
        },
        infoBanner: {
            background: 'color-mix(in srgb, var(--platform-accent), transparent 95%)',
            border: '1px solid color-mix(in srgb, var(--platform-accent), transparent 80%)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
        }
    };

    return (
        <div style={styles.container}>
            <Helmet>
                <title>{isAppeal ? 'Оскарження блокування' : 'Нове звернення'} | Kendr Support</title>
            </Helmet>
            <div style={styles.header}>
                <div style={styles.backBtn} onClick={() => navigate(-1)} onMouseEnter={e => e.target.style.color = 'var(--platform-text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--platform-text-secondary)'}>
                    <ArrowLeft size={16} />
                    <span>Повернутися назад</span>
                </div>
                
                <div style={styles.titleRow}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: isAppeal ? 'color-mix(in srgb, var(--platform-warning), transparent 90%)' : 'color-mix(in srgb, var(--platform-accent), transparent 90%)',
                        color: isAppeal ? 'var(--platform-warning)' : 'var(--platform-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {isAppeal ? <ShieldAlert size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                        <h1 style={styles.title}>
                            {isAppeal ? 'Оскарження рішення' : 'Створити тікет'}
                        </h1>
                        <p style={{color: 'var(--platform-text-secondary)', marginTop: '4px'}}>
                            {isAppeal 
                                ? 'Заповніть форму для перегляду рішення модерації' 
                                : 'Опишіть проблему, і команда підтримки допоможе вам'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.card}>
                {isAppeal ? (
                    <div style={styles.appealBanner}>
                        <AlertCircle size={20} style={{ color: 'var(--platform-warning)', marginTop: '2px' }} />
                        <div>
                            <div style={{fontWeight: '600', color: 'var(--platform-warning)', marginBottom: '4px'}}>Важлива інформація</div>
                            <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                Це звернення буде прив'язане до сайту <strong>/{appealSite.site_path}</strong>. 
                                Адміністратор перегляне історію змін та причину блокування. 
                                Надання неправдивої інформації може призвести до блокування акаунту.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.infoBanner}>
                        <Info size={20} style={{ color: 'var(--platform-accent)', marginTop: '2px' }} />
                        <div>
                            <div style={{fontWeight: '600', color: 'var(--platform-accent)', marginBottom: '4px'}}>Порада</div>
                            <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                Для швидшого вирішення питання додайте посилання на сторінку, де виникла помилка, 
                                або детально опишіть кроки для її відтворення.
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: isAppeal ? '1fr' : '1fr 1fr', gap: '20px' }}>
                    {!isAppeal && (
                        <div style={styles.inputWrapper}>
                            <label style={styles.sectionTitle}><Tag size={16} /> Категорія питання</label>
                            <CustomSelect 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                options={TICKET_CATEGORIES}
                                placeholder="Оберіть категорію"
                                style={{ 
                                    background: 'var(--platform-bg)',
                                    height: '42px'
                                }}
                            />
                        </div>
                    )}

                    <div style={{...styles.inputWrapper, gridColumn: isAppeal ? 'span 1' : 'auto'}}>
                        <label style={styles.sectionTitle}><FileText size={16} /> Тема</label>
                        <input 
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={isAppeal ? "Причина апеляції" : "Коротко про суть проблеми"}
                            required
                            style={{...styles.input, height: '42px', boxSizing: 'border-box'}}
                            onFocus={e => e.target.style.borderColor = 'var(--platform-accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--platform-border-color)'}
                            readOnly={isAppeal}
                        />
                    </div>
                </div>

                <div style={styles.inputWrapper}>
                    <label style={styles.sectionTitle}><AlignLeft size={16} /> Детальний опис</label>
                    <textarea 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Опишіть ситуацію максимально детально..."
                        required
                        style={{...styles.input, minHeight: '250px', resize: 'vertical', lineHeight: '1.6'}}
                        onFocus={e => e.target.style.borderColor = 'var(--platform-accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--platform-border-color)'}
                    />
                </div>

                <div style={{ 
                    display: 'flex', gap: '12px', justifyContent: 'flex-end', 
                    borderTop: '1px solid var(--platform-border-color)', paddingTop: '24px', marginTop: '8px' 
                }}>
                    <Button 
                        type="button"
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Скасувати
                    </Button>
                    <Button 
                        type="submit"
                        variant={isAppeal ? "danger" : "primary"}
                        disabled={loading}
                        icon={!loading && <Send size={18} />}
                    >
                        {loading ? 'Надсилання...' : (isAppeal ? 'Надіслати апеляцію' : 'Створити тікет')}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default NewTicketPage;