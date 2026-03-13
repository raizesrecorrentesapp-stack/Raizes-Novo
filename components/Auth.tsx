import React, { useState } from 'react';
import { supabase } from '../services/supabase';

// --- Sub-components ---

const BgShapes = () => (
    <>
        <div style={{
            position: 'absolute', top: '-20%', left: '-15%',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(219,39,119,0.15) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
            animation: 'authFloat1 8s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', bottom: '-20%', right: '-15%',
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
            animation: 'authFloat2 10s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', top: '35%', right: '18%',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
            animation: 'authFloat3 12s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', inset: 0,
            backgroundImage:
                'linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
        }} />
        <style>{`
      @keyframes authFloat1 {
        0%,100%{transform:translate(0,0) scale(1);}
        33%{transform:translate(30px,-20px) scale(1.05);}
        66%{transform:translate(-20px,15px) scale(0.98);}
      }
      @keyframes authFloat2 {
        0%,100%{transform:translate(0,0) scale(1);}
        33%{transform:translate(-25px,30px) scale(1.03);}
        66%{transform:translate(20px,-20px) scale(0.97);}
      }
      @keyframes authFloat3 {
        0%,100%{transform:translate(0,0);}
        50%{transform:translate(-15px,25px);}
      }
      @keyframes authShimmer {
        0%{background-position:-200% center;}
        100%{background-position:200% center;}
      }
      @keyframes authSpinSlow {
        from{transform:rotate(0deg);}
        to{transform:rotate(360deg);}
      }
      @keyframes authFadeUp {
        from{opacity:0;transform:translateY(20px);}
        to{opacity:1;transform:translateY(0);}
      }
      .auth-input:focus {
        outline: none;
        border-color: rgba(219,39,119,0.7) !important;
        box-shadow: 0 0 0 3px rgba(219,39,119,0.15) !important;
      }
      .auth-input::placeholder { color: rgba(255,255,255,0.2); }
      .auth-btn-primary:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 8px 30px rgba(219,39,119,0.45) !important;
      }
      .auth-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .auth-toggle-btn:hover { color: #f472b6 !important; }
    `}</style>
    </>
);

const InputField = ({
    label, icon, type, value, onChange, placeholder, required,
}: {
    label: string; icon: string; type: string;
    value: string; onChange: (v: string) => void;
    placeholder: string; required?: boolean;
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '16px', pointerEvents: 'none', userSelect: 'none',
            }}>{icon}</span>
            <input
                className="auth-input"
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 14px 13px 42px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white', fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
            />
        </div>
    </div>
);

// --- Main Component ---

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const resetMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetMessages();

        if (!isLogin && password !== confirmPassword) {
            setErrorMsg('As senhas não coincidem. Verifique e tente novamente.');
            return;
        }
        if (!isLogin && password.length < 6) {
            setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg('Conta criada! Verifique seu e-mail para confirmar e depois faça o login.');
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            const msg = err.message || '';
            if (msg.includes('Invalid login credentials')) {
                setErrorMsg('E-mail ou senha incorretos. Verifique e tente novamente.');
            } else if (msg.includes('User already registered')) {
                setErrorMsg('Este e-mail já possui uma conta. Faça login.');
            } else if (msg.includes('Email not confirmed')) {
                setErrorMsg('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
            } else {
                setErrorMsg(msg || 'Ocorreu um erro. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(v => !v);
        resetMessages();
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1529 40%, #111827 100%)',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        }}>
            <BgShapes />

            {/* ── Left branding panel (desktop only) ── */}
            <div style={{
                flex: 1, flexDirection: 'column', justifyContent: 'center',
                alignItems: 'flex-start', padding: '80px',
                position: 'relative', zIndex: 10,
                display: 'none',
            }} className="auth-left">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px', animation: 'authFadeUp 0.6s ease-out both' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        padding: '8px',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <img src="/logo.png" alt="AgendaSimples Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                    </div>
                    <span style={{ color: 'white', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                        Agenda<span style={{ color: '#db2777' }}>Simples</span>
                    </span>
                </div>

                {/* Headline */}
                <div style={{ animation: 'authFadeUp 0.6s ease-out 0.1s both' }}>
                    <h1 style={{
                        color: 'white', fontSize: '50px', fontWeight: 900,
                        lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '20px', maxWidth: '480px',
                    }}>
                        Gerencie seu<br />
                        <span style={{
                            background: 'linear-gradient(90deg, #db2777, #9333ea, #db2777)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'authShimmer 4s linear infinite',
                        }}>negócio</span> com<br />
                        inteligência.
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: 1.7, maxWidth: '360px', marginBottom: '48px' }}>
                        Agendamentos, clientes, finanças e análises em um único lugar. Simples, rápido e poderoso.
                    </p>
                </div>

                {/* Feature badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '400px', animation: 'authFadeUp 0.6s ease-out 0.2s both' }}>
                    {[
                        { icon: '📅', text: 'Agenda inteligente' },
                        { icon: '💰', text: 'Controle financeiro' },
                        { icon: '🤖', text: 'Analista com IA' },
                        { icon: '📊', text: 'Relatórios detalhados' },
                        { icon: '👥', text: 'Gestão de clientes' },
                    ].map(f => (
                        <div key={f.text} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '100px',
                            color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500,
                            backdropFilter: 'blur(8px)',
                        }}>
                            <span>{f.icon}</span><span>{f.text}</span>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '56px', animation: 'authFadeUp 0.6s ease-out 0.35s both' }}>
                    {[{ value: '3.2x', label: 'mais produtividade' }, { value: '98%', label: 'satisfação dos usuários' }].map(s => (
                        <div key={s.value} style={{
                            padding: '20px 24px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px', backdropFilter: 'blur(12px)',
                        }}>
                            <div style={{ color: '#db2777', fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>{s.value}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div style={{
                width: '100%', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                padding: '40px 24px', position: 'relative', zIndex: 10,
                margin: '0 auto',
            }} className="auth-right">

                <div style={{ width: '100%', maxWidth: '400px', animation: 'authFadeUp 0.7s ease-out 0.1s both' }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }} className="auth-logo-mobile">
                        <div style={{
                            width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            padding: '8px',
                            backdropFilter: 'blur(8px)',
                        }}>
                            <img src="/logo.png" alt="AgendaSimples Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
                                Agenda<span style={{ color: '#db2777' }}>Simples</span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '2px' }}>
                                Gestão profissional simplificada
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '28px', padding: '36px 32px',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
                    }}>

                        {/* Heading */}
                        <div style={{ marginBottom: '28px' }}>
                            <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.7px', marginBottom: '6px', lineHeight: 1.2 }}>
                                {isLogin ? 'Bem-vindo de volta 👋' : 'Crie sua conta ✨'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.6 }}>
                                {isLogin
                                    ? 'Faça login para acessar seu painel de gestão.'
                                    : 'Preencha os dados abaixo para começar gratuitamente.'}
                            </p>
                        </div>

                        {/* Messages */}
                        {errorMsg && (
                            <div style={{
                                padding: '11px 14px', marginBottom: '18px',
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '10px', color: '#fca5a5', fontSize: '13px',
                            }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div style={{
                                padding: '11px 14px', marginBottom: '18px',
                                background: 'rgba(34,197,94,0.12)',
                                border: '1px solid rgba(34,197,94,0.25)',
                                borderRadius: '10px', color: '#86efac', fontSize: '13px',
                            }}>
                                ✅ {successMsg}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <InputField
                                label="E-mail"
                                icon="✉️"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="seu@email.com"
                                required
                            />
                            <InputField
                                label="Senha"
                                icon="🔒"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder="••••••••"
                                required
                            />
                            {!isLogin && (
                                <InputField
                                    label="Confirmar Senha"
                                    icon="🔑"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    placeholder="••••••••"
                                    required
                                />
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-btn-primary"
                                style={{
                                    marginTop: '6px',
                                    width: '100%', padding: '14px',
                                    background: 'linear-gradient(135deg, #db2777, #9333ea)',
                                    border: 'none', borderRadius: '13px',
                                    color: 'white', fontSize: '15px', fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 20px rgba(219,39,119,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    letterSpacing: '-0.2px',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: '16px', height: '16px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white', borderRadius: '50%',
                                            animation: 'authSpinSlow 0.8s linear infinite',
                                        }} />
                                        <span>Aguarde...</span>
                                    </>
                                ) : (
                                    <span>{isLogin ? '→ Entrar' : '→ Criar conta'}</span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {isLogin ? 'novo por aqui?' : 'já tem conta?'}
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* Toggle */}
                        <button
                            onClick={switchMode}
                            className="auth-toggle-btn"
                            style={{
                                width: '100%', padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', transition: 'color 0.2s',
                            }}
                        >
                            {isLogin ? 'Criar minha conta agora →' : '← Já tenho conta, fazer login'}
                        </button>
                    </div>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', marginTop: '22px', color: 'rgba(255,255,255,0.18)', fontSize: '11px', lineHeight: 1.6 }}>
                        Ao entrar, você concorda com nossos{' '}
                        <span style={{ color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>Termos de Uso</span>
                        {' '}e{' '}
                        <span style={{ color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>Política de Privacidade</span>.
                    </p>
                </div>
            </div>

            {/* Responsive */}
            <style>{`
        @media (min-width: 900px) {
          .auth-left { display: flex !important; }
          .auth-right {
            width: 480px !important;
            max-width: 480px !important;
            border-left: 1px solid rgba(255,255,255,0.06);
            background: rgba(0,0,0,0.2);
            margin: 0 !important;
          }
          .auth-logo-mobile { display: none !important; }
        }
      `}</style>
        </div>
    );
};
