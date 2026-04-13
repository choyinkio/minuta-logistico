const fs = require('fs');

function unescapeFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(path, content);
  console.log('Fixed', path);
}

unescapeFile('src/app/config/zonas/page.tsx');
unescapeFile('src/app/config/sucursales/page.tsx');
