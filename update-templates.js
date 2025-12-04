const fs = require('fs');

// Read templates
const servicesTemplate = fs.readFileSync('src/js/templates/services.js', 'utf8')
  .replace(/^\/\/ Services Template\s*\n/, '')
  .replace(/^export default `\s*\n/, '')
  .replace(/\s*`;\s*$/s, '')
  .trim();

const aboutTemplate = fs.readFileSync('src/js/templates/about.js', 'utf8')
  .replace(/^\/\/ About Template\s*\n/, '')
  .replace(/^export default `\s*\n/, '')
  .replace(/\s*`;\s*$/s, '')
  .trim();

const contactTemplate = fs.readFileSync('src/js/templates/contact.js', 'utf8')
  .replace(/^\/\/ Contact Template\s*\n/, '')
  .replace(/^export default `\s*\n/, '')
  .replace(/\s*`;\s*$/s, '')
  .trim();

// Read app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// Replace services template
appJs = appJs.replace(
  /(services:\s*`)[^]*?(\n\s*`,\s*\n\s*about:)/,
  '$1\n' + servicesTemplate + '\n  $2'
);

// Replace about template
appJs = appJs.replace(
  /(about:\s*`)[^]*?(\n\s*`,\s*\n\s*contact:)/,
  '$1\n' + aboutTemplate + '\n  $2'
);

// Replace contact template
appJs = appJs.replace(
  /(contact:\s*`)[^]*?(\n\s*`,\s*\n\s*login:)/,
  '$1\n' + contactTemplate + '\n  $2'
);

// Write updated app.js
fs.writeFileSync('app.js', appJs);
console.log('✓ Templates updated successfully!');
