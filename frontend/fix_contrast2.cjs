const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const indexStyle = path.join(__dirname, 'src/index.css');

const files = ['Dashboard.tsx', 'Predictor.tsx', 'LiveSimulator.tsx', 'Login.tsx'];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove text-mop-primary/90 and just use solid text-mop-primary for maximum visibility
    content = content.replace(/text-mop-primary\/90/g, 'text-mop-primary font-semibold');
    content = content.replace(/text-mop-primary\/80/g, 'text-mop-primary font-semibold');

    // For smaller texts, sometimes they lacked font weight, let's bump font weight slightly
    content = content.replace(/text-mop-mist/g, 'text-mop-primary');

    // Ensure titles are dark and heavy
    content = content.replace(/font-medium text-mop-primary/g, 'font-bold text-mop-primary');

    // Convert 'text-sm text-mop-primary' to 'text-sm font-semibold text-mop-primary'
    // but without causing huge regex duplicates
    // Also, inside Predictor from the screenshot we can see "ESTIMATED BASE TIMELINE", etc where 
    // it was somewhat legible but maybe we want to make it bold. 

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});

let indexContent = fs.readFileSync(indexStyle, 'utf8');
indexContent = indexContent.replace(/@apply text-mop-mist;/g, '@apply text-mop-primary;');
fs.writeFileSync(indexStyle, indexContent, 'utf8');
