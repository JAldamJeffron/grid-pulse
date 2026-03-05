import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import jsonData from '../data/gridpulse_50_projects.json';
import { Activity, LogOut, CheckCircle, AlertTriangle, AlertOctagon, Map as MapIcon, Layers, Search, BarChart3, Target, Radio, Satellite, Bell, User, Zap, Shield } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    // Filtering logic
    const filteredProjects = useMemo(() => {
        let result = jsonData;
        if (activeFilter !== 'All') {
            result = result.filter(p => p.health === activeFilter);
        }
        if (searchTerm) {
            const lowerFilter = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.projectName.toLowerCase().includes(lowerFilter) ||
                p.location.toLowerCase().includes(lowerFilter)
            );
        }
        return result;
    }, [activeFilter, searchTerm]);

    // Top Ribbon Stats
    const stats = useMemo(() => {
        return {
            total: jsonData.length,
            green: jsonData.filter(p => p.health === 'Green').length,
            yellow: jsonData.filter(p => p.health === 'Yellow').length,
            red: jsonData.filter(p => p.health === 'Red').length,
        }
    }, []);

    // Hindrance Radar Logic
    const radarData = useMemo(() => {
        const categories = { 'Weather': 0, 'ROW/Protest': 0, 'Supply Chain': 0, 'Logistics': 0, 'Other': 0 };
        filteredProjects.forEach(p => {
            if (p.delayReason === 'None') return;
            const r = p.delayReason.toLowerCase();
            if (r.includes('weather') || r.includes('monsoon') || r.includes('snow') || r.includes('flood') || r.includes('cyclone') || r.includes('sandstorm')) {
                categories['Weather']++;
            } else if (r.includes('row') || r.includes('land') || r.includes('protest') || r.includes('clearance') || r.includes('court') || r.includes('strike')) {
                categories['ROW/Protest']++;
            } else if (r.includes('supply') || r.includes('vendor') || r.includes('constraint') || r.includes('aluminum') || r.includes('conductor') || r.includes('price')) {
                categories['Supply Chain']++;
            } else if (r.includes('logistic') || r.includes('permit') || r.includes('terrain') || r.includes('rock') || r.includes('utility')) {
                categories['Logistics']++;
            } else {
                categories['Other']++;
            }
        });
        return Object.keys(categories).map(k => ({ subject: k, A: categories[k as keyof typeof categories], fullMark: Math.max(...Object.values(categories)) || 10 }));
    }, [filteredProjects]);

    // Budget Bar Chart Logic (Top 5 expensive projects in current filter)
    const budgetData = useMemo(() => {
        return [...filteredProjects]
            .sort((a, b) => b.actualBudgetCr - a.actualBudgetCr)
            .slice(0, 5)
            .map(p => ({
                name: p.projectId,
                planned: p.plannedBudgetCr,
                actual: p.actualBudgetCr
            }));
    }, [filteredProjects]);

    const getHealthColor = (health: string) => {
        if (health === 'Green') return 'text-emerald-700 bg-emerald-50 border-emerald-200 glow-emerald';
        if (health === 'Yellow') return 'text-amber-700 bg-amber-50 border-amber-200 glow-amber';
        if (health === 'Red') return 'text-rose-700 bg-rose-50 border-rose-200 glow-rose';
        return 'text-mop-primary font-semibold bg-slate-100 border-mop-primary/20 glow-gray';
    };

    return (
        <div className="min-h-screen text-mop-primary font-sans selection:bg-mop-mist/30 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/login-bg.jpg')" }}>

            {/* Cinematic Blur Overlay for Dashboard */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-0 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Navbar */}
                <nav className="bg-white/85 backdrop-blur-md border-b border-white/40 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <img src="/mop-logo.png" alt="Company Logo" className="h-[38px] w-auto bg-white p-1 rounded" />
                        <div className="border-l border-mop-primary/20 pl-4 flex items-center">
                            <Activity size={20} className="text-teal-600 mr-2" />
                            <h1 className="text-xl font-black tracking-tight text-mop-primary font-['Outfit']">
                                GridPulse <span className="text-mop-primary font-bold text-xs ml-2 tracking-widest uppercase opacity-80">Predictive Twin Engine</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        {/* Language Switcher */}
                        <div className="flex bg-white/20 backdrop-blur-md border border-mop-primary/10 rounded-full p-0.5 shadow-sm">
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

                        {/* Main Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-6 text-sm font-bold text-mop-primary/90">
                            <Link to="/dashboard" className={`pb-1 border-b-2 transition-all ${window.location.pathname === '/dashboard' ? 'text-mop-primary border-teal-600' : 'hover:text-mop-primary border-transparent'}`}>{t('dashboard')}</Link>
                            <Link to="/live-simulator" className="hover:text-mop-primary transition-colors pb-1">{t('simulator')}</Link>
                            <Link to="/predictor" className="hover:text-mop-primary transition-colors pb-1">{t('predictor')}</Link>
                        </div>

                        <div className="w-px h-6 bg-mop-primary/20 hidden lg:block"></div>

                        {/* Action Panel */}
                        <div className="flex items-center space-x-5">
                            <button className="text-mop-primary hover:text-teal-600 transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-600 rounded-full border border-white"></span>
                            </button>
                            <button className="bg-mop-primary/5 p-1.5 rounded-full text-mop-primary hover:bg-mop-primary/10 transition-colors">
                                <User size={18} />
                            </button>

                            <div className="flex items-center space-x-3 pl-2 border-l border-mop-primary/10">
                                <Link to="/login" className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-700 text-white hover:bg-slate-800 rounded transition-all flex items-center shadow shadow-slate-900/20">
                                    <LogOut size={12} className="mr-1.5" /> {t('logout')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Live Global Intelligence Feed Ticker */}
                <div className="bg-white/60 backdrop-blur-md border-b border-white/40 text-[10px] uppercase font-bold text-mop-primary py-1.5 overflow-hidden flex items-center shadow-inner relative z-40">
                    <div className="px-4 border-r border-white/40 flex items-center bg-white/70 relative z-10 shrink-0 shadow-sm">
                        <Radio size={12} className="mr-2 animate-pulse text-rose-800" /> Live Feed
                    </div>
                    <div className="flex-1 whitespace-nowrap animate-[marquee_25s_linear_infinite] px-4 flex space-x-12 opacity-80 hover:opacity-100 transition-opacity cursor-default">
                        <span><strong className="text-mop-primary">Alert:</strong> Severe Monsoon Front approaching West Bengal. Phase 6 (Excavation) halted at Siliguri.</span>
                        <span><strong className="text-mop-primary">Market Update:</strong> Aluminum Conductor prices spiked by 12% in current quarter. Risk multiplier activated.</span>
                        <span><strong className="text-mop-primary">ROW Cleared:</strong> Land Acquisition for 765kV Pune Ring Network approved 2 months ahead of schedule.</span>
                        <span><strong className="text-mop-primary">Geopolitics:</strong> Supply chain delay detected (Transformers). 18 projects affected. Cost reassessment mandated.</span>
                    </div>
                </div>

                <main className="max-w-[1600px] mx-auto p-6 space-y-6 relative z-10">

                    {/* KPI Panel */}
                    <div className="grid grid-cols-4 gap-4">
                        <div
                            onClick={() => setActiveFilter('All')}
                            className={`cursor-pointer rounded-xl p-5 border bg-white/90 backdrop-blur-md transition-all duration-300 shadow-sm ${activeFilter === 'All' ? 'border-teal-600 shadow-md ring-1 ring-teal-600/30' : 'border-mop-primary/10 hover:border-mop-primary/30 hover:shadow-md'}`}
                        >
                            <h3 className="text-[11px] font-bold text-mop-primary/90 uppercase tracking-widest mb-2 flex items-center"><Layers size={14} className="mr-2 text-teal-600" /> {t('total_portfolio')}</h3>
                            <div className="text-4xl font-black text-mop-primary font-['Outfit']">{stats.total}</div>
                        </div>
                        <div
                            onClick={() => setActiveFilter('Green')}
                            className={`cursor-pointer rounded-xl p-5 border bg-white/90 backdrop-blur-md transition-all duration-300 shadow-sm ${activeFilter === 'Green' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/30' : 'border-mop-primary/10 hover:border-mop-primary/30 hover:shadow-md'}`}
                        >
                            <h3 className="text-[11px] font-bold text-mop-primary/90 uppercase tracking-widest mb-2 flex items-center"><CheckCircle size={14} className="mr-2 text-emerald-500" /> {t('on_track')}</h3>
                            <div className="text-4xl font-black text-emerald-700 font-['Outfit']">{stats.green}</div>
                        </div>
                        <div
                            onClick={() => setActiveFilter('Yellow')}
                            className={`cursor-pointer rounded-xl p-5 border bg-white/90 backdrop-blur-md transition-all duration-300 shadow-sm ${activeFilter === 'Yellow' ? 'border-amber-500 shadow-md ring-1 ring-amber-500/30' : 'border-mop-primary/10 hover:border-mop-primary/30 hover:shadow-md'}`}
                        >
                            <h3 className="text-[11px] font-bold text-mop-primary/90 uppercase tracking-widest mb-2 flex items-center"><AlertTriangle size={14} className="mr-2 text-amber-500" /> {t('at_risk')}</h3>
                            <div className="text-4xl font-black text-amber-600 font-['Outfit']">{stats.yellow}</div>
                        </div>
                        <div
                            onClick={() => setActiveFilter('Red')}
                            className={`cursor-pointer rounded-xl p-5 border bg-white/90 backdrop-blur-md transition-all duration-300 shadow-sm ${activeFilter === 'Red' ? 'border-rose-600 shadow-md ring-1 ring-rose-600/30' : 'border-mop-primary/10 hover:border-mop-primary/30 hover:shadow-md'}`}
                        >
                            <h3 className="text-[11px] font-bold text-mop-primary/90 uppercase tracking-widest mb-2 flex items-center"><AlertOctagon size={14} className="mr-2 text-rose-600" /> {t('critical_delays')}</h3>
                            <div className="text-4xl font-black text-rose-700 font-['Outfit']">{stats.red}</div>
                        </div>
                    </div>

                    {/* Main Middle Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[750px]">

                        {/* Geospatial Map (Spans 2/3) */}
                        <div className="xl:col-span-2 bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
                            <div className="px-6 py-4 border-b border-white/40 flex justify-between items-center bg-white/50">
                                <h2 className="text-sm font-bold text-mop-primary uppercase tracking-widest flex items-center"><MapIcon size={16} className="mr-2 text-mop-primary" /> {t('network_map')}</h2>
                                <span className="text-xs px-2 py-1 bg-black/50 rounded border border-mop-primary/20 text-mop-primary font-semibold">{t('showing_nodes', { count: filteredProjects.length })}</span>
                            </div>
                            {/* Sci-Fi Map Overlay UI */}
                            <div className="absolute top-16 left-4 z-10 pointer-events-none drop-shadow-md">
                                <div className="bg-white/90 backdrop-blur-md shadow-lg border border-mop-primary/20 p-3 rounded-lg flex items-center gap-3">
                                    <Satellite size={20} className="text-mop-primary animate-[spin_10s_linear_infinite]" />
                                    <div>
                                        <div className="text-[9px] text-mop-primary font-semibold font-bold uppercase tracking-widest leading-none mb-1">{t('satellite_link')}</div>
                                        <div className="text-xs font-bold text-emerald-700 flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></div> {t('active_sync')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full relative z-0">
                                <MapContainer
                                    center={[22.5, 78.5]}
                                    zoom={5}
                                    style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    {filteredProjects.map((project) => (
                                        <CircleMarker
                                            key={project.projectId}
                                            center={[project.coordinates.lat, project.coordinates.lng]}
                                            radius={project.health === 'Red' ? 8 : 6}
                                            pathOptions={{
                                                color: project.health === 'Green' ? '#34d399' : project.health === 'Yellow' ? '#fbbf24' : '#f43f5e',
                                                fillColor: project.health === 'Green' ? '#059669' : project.health === 'Yellow' ? '#d97706' : '#e11d48',
                                                fillOpacity: 0.8,
                                                className: project.health === 'Red' ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''
                                            }}
                                        >
                                            <Popup className="custom-popup">
                                                <div className="bg-white p-4 rounded-lg border border-mop-primary/20 shadow-xl min-w-[200px] text-mop-primary">
                                                    <h4 className="font-bold text-sm mb-1">{project.projectName}</h4>
                                                    <p className="text-xs text-mop-primary font-semibold mb-3">{project.type} | {project.location}</p>
                                                    <div className="text-xs">
                                                        <span className={`px-2 py-1.5 rounded font-bold shadow-sm ${project.health === 'Red' ? 'bg-rose-50 text-rose-600 border border-rose-200' : project.health === 'Yellow' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                    {project.health !== 'Green' && (
                                                        <p className="mt-4 text-[10px] text-rose-600 leading-tight border-t border-slate-100 pt-3 bg-rose-50/50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                                                            <strong className="text-rose-600 uppercase tracking-wider block mb-1">{t('delay_reason_label')}</strong>{project.delayReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>

                        {/* AI Risk & Finances (Spans 1/3) */}
                        <div className="xl:col-span-1 flex flex-col gap-6 h-full">

                            {/* Budget Bar Chart */}
                            <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-5 flex-1 flex flex-col">
                                <h2 className="text-xs font-bold text-mop-primary font-semibold uppercase tracking-widest mb-4 flex items-center"><BarChart3 size={14} className="mr-2 text-rose-800" /> {t('cost_overruns')}</h2>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={budgetData} layout="vertical" margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1f2937" />
                                            <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#9ca3af' }} width={55} axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{ fill: '#1f2937' }} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', fontSize: '12px' }} />
                                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                                            <Bar dataKey="planned" name={t('planned')} fill="#0d9488" radius={[0, 2, 2, 0]} barSize={8} />
                                            <Bar dataKey="actual" name={t('actual_cost')} fill="#e11d48" radius={[0, 2, 2, 0]} barSize={8} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Hindrance Radar */}
                            <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-5 flex-1 flex flex-col">
                                <h2 className="text-xs font-bold text-mop-primary font-semibold uppercase tracking-widest mb-2 flex items-center"><Target size={14} className="mr-2 text-mop-primary" /> {t('hindrance_origin')}</h2>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="#374151" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                                            <Radar name="Impact Count" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', fontSize: '12px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Insights & Scalability */}
                            <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-5 flex-1 flex flex-col justify-center">
                                <h2 className="text-xs font-bold text-mop-primary font-semibold uppercase tracking-widest mb-3 flex items-center"><Zap size={14} className="mr-2 text-amber-500" /> {t('insights')}</h2>
                                <div className="bg-white/60 rounded border border-white/40 p-4 mb-3">
                                    <p className="text-xs text-mop-primary font-semibold leading-relaxed mb-2"><strong className="text-mop-primary">Scalability Forecast:</strong> 14 projects operating near margin limits. Suggesting dynamic rerouting of material supply lines for Q3.</p>
                                    <p className="text-xs text-mop-primary font-semibold leading-relaxed"><strong className="text-mop-primary">Workload Accelerator:</strong> AI model predicts 12% efficiency gain by paralleling tower foundation execution in Zone B.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Master Data Ledger */}
                    <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl overflow-hidden mt-6 mb-10">
                        <div className="p-5 border-b border-white/40 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
                            <h2 className="text-sm font-bold text-mop-primary uppercase tracking-widest">{t('master_ledger')}</h2>
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search projects or locations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/60 border border-white/40 text-sm text-mop-primary rounded-full px-4 py-2 pl-10 focus:outline-none focus:border-mop-mist transition-colors shadow-inner"
                                />
                                <Search size={16} className="absolute left-3 top-2.5 text-mop-primary font-semibold" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-mop-primary font-semibold uppercase">{t('id')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-mop-primary font-semibold uppercase">{t('project_name')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-mop-primary font-semibold uppercase">{t('location_type')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-mop-primary font-semibold uppercase">{t('timeline')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-mop-primary font-semibold uppercase">{t('budget_status')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-mop-primary font-semibold uppercase">{t('health_status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {filteredProjects.map((p) => {
                                        const hColor = getHealthColor(p.health);
                                        const timeOvr = p.actualDurationMonths - p.plannedDurationMonths;
                                        const budgOvr = p.actualBudgetCr - p.plannedBudgetCr;
                                        const budgPercent = Math.min(100, (p.actualBudgetCr / p.plannedBudgetCr) * 100);

                                        return (
                                            <tr key={p.projectId} className="hover:bg-mop-offwhite transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs text-mop-primary font-semibold">{p.projectId}</td>
                                                <td className="px-6 py-4 font-bold text-mop-primary">{p.projectName}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-mop-primary font-medium">{p.location}</div>
                                                    <div className="text-[10px] text-mop-primary font-semibold uppercase">{p.type}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-mop-primary font-medium">{p.actualDurationMonths} months</div>
                                                    <div className={`text-[10px] uppercase font-bold ${timeOvr > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                        {timeOvr > 0 ? `+${timeOvr}m Delay` : 'On Schedule'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="text-mop-primary font-medium">₹{p.actualBudgetCr} <span className="text-mop-primary font-semibold text-[10px]">/ ₹{p.plannedBudgetCr} Cr</span></div>
                                                        <div className={`text-[10px] uppercase font-bold ${budgOvr > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                            {budgOvr > 0 ? `+₹${budgOvr}Cr` : 'On Budget'}
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-1 bg-mop-offwhite rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${budgPercent > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, budgPercent)}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`px-3 py-1.5 rounded-full inline-flex items-center text-[10.5px] font-bold uppercase tracking-wider border ${hColor}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${p.health === 'Red' ? 'bg-rose-500 animate-pulse' : p.health === 'Yellow' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                                        {p.health === 'Red' ? 'Critical' : p.health === 'Yellow' ? 'At Risk' : 'On Track'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredProjects.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-mop-primary font-semibold">
                                                No projects found matching the criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main >

                {/* Corporate Footer */}
                <footer className="w-full bg-white/85 backdrop-blur-md border-t border-white/40 py-6 px-8 flex flex-col md:flex-row items-center justify-between text-xs text-mop-primary/90 font-semibold mt-10 z-10 relative shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center space-x-2">
                        <span>&copy; {new Date().getFullYear()} GridPulse - <strong>CONFIDENTIAL</strong></span>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0 space-x-6 text-[10px] uppercase tracking-wider font-bold">
                        <span>System Time: {new Date().toISOString().replace('T', ' ').split('.')[0]} UTC</span>
                        <span className="flex items-center text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                            <Shield size={12} className="mr-1" /> DPDP Compliant for POWERGRID
                        </span>
                    </div>
                </footer>

                {/* Global Styles injected for map popups and glows */}
                < style dangerouslySetInnerHTML={{
                    __html: `
                .glow-emerald { box-shadow: 0 0 20px -5px rgba(16, 185, 129, 0.3); }
                .glow-amber { box-shadow: 0 0 20px -5px rgba(245, 158, 11, 0.3); }
                .glow-rose { box-shadow: 0 0 25px -5px rgba(244, 63, 94, 0.4); }
                .glow-teal { box-shadow: 0 0 20px -5px rgba(249, 115, 22, 0.3); }
                .glow-gray { box-shadow: 0 0 20px -5px rgba(156, 163, 175, 0.3); }
                
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-150%); }
                }
                
                .leaflet-container { background: transparent !important; }
                .custom-popup .leaflet-popup-content-wrapper { background: transparent; box-shadow: none; padding: 0; }
                .custom-popup .leaflet-popup-tip-container { display: none; }
                .custom-popup .leaflet-popup-content { margin: 0; }
            `}} />
            </div>
        </div>
    );
};
