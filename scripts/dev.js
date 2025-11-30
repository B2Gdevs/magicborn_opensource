#!/usr/bin/env node
import getPort, { portNumbers } from 'get-port';
import { spawn } from 'node:child_process';

const base = Number(process.env.PORT) || 3000;

// try 3000..3050 (adjust if you like)
const port = await getPort({ port: portNumbers(base, base + 50) });

console.log(`✅ Starting Next on ${port}`);
const child = spawn('next', ['dev', '-p', String(port)], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => process.exit(code ?? 0));
