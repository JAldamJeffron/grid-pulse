import { useState, useEffect } from 'react';
import { Activity, Play, Lock, ChevronDown, ChevronRight, AlertTriangle, Clock, IndianRupee, Thermometer, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const INITIAL_LAYERS = [
    { id: 1, name: "Survey & Route Alignment", unit: "km surveyed", target: 150, actual: 0, durationDays: 30 },
    { id: 2, name: "Engineering & Design", unit: "Technical Diagrams", target: 45, actual: 0, durationDays: 45 },
    { id: 3, name: "Regulatory Permissions", unit: "Permits Acquired", target: 12, actual: 0, durationDays: 60 },
    { id: 4, name: "Land Acquisition / ROW", unit: "Hectares/Parcels", target: 300, actual: 0, durationDays: 120 },
    { id: 5, name: "Supply of Material", unit: "Tons of Steel/Cables", target: 5000, actual: 0, durationDays: 90 },
    { id: 6, name: "Site Leveling & Excavation", unit: "Cubic Meters", target: 12000, actual: 0, durationDays: 45 },
    { id: 7, name: "Concreting & Foundation", unit: "Foundations Cast", target: 400, actual: 0, durationDays: 60 },
    { id: 8, name: "Tower/Equipment Erection", unit: "Towers Erected", target: 400, actual: 0, durationDays: 90 },
    { id: 9, name: "Testing & Commissioning", unit: "Sub-systems", target: 50, actual: 0, durationDays: 30 },
];

export const LiveSimulator = () => {
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };
    // Top-Level Setup State
    const [isLocked, setIsLocked] = useState(false);
    const [category, setCategory] = useState('Transmission Line');
    const [lineType, setLineType] = useState('Overhead');
    const [lineVoltage, setLineVoltage] = useState('400kV');
    const [distance, setDistance] = useState(150);
    const [capacity, setCapacity] = useState(400); // For Substation
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');

    // Simulation State
    const [currentSimDate, setCurrentSimDate] = useState('');
    const [layers, setLayers] = useState(INITIAL_LAYERS);
    const [expandedLayer, setExpandedLayer] = useState<number | null>(1);

    // Financial & Timing Metrics
    const [baseBudget, setBaseBudget] = useState(0);
    const dailyOverheadRate = 150000; // 1.5 Lakhs
    const baseDuration = layers.reduce((acc, curr) => acc + curr.durationDays, 0);

    const [liveCost, setLiveCost] = useState(0);
    const [marketVariance, setMarketVariance] = useState(0);
    const [totalDelayDays, setTotalDelayDays] = useState(0);
    const [logs, setLogs] = useState<{ date: string, msg: string, impact: string }[]>([]);

    // Removed old simplified budget effect; moving rigorous logic to handleLock

    useEffect(() => {
        if (!isLocked || !startDate || !currentSimDate) return;

        const fetchAutonomousEvents = async () => {
            let totalAutoDelay = 0;
            let totalAutoCost = 0;
            const autoLogs: { date: string, msg: string, impact: string }[] = [];

            try {
                const res = await fetch('http://localhost:8000/simulator/autonomous-events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ current_date: currentSimDate, location: location || 'Unknown', base_budget: baseBudget })
                });
                if (res.ok) {
                    const data = await res.json();
                    totalAutoDelay = data.total_delay_days;
                    totalAutoCost = data.total_cost_overrun;

                    data.events.forEach((ev: { message: string, impact_text: string }) => {
                        autoLogs.push({
                            date: currentSimDate + " [AUTONOMOUS]",
                            msg: ev.message,
                            impact: ev.impact_text
                        });
                    });
                }
            } catch (err) {
                console.error("Failed to fetch autonomous events", err);
            }

            const start = new Date(startDate).getTime();
            const current = new Date(currentSimDate).getTime();
            const daysElapsed = Math.max(0, Math.floor((current - start) / (1000 * 60 * 60 * 24)));

            let calculatedDelay = 0;
            let cumulativePlannedDays = 0;
            // Clean out old auto logs for this date if we rewrite state logic, but simpler: 
            // We just append if they aren't already there.
            const newLogs = [...logs];

            // Auto logs
            autoLogs.forEach(alog => {
                if (!newLogs.find(l => l.msg === alog.msg)) {
                    newLogs.unshift(alog);
                }
            });

            // Manual Validation Check for Cascade
            layers.forEach((layer) => {
                cumulativePlannedDays += layer.durationDays;

                if (daysElapsed > cumulativePlannedDays && layer.actual < layer.target) {
                    const missingRatio = 1 - (layer.actual / layer.target);
                    if (!newLogs.find(l => l.msg.includes(`Phase ${layer.id} target missed`))) {
                        let cascadeMultiplier = 1.0;
                        if (layer.id === 2) cascadeMultiplier = 1.5;
                        if (layer.id === 5) cascadeMultiplier = 2.0;
                        if (layer.id === 4) cascadeMultiplier = 3.0;

                        const addedDelay = Math.floor(baseDuration * 0.1 * missingRatio * cascadeMultiplier);

                        if (addedDelay > 0) {
                            calculatedDelay += addedDelay;
                            const addedCost = addedDelay * dailyOverheadRate;

                            newLogs.unshift({
                                date: currentSimDate,
                                msg: `Phase ${layer.id} target missed (${layer.actual}/${layer.target} completed). Dependent phases pushed back.`,
                                impact: `+${addedDelay} Days Cascade, +₹${(addedCost / 100000).toFixed(2)} Lakhs.`
                            });
                        }
                    }
                }
            });

            // Market Fluctuation Logic
            let triggeredMarketCost = 0;
            const supplyLayer = layers.find(l => l.id === 5);
            const isSupplyComplete = supplyLayer ? (supplyLayer.actual >= supplyLayer.target) : false;

            if (!isSupplyComplete && daysElapsed > 0) {
                const dateObj = new Date(currentSimDate);
                const simMonth = dateObj.getMonth();
                const simYear = dateObj.getFullYear();
                const marketSeed = (simYear * 12 + simMonth);

                const shift = Math.sin(marketSeed * 1.5) * 0.15; // fluctuates up to +/- 15%
                const unpurchasedBudget = baseBudget * 0.4;
                triggeredMarketCost = unpurchasedBudget * shift;

                const percentChange = (shift * 100).toFixed(1);
                const impactLakhs = (Math.abs(triggeredMarketCost) / 100000).toFixed(2);

                if (Math.abs(shift) > 0.05 && !newLogs.find(l => l.msg.includes(`Market Alert`) && l.date.substring(0, 7) === currentSimDate.substring(0, 7))) {
                    const direction = shift > 0 ? "surged" : "dropped";
                    const symbol = shift > 0 ? "+" : "-";
                    newLogs.unshift({
                        date: currentSimDate + " [MARKET UPDATE]",
                        msg: `Market Alert: Raw material prices ${direction} ${symbol}${percentChange}% this month. Unpurchased materials adjusted.`,
                        impact: `${shift > 0 ? '+' : '-'}₹${impactLakhs} Lakhs`
                    });
                }
            }

            setMarketVariance(triggeredMarketCost);

            const finalDelay = calculatedDelay + totalAutoDelay;
            const manualAddedCost = calculatedDelay * dailyOverheadRate;
            const finalCost = baseBudget + manualAddedCost + totalAutoCost + triggeredMarketCost;

            setTotalDelayDays(finalDelay);
            setLiveCost(finalCost);

            if (newLogs.length !== logs.length) setLogs(newLogs);
        };

        fetchAutonomousEvents();
    }, [currentSimDate, layers, isLocked, startDate, baseBudget, location, baseDuration, logs]);

    const handleLock = () => {
        if (!startDate) {
            alert("Please set an Official Start Date.");
            return;
        }

        // Auto-Baseline Generator Math
        let newBaseCost = 0;
        let totalMonths = 0;
        let newTargets: { id: number; target: number; unit: string }[] = [];

        if (category === 'Transmission Line') {
            const perKmRate = lineVoltage === '765kV' ? 25000000 : 15000000; // 2.5 Cr or 1.5 Cr
            newBaseCost = distance * perKmRate;
            totalMonths = 3 + Math.ceil(distance / 10);

            newTargets = [
                { id: 1, target: distance, unit: 'km' },
                { id: 2, target: Math.ceil(distance * 1.5), unit: 'Drawings' },
                { id: 3, target: Math.ceil(distance / 10), unit: 'Permits' },
                { id: 4, target: Math.ceil(distance * 3), unit: 'Parcels' },
                { id: 5, target: Math.ceil(distance * 50), unit: 'Tons Steel' },
                { id: 6, target: Math.ceil(distance * 100), unit: 'Cubic M' },
                { id: 7, target: Math.ceil(distance * 3), unit: 'Foundations' },
                { id: 8, target: Math.ceil(distance * 3), unit: 'Towers' },
                { id: 9, target: Math.ceil(distance / 5), unit: 'Subsystems' },
            ];
        } else {
            newBaseCost = capacity * 2000000; // 0.2 Cr per MVA
            totalMonths = 6 + Math.ceil(capacity / 100);

            newTargets = [
                { id: 1, target: Math.ceil(capacity / 100), unit: 'Surveys' },
                { id: 2, target: Math.ceil(capacity / 50), unit: 'Drawings' },
                { id: 3, target: 5, unit: 'Permits' },
                { id: 4, target: Math.ceil(capacity / 200), unit: 'Acres' },
                { id: 5, target: Math.ceil(capacity * 2), unit: 'Tons Steel' },
                { id: 6, target: Math.ceil(capacity * 10), unit: 'Cubic M' },
                { id: 7, target: Math.ceil(capacity / 50), unit: 'Foundations' },
                { id: 8, target: Math.ceil(capacity / 50), unit: 'Structures' },
                { id: 9, target: Math.ceil(capacity / 100), unit: 'Subsystems' },
            ];
        }

        const daysPerLayer = Math.ceil((totalMonths * 30) / 9);
        const updatedLayers = layers.map((l, idx) => ({
            ...l,
            target: newTargets[idx].target,
            unit: newTargets[idx].unit,
            durationDays: daysPerLayer,
            actual: 0 // reset actuals
        }));

        setLayers(updatedLayers);
        setBaseBudget(newBaseCost);
        setLiveCost(newBaseCost);
        setMarketVariance(0);
        setTotalDelayDays(0);

        setIsLocked(true);
        setCurrentSimDate(startDate);
        setLogs([{ date: startDate, msg: "Auto-Baseline Generated. Schedule & Budget Locked.", impact: "Simulation Engine Initialized" }]);
    };

    const updateLayer = (id: number, field: 'target' | 'actual', value: string) => {
        const val = parseInt(value) || 0;
        setLayers(layers.map(l => l.id === id ? { ...l, [field]: val } : l));
    };

    const healthStatus = totalDelayDays > 45 ? 'CRITICAL' : totalDelayDays > 0 ? 'AT RISK' : 'ON TRACK';

    return (
        <div className="min-h-screen relative overflow-hidden text-mop-primary font-sans selection:bg-mop-mist/30 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/login-bg.jpg')" }}>

            {/* Cinematic Blur Overlay */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-0 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Navbar */}
                <nav className="bg-white/85 backdrop-blur-md border-b border-white/40 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <img src="/mop-logo.png" alt="Ministry of Power Logo" className="h-[42px] w-auto bg-slate-50/95 p-1.5 rounded-md shadow-md shadow-slate-200/50" />
                        <div className="flex items-center space-x-3 border-l border-mop-primary/20 pl-5">
                            <div className="p-1.5 bg-mop-mist text-mop-primary rounded-lg shadow-md hover:shadow-lg transition-all">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-mop-primary font-['Outfit'] leading-none">{t('live_simulator_title')}</h1>
                                <p className="text-[10px] uppercase font-bold text-mop-primary tracking-wider">{t('digital_twin_engine')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
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
                        <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-mop-primary hover:text-mop-primary transition-colors bg-white/60 border border-white/40 hover:bg-white/90 rounded-md shadow-sm">{t('dashboard')}</Link>
                        <Link to="/predictor" className="px-4 py-2 text-sm font-semibold text-mop-primary hover:text-mop-primary transition-colors bg-white/60 border border-white/40 hover:bg-white/90 rounded-md shadow-sm">{t('predictor')}</Link>
                    </div>
                </nav>

                <main className="max-w-[1400px] mx-auto p-6 mt-4">

                    {/* Conditional Project Setup */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden mb-8 relative z-10 transition-all duration-500" style={{ filter: isLocked ? 'grayscale(0.5)' : 'none' }}>
                        <div className="bg-white/50 px-6 py-4 border-b border-white/40 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-mop-primary uppercase tracking-widest">{t('conditional_project_setup')}</h2>
                            {isLocked && <span className="text-[10px] font-bold text-rose-800 uppercase flex items-center bg-rose-50 px-2 py-1 rounded"><Lock size={12} className="mr-1" /> {t('locked_live_engine')}</span>}
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Universal Core */}
                            <div>
                                <label className="block text-xs font-bold text-mop-primary font-semibold uppercase tracking-wider mb-2">{t('project_category')}</label>
                                <select
                                    value={category} onChange={(e) => setCategory(e.target.value)} disabled={isLocked}
                                    className="w-full border border-mop-primary/20 rounded-lg px-4 py-3 text-sm font-bold text-mop-primary bg-white/60 backdrop-blur-sm border-white/40 disabled:opacity-50"
                                >
                                    <option value="Transmission Line">{t('transmission_line')}</option>
                                    <option value="Substation">{t('substation')}</option>
                                </select>
                            </div>

                            {/* Condition 1: Transmission Line */}
                            {category === 'Transmission Line' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-mop-primary font-semibold uppercase tracking-wider mb-2">{t('line_type')}</label>
                                        <select
                                            value={lineType} onChange={(e) => setLineType(e.target.value)} disabled={isLocked}
                                            className="w-full border border-mop-primary/20 rounded-lg px-4 py-3 text-sm text-mop-primary focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 bg-white/60 backdrop-blur-sm border-white/40"
                                        >
                                            <option value="Overhead">{t('overhead')}</option>
                                            <option value="Underground Cable">{t('underground')}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-mop-primary font-semibold uppercase tracking-wider mb-2">{t('voltage_class')}</label>
                                            <select
                                                value={lineVoltage} onChange={(e) => setLineVoltage(e.target.value)} disabled={isLocked}
                                                className="w-full border border-mop-primary/20 rounded-lg px-4 py-3 text-sm text-mop-primary focus:ring-2 focus:ring-mop-mist disabled:opacity-50 bg-mop-lightgrey"
                                            >
                                                <option>400kV</option>
                                                <option>765kV</option>
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-mop-primary font-semibold uppercase tracking-wider mb-2">{t('distance_km')}</label>
                                            <input
                                                type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} disabled={isLocked}
                                                className="w-full border border-mop-primary/20 rounded-lg px-4 py-3 text-sm text-mop-primary focus:ring-2 focus:ring-mop-mist disabled:opacity-50 bg-mop-lightgrey pr-12"
                                            />
                                            <span className="absolute right-4 top-10 text-sm font-bold text-mop-primary font-semibold pointer-events-none">km</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Condition 2: Substation */}
                            {category === 'Substation' && (
                                <>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-mop-primary font-semibold uppercase tracking-wider mb-2">{t('substation_capacity')}</label>
                                            <input
                                                type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} disabled={isLocked}
                                                className="w-full border border-mop-primary/20 rounded-lg px-4 py-3 text-sm text-mop-primary focus:ring-2 focus:ring-mop-mist disabled:opacity-50 bg-mop-lightgrey pr-12"
                                            />
                                            <span className="absolute right-4 top-10 text-sm font-bold text-mop-primary font-semibold pointer-events-none">MVA</span>
                                        </div>
                                    </div>
                                    <div>{/* Empty space filler */}</div>
                                </>
                            )}

                            <div>{/* Empty space filler */}</div>

                            <div>
                                <label className="block text-xs font-bold text-mop-primary font-semibold uppercase tracking-wider mb-2">{t('project_location')}</label>
                                <input
                                    type="text" value={location} onChange={(e) => setLocation(e.target.value)} disabled={isLocked} placeholder="e.g., Guwahati, Assam"
                                    className="w-full border border-mop-primary/20 rounded-lg px-4 py-3 text-sm text-mop-primary focus:ring-2 focus:ring-mop-mist disabled:opacity-50 bg-mop-lightgrey"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-mop-primary uppercase tracking-wider mb-2">{t('official_start_date')}</label>
                                <input
                                    type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLocked}
                                    className="w-full border border-teal-600/50 rounded-lg px-4 py-3 text-sm font-bold text-mop-primary disabled:bg-gray-100 disabled:text-mop-primary font-semibold bg-mop-mist/10 shadow-inner outline-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-4 border-t border-mop-primary/20 pt-6 mt-2 flex items-center justify-between">
                                {!isLocked ? (
                                    <button onClick={handleLock} className="bg-mop-primary text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm shadow-md transition-all hover:-translate-y-1 flex items-center min-w-[320px] justify-center ml-auto">
                                        <Lock size={18} className="mr-3" /> {t('lock_initialize')}
                                    </button>
                                ) : (
                                    <div className="ml-auto flex items-center bg-mop-mist/10 border-2 border-teal-600/30 rounded-xl px-2 py-2 shadow-inner min-w-[320px]">
                                        <div className="bg-mop-mist text-white rounded-lg p-2 mr-3 animate-pulse shadow-md"><Play size={20} /></div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-mop-primary uppercase tracking-widest mb-0.5">Current Simulation Date</label>
                                            <input
                                                type="date" min={startDate} value={currentSimDate} onChange={(e) => setCurrentSimDate(e.target.value)}
                                                className="bg-transparent font-black text-mop-primary outline-none w-full cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scoreboard */}
                    {isLocked && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10 animate-[fadeIn_0.5s_ease-out]">
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-5">
                                <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest flex items-center mb-2"><Calendar size={12} className="mr-1" /> {t('orig_deadline_vs_live')}</p>
                                <p className="text-2xl font-black text-mop-primary font-['Outfit']">{baseDuration} <span className="text-sm font-bold text-mop-primary font-semibold">{t('days_target')}</span></p>
                                {totalDelayDays > 0 ? (
                                    <p className="text-xs font-bold text-rose-800 mt-2 bg-rose-50 border border-rose-100 py-1 px-2 rounded inline-flex items-center"><AlertCircle size={10} className="mr-1" /> +{totalDelayDays} Days Delay</p>
                                ) : (
                                    <p className="text-xs font-bold text-emerald-800 mt-2 bg-mop-mist/10 border border-emerald-100 py-1 px-2 rounded inline-block">On Schedule</p>
                                )}
                            </div>

                            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-5 relative overflow-hidden">
                                {marketVariance !== 0 && (
                                    <div className={`absolute top-0 left-0 w-1 rounded-full h-full ${marketVariance > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                )}
                                <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest flex items-center mb-2"><IndianRupee size={12} className="mr-1" /> {t('live_projected_cost')}</p>
                                <p className="text-2xl font-black text-mop-primary font-['Outfit']">₹{(liveCost / 10000000).toFixed(2)} <span className="text-sm font-bold text-mop-primary font-semibold">{t('cr')}</span></p>

                                <div className="flex flex-col gap-1 mt-2">
                                    {totalDelayDays > 0 && <p className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-100 py-1 px-2 rounded w-fit">+₹{((totalDelayDays * dailyOverheadRate) / 100000).toFixed(2)} {t('lakhs')} {t('time_overrun')}</p>}
                                    {marketVariance !== 0 && (
                                        <p className={`text-[10px] font-bold bg-mop-offwhite border py-1 px-2 rounded w-fit ${marketVariance > 0 ? 'text-rose-700 border-rose-300' : 'text-emerald-700 border-emerald-500/30'}`}>
                                            {marketVariance > 0 ? '+' : '-'}₹{(Math.abs(marketVariance) / 100000).toFixed(2)} {t('lakhs')} {t('market_shift')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-5">
                                <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest flex items-center mb-2"><Thermometer size={12} className="mr-1" /> {t('daily_overhead_burn')}</p>
                                <p className="text-2xl font-black text-mop-primary font-['Outfit']">₹1.5 <span className="text-sm font-bold text-mop-primary font-semibold">{t('lakhs_day')}</span></p>
                                <p className="text-[10px] font-bold text-mop-primary font-semibold mt-2 pt-2 border-t border-mop-primary/20">{t('fixed_rate_idc')}</p>
                            </div>

                            <div className={`rounded-2xl shadow-xl border p-5 flex flex-col items-center justify-center text-center backdrop-blur-md ${healthStatus === 'CRITICAL' ? 'bg-rose-50/90 border-rose-300' : healthStatus === 'AT RISK' ? 'bg-amber-50/90 border-amber-300' : 'bg-emerald-50/90 border-emerald-300'}`}>
                                <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest mb-1">{t('project_health')}</p>
                                <h3 className={`text-3xl font-black font-['Outfit'] tracking-tight ${healthStatus === 'CRITICAL' ? 'text-rose-600' : healthStatus === 'AT RISK' ? 'text-amber-600' : 'text-mop-primary'}`}>
                                    {healthStatus}
                                </h3>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                        {/* Layer Trackers */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-lg font-bold text-white/90 drop-shadow-md font-['Outfit'] flex items-center mb-4"><Activity size={18} className="text-blue-400 mr-2 drop-shadow" /> {t('manual_workload_tracker')}</h3>

                            {!isLocked && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium p-4 rounded-xl flex mb-4">
                                    <AlertTriangle className="mr-3 shrink-0" size={20} />
                                    {t('setup_locked_alert')}
                                </div>
                            )}

                            <div style={{ opacity: isLocked ? 1 : 0.5, pointerEvents: isLocked ? 'auto' : 'none' }} className="transition-opacity duration-300 space-y-3">
                                {layers.map((layer) => {
                                    const isExpanded = expandedLayer === layer.id;
                                    const isComplete = layer.actual >= layer.target && layer.target > 0;
                                    const percent = layer.target > 0 ? Math.min(100, Math.round((layer.actual / layer.target) * 100)) : 0;

                                    return (
                                        <div key={layer.id} className={`bg-mop-offwhite rounded-xl border transition-all duration-300 ${isExpanded ? 'border-teal-300 shadow-md' : 'border-mop-primary/20 shadow-sm hover:border-teal-600/50'}`}>
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer select-none"
                                                onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                                            >
                                                <div className="flex items-center space-x-4 w-full">
                                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${isComplete ? 'bg-emerald-100 text-mop-primary' : 'bg-gray-800/60 text-mop-primary font-semibold'}`}>
                                                        {layer.id}
                                                    </div>
                                                    <div className="flex-1 flex items-center">
                                                        <h4 className={`font-bold text-sm ${isComplete ? 'text-emerald-700' : 'text-mop-primary'}`}>{layer.name}</h4>
                                                        {isComplete && <span className="ml-3 flex items-center text-[10px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded"><CheckCircle size={12} className="mr-1" /> {t('phase_completed')}</span>}
                                                    </div>
                                                    <div className="w-1/4 hidden md:block">
                                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-mop-mist/100' : 'bg-mop-mist'}`} style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-bold text-mop-primary font-semibold w-12 text-right">{percent}%</div>
                                                    <div className="text-mop-primary font-semibold">
                                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="p-5 border-t border-mop-primary/20 bg-mop-offwhite">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                        {/* Manual Inputs for Layer */}
                                                        <div className="space-y-4 md:col-span-2 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-widest mb-2">{t('total_target_required')}</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={layer.target}
                                                                        disabled={true}
                                                                        className="w-full border border-emerald-500/20 rounded-lg px-4 py-3 text-sm font-bold text-emerald-700 bg-emerald-500/5 focus:outline-none pr-16"
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-mop-primary font-semibold">{layer.unit}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-mop-primary uppercase tracking-widest mb-2">{t('actual_completed')}</label>
                                                                <div className="relative border border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
                                                                    <input
                                                                        type="number"
                                                                        value={layer.actual}
                                                                        onChange={(e) => updateLayer(layer.id, 'actual', e.target.value)}
                                                                        disabled={isComplete}
                                                                        className="w-full border-none bg-transparent px-4 py-3 text-sm font-black text-blue-800 disabled:opacity-70 focus:ring-0 outline-none pr-16"
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-blue-400">{layer.unit}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-mop-offwhite border text-center rounded-lg p-3 flex flex-col justify-center border-mop-primary/20">
                                                            <p className="text-[10px] font-bold text-mop-primary font-semibold uppercase tracking-wider mb-1">{t('time_window')}</p>
                                                            <p className="text-xl font-black text-mop-primary font-['Outfit']">{layer.durationDays} <span className="text-xs font-bold text-mop-primary font-semibold">{t('days')}</span></p>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Delay Log UI */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden h-[700px] flex flex-col border border-white/40 relative">
                                {/* Matrix aesthetic top bar */}
                                <div className="bg-white/50 backdrop-blur-md p-4 border-b border-white/40 flex items-center justify-between z-10 shadow-sm">
                                    <h3 className="text-xs font-black text-mop-primary font-['Outfit'] flex items-center uppercase tracking-widest"><AlertTriangle size={14} className="text-rose-800 mr-2" /> {t('active_delay_log')}</h3>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-mop-mist/100 animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                                    {logs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <Clock size={32} className="mb-3 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-center">{t('system_idle')}<br />{t('awaiting_bottlenecks')}</p>
                                        </div>
                                    ) : (
                                        logs.map((log, idx) => (
                                            <div key={idx} className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-rose-300 animate-[fadeIn_0.3s_ease-out] shadow-md">
                                                <div className="flex items-center text-[10px] font-mono text-mop-primary font-semibold mb-2 border-b border-mop-primary/20 pb-2">
                                                    <Clock size={10} className="mr-1" /> {log.date}
                                                </div>
                                                <p className="text-sm font-semibold text-mop-primary mb-3 leading-relaxed">{log.msg}</p>
                                                <div className="inline-flex items-center bg-rose-500/10 border border-rose-300 text-rose-700 text-xs font-bold px-3 py-2 rounded-lg leading-tight">
                                                    <AlertCircle size={14} className="mr-2 shrink-0" /> {log.impact}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};
