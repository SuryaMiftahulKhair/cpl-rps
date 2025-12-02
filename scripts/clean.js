const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '..', '.next');

async function removeDir(dir) {
  return new Promise((resolve, reject) => {
    fs.rm(dir, { recursive: true, force: true }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

(async () => {
  try {
    if (!fs.existsSync(target)) {
      console.log('.next folder not found — nothing to clean.');
      process.exit(0);
    }

    console.log('Removing .next folder:', target);
    await removeDir(target);
    console.log('Removed .next successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to remove .next:', err && err.message ? err.message : err);
    console.error('If this is an EPERM/Permission error:');
    console.error('- Make sure no Node/Next processes are running (stop with: Get-Process -Name node | Stop-Process -Force)');
    console.error('- Try running PowerShell as Administrator and re-run: npm run clean');
    console.error('- If antivirus is blocking, disable real-time scan temporarily.');
    process.exit(2);
  }
})();
