import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Animated background shapes
const BgShapes = () => (
    <>
        {/* Gradient orbs */}
        <div style={{
            position: 'absolute', top: '-20%', left: '-15%',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(219,39,119,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'float1 8s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', bottom: '-20%', right: '-15%',
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'float2 10s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', top: '40%', right: '20%',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'float3 12s ease-in-out infinite',
        }} />

        {/* Subtle grid */}
        <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
        }} />

        <style>{`
      @keyframes float1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -20px) scale(1.05); }
        66% { transform: translate(-20px, 15px) scale(0.98); }
      }
      @keyframes float2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-25px, 30px) scale(1.03); }
        66% { transform: translate(20px, -20px) scale(0.97); }
      }
      @keyframes float3 {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-15px, 25px); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes pulse-ring {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.02); }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    </>
);

// Feature badge
const FeatureBadge = ({ icon, text, delay }: { icon: string; text: string; delay: string }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '100px',
        color: 'rgba(255,255,255,0.75)',
        fontSize: '12px',
        fontWeight: 500,
        backdropFilter: 'blur(8px)',
        animation: `fadeInUp 0.6s ease-out ${delay} both`,
    }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span>{text}</span>
    </div>
);

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        }
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

            {/* Left panel - branding */}
            <div style={{
                display: 'none',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '80px',
                position: 'relative',
                zIndex: 10,
            }} className="auth-left-panel">
                {/* Logo mark */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '60px',
                    animation: 'fadeInUp 0.6s ease-out both',
                }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #db2777, #9333ea)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(219,39,119,0.35)',
                    }}>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '18px' }}>A</span>
                    </div>
                    <span style={{ color: 'white', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                        Agenda<span style={{ color: '#db2777' }}>Simples</span>
                    </span>
                </div>

                <div style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
                    <h1 style={{
                        color: 'white', fontSize: '52px', fontWeight: 900,
                        lineHeight: 1.05, letterSpacing: '-2px',
                        marginBottom: '20px', maxWidth: '500px',
                    }}>
                        Gerencie seu<br />
                        <span style={{
                            background: 'linear-gradient(90deg, #db2777, #9333ea, #db2777)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'shimmer 4s linear infinite',
                        }}>negócio</span> com<br />
                        inteligência.
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)', fontSize: '16px',
                        lineHeight: 1.7, maxWidth: '380px', marginBottom: '48px',
                    }}>
                        Agendamentos, clientes, finanças e análises em um único lugar. Simples, rápido e poderoso.
                    </p>
                </div>

                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '10px',
                    maxWidth: '420px',
                }}>
                    <FeatureBadge icon="📅" text="Agenda inteligente" delay="0.2s" />
                    <FeatureBadge icon="💰" text="Controle financeiro" delay="0.3s" />
                    <FeatureBadge icon="🤖" text="Analista com IA" delay="0.4s" />
                    <FeatureBadge icon="📊" text="Relatórios detalhados" delay="0.5s" />
                    <FeatureBadge icon="👥" text="Gestão de clientes" delay="0.6s" />
                </div>

                {/* Decorative stat cards */}
                <div style={{
                    display: 'flex', gap: '16px', marginTop: '60px',
                    animation: 'fadeInUp 0.6s ease-out 0.7s both',
                }}>
                    {[
                        { value: '3.2x', label: 'mais produtividade' },
                        { value: '98%', label: 'satisfação dos usuários' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            padding: '20px 24px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            backdropFilter: 'blur(12px)',
                        }}>
                            <div style={{ color: '#db2777', fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>{stat.value}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel - login form */}
            <div style={{
                width: '100%',
                maxWidth: '520px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 24px',
                position: 'relative',
                zIndex: 10,
                margin: '0 auto',
            }} className="auth-right-panel">

                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    animation: 'fadeInUp 0.7s ease-out 0.1s both',
                }}>
                    {/* Mobile logo */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        marginBottom: '48px',
                    }} className="auth-logo-mobile">
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'linear-gradient(135deg, #db2777, #9333ea)',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(219,39,119,0.4)',
                        }}>
                            <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>A</span>
                        </div>
                        <div>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
                                Agenda<span style={{ color: '#db2777' }}>Simples</span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                                Gestão profissional simplificada
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '28px',
                        padding: '40px 36px',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
                    }}>
                        {/* Heading */}
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{
                                color: 'white', fontSize: '28px', fontWeight: 800,
                                letterSpacing: '-0.8px', marginBottom: '8px', lineHeight: 1.2,
                            }}>
                                Bem-vindo de volta 👋
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.6 }}>
                                Faça login para acessar seu painel de gestão.
                            </p>
                        </div>

                        {/* Error message */}
                        {errorMsg && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '12px',
                                color: '#fca5a5',
                                fontSize: '13px',
                                marginBottom: '20px',
                            }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '15px 20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                background: loading
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(255,255,255,0.95)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '14px',
                                color: loading ? 'rgba(255,255,255,0.4)' : '#1e293b',
                                fontSize: '15px', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,0,0.3)',
                                position: 'relative', overflow: 'hidden',
                                letterSpacing: '-0.2px',
                            }}
                            onMouseOver={e => {
                                if (!loading) {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                                }
                            }}
                            onMouseOut={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 4px 20px rgba(0,0,0,0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        borderTopColor: 'rgba(255,255,255,0.7)',
                                        borderRadius: '50%',
                                        animation: 'spin-slow 0.8s linear infinite',
                                    }} />
                                    <span>Redirecionando...</span>
                                </>
                            ) : (
                                <>
                                    <GoogleIcon />
                                    <span>Entrar com Google</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            margin: '24px 0',
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Acesso seguro
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* Trust indicators */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '20px',
                            flexWrap: 'wrap',
                        }}>
                            {[
                                { icon: '🔒', text: 'SSL criptografado' },
                                { icon: '🛡️', text: 'Dados protegidos' },
                                { icon: '⚡', text: 'Login rápido' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    color: 'rgba(255,255,255,0.3)', fontSize: '11px',
                                }}>
                                    <span style={{ fontSize: '12px' }}>{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p style={{
                        textAlign: 'center', marginTop: '24px',
                        color: 'rgba(255,255,255,0.2)', fontSize: '11px', lineHeight: 1.6,
                    }}>
                        Ao entrar, você concorda com nossos{' '}
                        <span style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Termos de Uso</span>
                        {' '}e{' '}
                        <span style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Política de Privacidade</span>.
                    </p>
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
        @media (min-width: 900px) {
          .auth-left-panel {
            display: flex !important;
          }
          .auth-right-panel {
            width: 480px !important;
            max-width: 480px !important;
            border-left: 1px solid rgba(255,255,255,0.06);
            background: rgba(0,0,0,0.2);
            margin: 0 !important;
          }
          .auth-logo-mobile {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};
