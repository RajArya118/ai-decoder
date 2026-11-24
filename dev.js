import { spawn } from 'child_process';

console.log('\x1b[36m%s\x1b[0m', '⚡ Starting AI DECODER Enterprise Full-Stack Platform...');
console.log('\x1b[35m%s\x1b[0m', '   - Backend API  : http://localhost:5000');
console.log('\x1b[32m%s\x1b[0m', '   - Frontend UI  : http://localhost:3000');
console.log('\x1b[33m%s\x1b[0m', '   - OpenAPI Docs : http://localhost:5000/api/docs\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const serverProc = spawn(npmCmd, ['--prefix', 'server', 'run', 'dev'], {
  stdio: 'inherit',
  shell: isWindows
});

const clientProc = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: isWindows
});

const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down AI DECODER servers...');
  try {
    if (isWindows) {
      if (serverProc.pid) spawn('taskkill', ['/pid', serverProc.pid, '/T', '/F']);
      if (clientProc.pid) spawn('taskkill', ['/pid', clientProc.pid, '/T', '/F']);
    } else {
      serverProc.kill('SIGTERM');
      clientProc.kill('SIGTERM');
    }
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
