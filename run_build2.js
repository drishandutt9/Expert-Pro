const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('npm run build', { stdio: 'pipe', encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 });
  fs.writeFileSync('build2.log', 'Success');
} catch (e) {
  fs.writeFileSync('build2.log', (e.stdout || '') + '\n\n--STDERR--\n\n' + (e.stderr || ''));
}
