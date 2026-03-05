const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const files = ['Dashboard.tsx', 'Predictor.tsx', 'LiveSimulator.tsx', 'Login.tsx'];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Main background and text
    content = content.replace(/bg-gradient-to-br from-slate-50 via-slate-100 to-(slate-200|teal-50\/30)/g, 'bg-mop-offwhite');
    content = content.replace(/bg-slate-50(?![\/\-])/g, 'bg-mop-offwhite'); // Other generic bg-slate-50 to offwhite

    // Text generic replacements to Ministry Blue
    content = content.replace(/text-slate-800/g, 'text-mop-primary/90');
    content = content.replace(/text-slate-700/g, 'text-mop-primary/90');
    content = content.replace(/text-slate-500/g, 'text-mop-primary/70');
    content = content.replace(/text-blue-900/g, 'text-mop-primary');

    // Mist Blue replacements
    content = content.replace(/text-teal-600/g, 'text-mop-mist');
    content = content.replace(/text-teal-500/g, 'text-mop-mist');
    content = content.replace(/bg-teal-600/g, 'bg-mop-mist');
    content = content.replace(/border-t-teal-600/g, 'border-t-mop-mist');

    // Form borders
    content = content.replace(/border-slate-200/g, 'border-mop-primary/20');

    // Re-styling Login EN / HI buttons specifically if found
    content = content.replace(/<button className="px-3 py-1 bg-mop-mist text-white text-xs font-bold rounded shadow-sm flex items-center">([\s\S]*?)<\/button>/, `<button className="px-3 py-1 bg-mop-primary text-white text-xs font-bold rounded shadow-sm flex items-center">$1</button>`);
    content = content.replace(/<button className="px-3 py-1 text-mop-primary\/70 hover:text-mop-primary\/90 text-xs font-bold rounded flex items-center transition-colors">/g, `<button className="px-3 py-1 text-slate-500 bg-mop-offwhite border border-mop-primary/20 hover:text-mop-primary text-xs font-bold rounded flex items-center transition-colors">`);

    // Form elements specific overrides
    // Look for form inputs and selects.
    content = content.replace(/className="w-full bg-mop-offwhite border border-mop-primary\/20 rounded-xl/g, 'className="w-full bg-mop-lightgrey border border-mop-primary rounded-xl');

    // Focus states
    content = content.replace(/focus:border-teal-600(?:\/50)?/g, 'focus:border-mop-mist');
    content = content.replace(/focus:ring-teal-600(?:\/50)?/g, 'focus:ring-mop-mist focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(225,236,244,0.6)]');

    // Primary Button update
    content = content.replace(/className="bg-mop-primary hover:bg-blue-800 text-white/g, 'className="bg-mop-primary text-white');
    content = content.replace(/className="bg-blue-900 hover:bg-blue-800 text-white/g, 'className="bg-mop-primary text-white');

    // Logout Button
    content = content.replace(/bg-slate-100 text-slate-600 hover:bg-slate-200/g, 'bg-slate-600 text-white hover:bg-slate-700');

    // Top active icon logic (which was teal-600/mop-mist, now maybe keep it, but give it mop-mist style)
    content = content.replace(/p-1.5 bg-mop-mist text-white rounded-lg/g, 'p-1.5 bg-mop-mist text-mop-primary rounded-lg');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
