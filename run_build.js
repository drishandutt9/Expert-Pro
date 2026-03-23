const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('npm run build', { stdio: 'pipe', encoding: 'utf-8' });
  fs.writeFileSync('build.log', 'Success');
} catch (e) {
  fs.writeFileSync('build.log', e.stdout || '' + '\n' + e.stderr || '');
}
