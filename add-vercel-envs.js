const { spawn } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

const envs = dotenv.parse(fs.readFileSync('.env'));

async function addEnvs() {
  for (const [key, value] of Object.entries(envs)) {
    console.log(`Adding ${key}...`);
    // First, remove the env var if it exists to avoid conflicts, ignoring errors
    await new Promise(resolve => {
      const rm = spawn('npx.cmd', ['vercel', 'env', 'rm', key, 'production', '-y'], { shell: true });
      rm.on('close', () => resolve());
    });

    await new Promise((resolve, reject) => {
      const child = spawn('npx.cmd', ['vercel', 'env', 'add', key, 'production'], { shell: true });
      
      child.stdout.on('data', data => console.log(`[out] ${data}`));
      child.stderr.on('data', data => console.log(`[err] ${data}`));
      
      child.stdin.write(value);
      child.stdin.end();
      
      child.on('close', code => {
        if (code === 0) {
          console.log(`Successfully added ${key}`);
          resolve();
        } else {
          console.error(`Failed to add ${key} (code ${code})`);
          resolve();
        }
      });
    });
  }
  console.log('Done adding env vars.');
}

addEnvs();
