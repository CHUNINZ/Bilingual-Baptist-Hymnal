import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'public/src'), { recursive: true });
await copyFile(resolve(root, 'index.html'), resolve(root, 'public/index.html'));
await copyFile(resolve(root, 'src/main.js'), resolve(root, 'public/src/main.js'));
await copyFile(resolve(root, 'src/style.css'), resolve(root, 'public/src/style.css'));
console.log('Static Vercel output prepared in public/.');
