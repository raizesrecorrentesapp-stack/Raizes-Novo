import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { LogoText } from './Logo';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export const Auth: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar e depois faça o login.');
                setIsLogin(true);
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Ocorreu um erro durante a autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800/50 relative z-10">
                <div className="p-8 sm:p-10">

                    {/* Logo */}
                    <div className="flex justify-center mb-10">
                        <span className="scale-125 origin-center hover:scale-110 transition-transform duration-500">
                            <LogoText />
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {isLogin
                                ? 'Faça login para gerenciar sua rotina de forma simples.'
                                : 'Junte-se a nós e simplifique a sua gestão hoje mesmo.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error / Success Messages */}
                        {errorMsg && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                                {successMsg}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-accent hover:opacity-90 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Aguarde...' : isLogin ? (
                                <><span>Entrar</span><LogIn className="w-5 h-5" /></>
                            ) : (
                                <><span>Cadastrar</span><UserPlus className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Signup */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                            {isLogin ? 'Ainda não possui conta?' : 'Já faz parte do time?'}
                        </p>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                            className="text-sm font-bold text-accent hover:text-accent/80 transition-colors py-2 px-6 rounded-xl border border-accent/20 hover:bg-accent/5"
                        >
                            {isLogin ? 'Criar minha conta agora' : 'Fazer login na minha conta'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
