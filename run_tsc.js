const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
  fs.writeFileSync('tsc.log', 'Success');
} catch (e) {
  fs.writeFileSync('tsc.log', (e.stdout || '') + '\n' + (e.stderr || ''));
}
