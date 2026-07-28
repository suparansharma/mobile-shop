const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'database', 'migrations');
const files = fs.readdirSync(migrationsDir);

files.forEach(file => {
  if (file.endsWith('.php')) {
    let content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    if (content.includes('\\n')) {
        content = content.replace(/\\n/g, '\n');
        fs.writeFileSync(path.join(migrationsDir, file), content, 'utf8');
        console.log('Fixed ' + file);
    }
  }
});
