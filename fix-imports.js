const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('dir /S /B src\\app\\api\\*.ts').toString().split('\r\n').filter(Boolean);

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (content.includes('getSession(req)')) {
    content = content.replace(/getSession\(req\)/g, 'getSession()');
    changed = true;
  }
  if (content.match(/import\s*\{\s*getSession\s*\}\s*from\s*['"]@\/lib\/auth\/session['"];?/)) {
    content = content.replace(/import\s*\{\s*getSession\s*\}\s*from\s*['"]@\/lib\/auth\/session['"];?/, "import { getCurrentSession as getSession } from '@/lib/auth/session';");
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
