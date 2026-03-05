const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const files = ['Dashboard.tsx', 'Predictor.tsx', 'LiveSimulator.tsx', 'Login.tsx'];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Convert Dark Mode backgrounds designed for black to Light Mode equivalents
    content = content.replace(/bg-rose-950\/20/g, 'bg-rose-50');
    content = content.replace(/bg-amber-950\/20/g, 'bg-amber-50');
    content = content.replace(/bg-teal-900\/20/g, 'bg-teal-50');
    content = content.replace(/bg-amber-900\/20/g, 'bg-amber-50');
    content = content.replace(/bg-emerald-900\/20/g, 'bg-emerald-50');

    // Convert Dark Mode text colors (400/500 limits) to deep recognizable colors for light mode
    content = content.replace(/text-rose-400/g, 'text-rose-700');
    content = content.replace(/text-rose-500/g, 'text-rose-800');

    content = content.replace(/text-amber-400/g, 'text-amber-600');
    content = content.replace(/text-amber-500/g, 'text-amber-700');

    content = content.replace(/text-teal-400/g, 'text-teal-700');
    content = content.replace(/text-teal-500/g, 'text-teal-800');

    content = content.replace(/text-emerald-400/g, 'text-emerald-700');
    content = content.replace(/text-emerald-500/g, 'text-emerald-800');

    // Fix the Prediction base cost box overriding issue where mop-primary is added twice
    content = content.replace(/text-mop-primary font-semibold font-semibold/g, 'text-mop-primary font-semibold');

    // Also change border colors that were transparent for dark mode
    content = content.replace(/border-rose-500\/30/g, 'border-rose-300');
    content = content.replace(/border-amber-500\/30/g, 'border-amber-300');
    content = content.replace(/border-teal-500\/30/g, 'border-teal-300');
    content = content.replace(/border-amber-900\/40/g, 'border-amber-300');
    content = content.replace(/border-teal-900\/40/g, 'border-teal-300');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
