import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
// Ego runs in its own environment; pass non-secret configuration in the input script.
const config = {
  projectDir: fileURLToPath(new URL('../', import.meta.url)),
  origin: process.env.PINYIN_TEST_URL || 'http://127.0.0.1:5173',
  spaceId: Number(process.env.PINYIN_SPACE_ID || 1),
};
const input = `globalThis.pinyinCheckConfig = ${JSON.stringify(config)};\n` +
  readFileSync(new URL('./browser-check.mjs', import.meta.url), 'utf8');
const result = spawnSync('ego-browser', ['nodejs'], { input, stdio: ['pipe', 'inherit', 'inherit'] });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
