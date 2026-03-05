const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const files = ['Dashboard.tsx', 'Predictor.tsx', 'LiveSimulator.tsx', 'Login.tsx'];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Main background overrides
    content = content.replace(/bg-gradient-to-br from-slate-50 via-slate-100 to-teal-50\/30/g, 'bg-mop-offwhite');
    content = content.replace(/bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/g, 'bg-mop-offwhite');
    content = content.replace(/bg-slate-50(?![\/\-])/g, 'bg-mop-offwhite');

    // Text colors
    content = content.replace(/text-slate-500/g, 'text-mop-primary');
    content = content.replace(/text-slate-700/g, 'text-mop-primary');
    content = content.replace(/text-slate-800/g, 'text-mop-primary');
    content = content.replace(/text-blue-900/g, 'text-mop-primary');
    content = content.replace(/text-teal-500/g, 'text-mop-mist');
    content = content.replace(/text-teal-600/g, 'text-mop-mist');

    // Primary / Accents
    content = content.replace(/bg-blue-900/g, 'bg-mop-primary');
    content = content.replace(/bg-teal-600/g, 'bg-mop-primary');
    content = content.replace(/border-t-teal-600/g, 'border-t-mop-mist');
    content = content.replace(/border-teal-600/g, 'border-mop-mist');
    content = content.replace(/glow-teal/g, 'glow-mop-mist');

    // Form Inputs
    content = content.replace(/bg-slate-50/g, 'bg-mop-lightgrey'); // previously changed bg-slate-50, but let's be careful
    // We already replaced bg-slate-50 above, so let's refine form inputs manually if needed
    // The previous bg-slate-50 replacement was a global one.

    // Actually, let's fix the focus states
    content = content.replace(/focus:ring-teal-600(?:\/50)?/g, 'focus:ring-mop-mist');
    content = content.replace(/focus:border-teal-600(?:\/50)?/g, 'focus:border-mop-mist');
    content = content.replace(/focus:ring-2/g, 'focus:ring-2 shadow-[0_0_10px_rgba(225,236,244,0.5)]'); // subtle halo

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
