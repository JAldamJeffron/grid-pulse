const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const files = ['Dashboard.tsx', 'Predictor.tsx', 'LiveSimulator.tsx', 'Login.tsx'];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Ensure all primary text doesn't fade, exactly matching the \#0047AB request
    content = content.replace(/text-mop-primary\/90/g, 'text-mop-primary');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
