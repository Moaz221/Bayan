import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Copies src/assets/Bayan-Icon.png to public/ favicon files.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const src = resolve(root, 'src', 'assets', 'Bayan-Icon.png');
const destDir = resolve(root, 'public');

if (!existsSync(src)) {
  console.error('Source favicon not found at', src);
  process.exit(1);
}

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

try {
  // Copy same PNG to multiple names (no resize). Good fallback for browsers.
  copyFileSync(src, resolve(destDir, 'Bayan-Icon.png'));
  copyFileSync(src, resolve(destDir, 'favicon-32x32.png'));
  copyFileSync(src, resolve(destDir, 'favicon-16x16.png'));
  // Many browsers accept a PNG named .ico as fallback; if you need a true .ico, convert separately.
  copyFileSync(src, resolve(destDir, 'favicon.ico'));
  console.log('Favicons copied to public/');
} catch (e) {
  console.error('Failed to copy favicons', e);
  process.exit(1);
}
