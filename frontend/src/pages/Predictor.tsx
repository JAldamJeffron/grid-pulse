import { useState } from 'react';
import { Activity, LogOut, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Predictor = () => {
    const { t, i18n } = useTranslation();
    const [hasPredicted, setHasPredicted] = useState(false);
    // We will hook this up to the python endpoint later
    const [loading, setLoading] = useState(false);

    // Form States for dynamic UI feedback
    const [terrainProfile, setTerrainProfile] = useState("Flat / Plain");
    const [forestCover, setForestCover] = useState("Low (Clear path)");

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    // Dummy calculation logic for UI responsiveness
    const getRiskFactor = () => {
        let risk = 0;
        let days = 0;
        if (terrainProfile === "Hilly / Mountainous") { risk += 25; days += 80; }
        if (terrainProfile === "Rocky") { risk += 15; days += 40; }
        if (terrainProfile === "River Crossing") { risk += 30; days += 95; }
        if (terrainProfile === "Flat / Plain") { risk += 5; days += 10; }

        if (forestCover === "High (Dense Forest/Wildlife)") { risk += 35; days += 76; }
        if (forestCover === "Medium (Agriculture/Trees)") { risk += 15; days += 30; }
        if (forestCover === "Low (Clear path)") { risk += 2; days += 5; }

        return { risk, days };
    };

    const simResults = getRiskFactor();

    const handleSimulate = () => {
        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            setHasPredicted(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen text-mop-primary font-sans selection:bg-mop-mist/30 relative bg-cover bg-center bg-fixed overflow-x-hidden" style={{ backgroundImage: "url('/login-bg.jpg')" }}>

            {/* Cinematic Blur Overlay */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-0 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Navbar */}
                <nav className="bg-white/85 backdrop-blur-md border-b border-white/40 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center space-x-5">
                        <img src="/mop-logo.png" alt="Ministry of Power Logo" className="h-[42px] w-auto bg-white/95 p-1.5 rounded-md shadow-md shadow-slate-200/50" />
                        <div className="flex items-center space-x-3 border-l border-mop-primary/20 pl-5">
                            <div className="p-1.5 bg-mop-mist text-mop-primary rounded-lg shadow-md shadow-teal-600/20">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-mop-primary font-['Outfit'] leading-none">
                                    Predict
                                </h1>
                                <p className="text-[10px] uppercase font-bold text-mop-primary tracking-wider">Zero-Day Estimator</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-4 items-center">
                        {/* Language Switcher */}
                        <div className="flex bg-white/20 backdrop-blur-md border border-mop-primary/10 rounded-full p-0.5 shadow-sm mr-4">
                            {[
                                { code: 'en', label: 'EN' },
                                { code: 'hi', label: 'HI' },
                                { code: 'ta', label: 'TA' }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${i18n.language === lang.code
                                        ? 'bg-mop-primary text-white shadow-md'
                                        : 'text-mop-primary hover:bg-mop-primary/10'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                        <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-mop-primary hover:text-mop-primary transition-colors bg-white/60 border border-white/40 hover:bg-white rounded-md">{t('dashboard')}</Link>
                        <Link to="/live-simulator" className="px-4 py-2 text-sm font-semibold text-mop-primary hover:text-mop-primary transition-colors bg-white/60 border border-white/40 hover:bg-white rounded-md">{t('simulator')}</Link>
                        <Link to="/login" className="px-5 py-2 text-sm font-bold bg-slate-600 text-white hover:bg-slate-700 rounded-md transition-all shadow-lg shadow-rose-900/50 flex items-center">
                            <LogOut size={16} className="mr-2" /> {t('logout')}
                        </Link>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto p-6 mt-8 animate-[fadeIn_0.5s_ease-out] relative z-10">

                    {/* Main Form Card */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden mb-10">
                        <div className="px-8 py-5 border-b border-white/40 bg-white/50">
                            <h2 className="text-sm font-bold text-mop-primary uppercase tracking-widest">{t('simulation_parameters')}</h2>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                                {/* Group A */}
                                <div className="col-span-1 md:col-span-2 text-xs font-bold text-mop-primary uppercase tracking-wider mb-[-15px] pb-2 border-b border-mop-primary/20">{t('project_core')}</div>

                                <div>
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">{t('project_type')}</label>
                                    <select className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm">
                                        <option>{t('select_type')}</option>
                                        <option>{t('trans_line_400')}</option>
                                        <option>{t('trans_line_765')}</option>
                                        <option>{t('substation_220')}</option>
                                        <option>{t('substation_400')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">{t('project_scale')}</label>
                                    <input type="number" placeholder={t('scale_placeholder')} className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm placeholder-gray-600" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">{t('base_planned_budget')}</label>
                                    <div className="relative">
                                        <input type="number" placeholder={t('budget_placeholder')} className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm placeholder-gray-600 pr-24" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-mop-primary font-semibold">{t('crores')}</span>
                                    </div>
                                </div>

                                {/* Group B */}
                                <div className="col-span-1 md:col-span-2 text-xs font-bold text-mop-primary uppercase tracking-wider mb-[-15px] mt-4 pb-2 border-b border-mop-primary/20">{t('geographical_risk_triggers')}</div>

                                <div>
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">{t('terrain_profile')}</label>
                                    <select
                                        value={terrainProfile}
                                        onChange={(e) => setTerrainProfile(e.target.value)}
                                        className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm"
                                    >
                                        <option disabled value="">{t('select_terrain')}</option>
                                        <option value="Flat / Plain">{t('flat_plain')}</option>
                                        <option value="Hilly / Mountainous">{t('hilly_mountainous')}</option>
                                        <option value="Rocky">{t('rocky')}</option>
                                        <option value="River Crossing">{t('river_crossing')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">{t('forest_cover_row')}</label>
                                    <select
                                        value={forestCover}
                                        onChange={(e) => setForestCover(e.target.value)}
                                        className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm"
                                    >
                                        <option disabled value="">{t('select_sensitivity')}</option>
                                        <option value="Low (Clear path)">{t('low_clear')}</option>
                                        <option value="Medium (Agriculture/Trees)">{t('medium_agri')}</option>
                                        <option value="High (Dense Forest/Wildlife)">{t('high_forest')}</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">Expected Start Month:</label>
                                    <select className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm">
                                        <option>Select Month</option>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>

                                {/* Group C */}
                                <div className="col-span-1 md:col-span-2 text-xs font-bold text-mop-primary uppercase tracking-wider mb-[-15px] mt-4 pb-2 border-b border-mop-primary/20">Execution Variables</div>

                                <div>
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">Past Vendor Performance:</label>
                                    <select className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm">
                                        <option>Select Tier</option>
                                        <option>Tier 1 (Excellent)</option>
                                        <option>Tier 2 (Average)</option>
                                        <option>Tier 3 (High Risk)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">Labour Availability:</label>
                                    <select className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm">
                                        <option>Select Status</option>
                                        <option>Normal</option>
                                        <option>Harvesting Season (Shortage)</option>
                                        <option>Festival Season (Shortage)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-mop-primary font-semibold mb-2">Material Market Trend:</label>
                                    <select className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 text-sm text-mop-primary focus:ring-2 shadow-sm">
                                        <option>Select Trend</option>
                                        <option>Stable</option>
                                        <option>Volatile (Prices rising)</option>
                                        <option>Supply Chain Shortage</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="mt-12 flex justify-center border-t border-mop-primary/20 pt-8">
                                <button
                                    onClick={handleSimulate}
                                    disabled={loading}
                                    className="bg-mop-primary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-sm transition-all hover:-translate-y-1 flex items-center min-w-[320px] justify-center"
                                >
                                    {loading ? <RefreshCw className="mr-3 animate-spin text-mop-primary" size={18} /> : <Download className="mr-3 text-mop-primary" size={18} />}
                                    {t('generate_prediction')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    {hasPredicted && (
                        <div className="animate-[fadeIn_0.5s_ease-out] mb-20">
                            <div className="flex items-center mb-6">
                                <div className="w-1.5 h-6 bg-mop-mist rounded-full mr-3"></div>
                                <h3 className="text-xl font-bold text-mop-primary font-['Outfit']">{t('prediction_results_title')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-6">
                                    <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest mb-1">{t('est_base_cost')}</p>
                                    <p className="text-3xl font-black text-mop-primary font-['Outfit']">₹450 <span className="text-lg text-mop-primary font-semibold">Cr</span></p>
                                </div>

                                <div className="bg-rose-50  rounded-xl shadow-lg border border-rose-300 p-6 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 text-rose-800"><AlertCircle size={80} /></div>
                                    <p className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mb-1 relative z-10">{t('pred_cost_overrun')}</p>
                                    <p className="text-3xl font-black text-rose-700 font-['Outfit'] relative z-10 animate-pulse">+₹65 <span className="text-lg">Cr</span></p>
                                </div>

                                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-6">
                                    <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest mb-1">{t('est_base_timeline')}</p>
                                    <p className="text-3xl font-black text-mop-primary font-['Outfit']">24 <span className="text-lg text-mop-primary font-semibold">{t('months')}</span></p>
                                </div>

                                <div className={`bg-amber-50 rounded-xl shadow-lg border p-6 relative overflow-hidden ${simResults.risk > 30 ? 'border-amber-300' : 'border-teal-300'}`}>
                                    <div className={`absolute -right-4 -bottom-4 opacity-5 ${simResults.risk > 30 ? 'text-amber-700' : 'text-teal-800'}`}><AlertCircle size={80} /></div>
                                    <p className="text-[10px] font-bold text-mop-primary uppercase tracking-widest mb-1 relative z-10">{t('pred_delay_risk')}</p>
                                    <p className={`text-3xl font-black font-['Outfit'] relative z-10 ${simResults.risk > 30 ? 'text-amber-600' : 'text-teal-700'}`}>+{simResults.days} <span className="text-lg">{t('days')}</span></p>
                                </div>
                            </div>

                            {/* Explainer */}
                            <div className={`mt-8 rounded-xl p-5 border flex items-start ${simResults.risk > 30 ? 'bg-amber-50 border-amber-300' : 'bg-teal-50 border-teal-300'}`}>
                                <AlertCircle className={`mr-4 mt-0.5 shrink-0 ${simResults.risk > 30 ? 'text-amber-700' : 'text-teal-800'}`} size={20} />
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${simResults.risk > 30 ? 'text-amber-700' : 'text-teal-800'}`}>{t('risk_hotspots_explainer')}</h4>
                                    <p className="text-sm text-mop-primary leading-relaxed font-medium">
                                        <span className="font-bold">{simResults.risk}% {t('execution_risk_detected')}</span>
                                        {simResults.risk > 30
                                            ? t('high_risk_desc', { terrain: terrainProfile, forest: forestCover })
                                            : t('low_risk_desc', { terrain: terrainProfile, forest: forestCover })
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
