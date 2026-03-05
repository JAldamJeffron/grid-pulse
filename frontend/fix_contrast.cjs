const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const files = ['Dashboard.tsx', 'Predictor.tsx', 'LiveSimulator.tsx', 'Login.tsx'];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove text-mop-mist because #E1ECF4 is nearly invisible on off-white backgrounds
    content = content.replace(/text-mop-mist/g, 'text-mop-primary');

    // Darken up any /70 opacities for better contrast
    content = content.replace(/text-mop-primary\/70/g, 'text-mop-primary/90');

    // Replace any leftover text-slate-500 or text-slate-400
    content = content.replace(/text-slate-500/g, 'text-mop-primary/90');
    content = content.replace(/text-slate-400/g, 'text-mop-primary/80');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
