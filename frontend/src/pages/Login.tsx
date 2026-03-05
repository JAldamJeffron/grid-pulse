import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Login = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate authentication process
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans selection:bg-mop-mist/30 bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.jpg')" }}
        >
            {/* Language Switcher Overlay */}
            <div className="absolute top-6 right-6 z-20 flex bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-1 shadow-lg">
                {[
                    { code: 'en', label: 'EN' },
                    { code: 'hi', label: 'HI' },
                    { code: 'ta', label: 'TA' }
                ].map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${i18n.language === lang.code
                            ? 'bg-white text-mop-primary shadow-md'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>

            {/* Light Blur Overlay */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[6px] z-0"></div>

            <div className="relative z-10 w-full max-w-md px-6 animate-[fadeIn_0.5s_ease-out]">

                {/* Branding Glass Panel */}
                <div className="flex flex-col items-center justify-center mb-6 bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-2xl relative z-10">
                    <img src="/mop-logo.png" alt="MoP Logo" className="h-16 w-auto mb-4 drop-shadow-md" />
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-mop-mist text-mop-primary rounded-lg shadow-md shadow-teal-600/30">
                            <Activity size={24} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-mop-primary font-['Outfit']">
                            GridPulse
                        </h1>
                    </div>
                    <p className="mt-3 text-sm font-bold text-mop-primary font-semibold uppercase tracking-widest text-center">{t('sec_auth')}</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-mop-primary/20 border-t-4 border-t-mop-mist p-8 overflow-hidden relative">

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest mb-2">{t('user_id')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mop-primary font-semibold">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder={t('credentials_placeholder')}
                                    className="w-full bg-mop-lightgrey border border-mop-primary rounded-xl py-3 pl-12 pr-4 text-sm text-mop-primary focus:ring-2 focus:ring-mop-mist focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(225,236,244,0.6)] focus:border-mop-mist outline-none transition-all shadow-inner placeholder-gray-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest">{t('password')}</label>
                                <a href="#" className="text-[10px] font-bold text-mop-primary hover:text-mop-primary transition-colors">{t('forgot_pw')}</a>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mop-primary font-semibold">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-mop-lightgrey border border-mop-primary rounded-xl py-3 pl-12 pr-4 text-sm text-mop-primary focus:ring-2 focus:ring-mop-mist focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(225,236,244,0.6)] focus:border-mop-mist outline-none transition-all shadow-inner placeholder-gray-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-mop-primary text-white rounded-xl py-3.5 px-4 font-bold tracking-wide transition-all shadow-sm flex justify-center items-center hover:-translate-y-0.5 group"
                        >
                            {loading ? (
                                <Activity className="animate-spin text-white" size={20} />
                            ) : (
                                <>
                                    <span>{t('sign_in')}</span>
                                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-mop-primary/20 flex items-center justify-center text-[10px] uppercase font-bold text-mop-primary font-semibold tracking-widest">
                        <ShieldCheck size={14} className="mr-1.5 text-emerald-800" /> {t('encrypted_connection')}
                    </div>
                </div>

                <p className="mt-10 text-center text-xs font-bold text-white/90 font-semibold leading-relaxed drop-shadow-md">
                    &copy; {t('footer_text')}
                </p>
            </div>
        </div>
    );
};
