import { spawn } from 'child_process';

const server = spawn('npm', ['run', 'server'], { stdio: 'inherit', shell: true });
const client = spawn('npm', ['run', 'client'], { stdio: 'inherit', shell: true });

server.on('close', (code) => console.log(`Server exited with code ${code}`));
client.on('close', (code) => console.log(`Client exited with code ${code}`));

process.on('SIGINT', () => {
    server.kill();
    client.kill();
    process.exit();
});
