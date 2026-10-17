const fs = require('fs');
const path = require('path');

// 1. Validate JSON
try {
  const jsonPath = path.join(__dirname, '..', 'public', 'data', 'products.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`JSON valid! Found ${data.length} products.`);
  data.forEach((p, i) => {
    if (!p.id || !p.name || !p.category || !p.price || !p.images) {
      console.error(`Product ${i} missing essential fields:`, p);
    }
  });
} catch (e) {
  console.error('JSON Error:', e);
}

// 2. Syntax check JS files
const jsFiles = ['app.js', 'products.js', 'cart.js', 'lightbox.js', 'theme.js'];
for (const file of jsFiles) {
  const filePath = path.join(__dirname, '..', 'public', 'js', file);
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    // Remove export default, export const/function, and import statements to test with new Function
    const cleaned = code
      .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
      .replace(/export\s+(default\s+)?/g, '');
    new Function(cleaned);
    console.log(`JS ${file} syntax valid!`);
  } catch (err) {
    console.error(`JS ${file} syntax error:`, err);
  }
}

// 3. Verify CSS files exist and are non-empty
const cssFiles = ['base.css', 'layout.css', 'components.css'];
for (const file of cssFiles) {
  const filePath = path.join(__dirname, '..', 'public', 'css', file);
  const stat = fs.statSync(filePath);
  console.log(`CSS ${file}: ${stat.size} bytes`);
}

// 4. Verify index.html exists and is non-empty
const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const htmlStat = fs.statSync(htmlPath);
console.log(`HTML index.html: ${htmlStat.size} bytes`);
