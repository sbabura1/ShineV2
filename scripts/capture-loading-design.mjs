// Screenshot-only network fixtures. No production auth bypass or artificial delay.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'artifacts/loading-design');
fs.mkdirSync(output, { recursive: true });
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const env = Object.fromEntries(fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => {
  const split = line.indexOf('='); return [line.slice(0, split).trim(), line.slice(split + 1).trim().replace(/^['"]|['"]$/g, '')];
}));
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/shrey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const base = process.env.LOADING_PREVIEW_URL || 'http://127.0.0.1:5174';
const apiHost = new URL(env.VITE_API_BASE_URL).hostname;
const vitalis = read('content/sectors/v1/vitalis/sector.json');
const sectors = read('content/sectors/v1/catalog.json').sectors.map(item => item.id === 'vitalis' ? { ...item, ...vitalis, enabled: true } : { ...item, enabled: false });
const mission = read('content/sectors/v1/vitalis/missions/vitalis-mission-01/beginning.json');
const baseline = read('content/assessments/v1/questions/baseline.json');
const token = claims => `${Buffer.from('{"alg":"RS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.preview-signature`;
const issued = Math.floor(Date.now() / 1000);
const issuer = `https://cognito-idp.${env.VITE_COGNITO_USER_POOL_ID.split('_')[0]}.amazonaws.com/${env.VITE_COGNITO_USER_POOL_ID}`;
const identity = { sub: '11111111-1111-1111-1111-111111111111', 'cognito:username': 'loading-preview', iss: issuer, iat: issued, exp: issued + 3600 };
const captures = [];

async function scene(variant, theme, width = 1440, record = false) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, colorScheme: theme });
  await context.addInitScript(({ client, access, id, theme }) => {
    const prefix = `CognitoIdentityServiceProvider.${client}`;
    localStorage.setItem(`${prefix}.LastAuthUser`, 'loading-preview');
    localStorage.setItem(`${prefix}.loading-preview.accessToken`, access);
    localStorage.setItem(`${prefix}.loading-preview.idToken`, id);
    localStorage.setItem(`${prefix}.loading-preview.refreshToken`, 'preview-refresh');
    localStorage.setItem(`${prefix}.loading-preview.clockDrift`, '0');
    localStorage.setItem('scalaris:theme', theme);
  }, { client: env.VITE_COGNITO_CLIENT_ID, theme,
    access: token({ ...identity, username: 'loading-preview', token_use: 'access', client_id: env.VITE_COGNITO_CLIENT_ID }),
    id: token({ ...identity, token_use: 'id', aud: env.VITE_COGNITO_CLIENT_ID }) });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const profile = { rev: 1, name: 'SHINE learner', sector: 'vitalis' };
  const progress = { baseline: {}, sectors: [], missions: [], difficultyStates: [], assessments: [] };
  const run = { runId: 'loading-preview-run', kind: variant === 'assessment' ? 'ASSESSMENT' : 'MISSION', status: 'IN_PROGRESS', rev: 1 };
  let holdProgress = false;
  const held = [];
  const reply = (route, value, status = 200) => route.fulfill({ status, contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,content-type,idempotency-key', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS' }, body: JSON.stringify(value) });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.protocol === 'data:') return route.continue();
    if (url.hostname !== apiHost) return route.abort();
    const method = route.request().method(), pathname = url.pathname;
    if (method === 'OPTIONS') return reply(route, {});
    if (pathname === '/v1/me') {
      const result = { profile, userId: identity.sub, accountRole: 'student' };
      if (variant === 'account') { held.push(() => reply(route, result)); return; }
      return reply(route, result);
    }
    if (pathname === '/v1/me/progress') {
      if (holdProgress) { held.push(() => reply(route, progress)); return; }
      return reply(route, progress);
    }
    if (pathname === '/v1/sectors') return reply(route, { sectors });
    if (method === 'POST' && pathname.endsWith('/runs')) return reply(route, { run, resumed: variant === 'resume' });
    if (pathname.endsWith('/content')) {
      const definition = variant === 'assessment' ? baseline : mission;
      if (['mission', 'resume', 'assessment'].includes(variant)) { held.push(() => reply(route, definition)); return; }
      return reply(route, definition);
    }
    if (pathname === '/v1/runs/loading-preview-run') return reply(route, { run, answers: {}, investigations: {} });
    return reply(route, { message: 'Unconfigured screenshot fixture.' }, 404);
  });
  const routePath = variant === 'account' ? '/identity' : variant === 'assessment' ? '/assessments/pre' : '/sectors/vitalis/missions/vitalis-mission-01/beginning';
  await page.goto(`${base}/#${routePath}`);
  if (variant === 'sector' || variant === 'nexus') {
    await page.getByRole('heading', { name: 'The Clinic Data Review', exact: true }).waitFor();
    holdProgress = true;
    await page.getByRole('button', { name: variant === 'sector' ? 'Save and return' : 'Return to the Nexus' }).click();
  }
  const loader = page.locator(`[data-loading-variant="${variant}"]`);
  await loader.waitFor();
  await loader.locator('img').evaluate(image => image.decode());
  if (variant === 'assessment') assert.equal(await loader.getByText('Beacon’s math moment').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  if (record) fs.writeFileSync(path.join(output, 'motion-markup.html'), await loader.evaluate(node => node.outerHTML));
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      const duration = animation.effect?.getTiming().duration;
      if (typeof duration === 'number') animation.currentTime = duration * .45;
    }
  });
  const filename = `${variant}-${theme}-${width}.png`;
  await page.screenshot({ path: path.join(output, filename), fullPage: width < 600 });
  captures.push({ variant, theme, width, filename });
  if (variant === 'mission' && theme === 'dark' && width === 1440) {
    // Complete the waiting request: the page must appear immediately, with no minimum animation time.
    await Promise.all(held.splice(0).map(release => release()));
    await page.getByRole('heading', { name: 'The Clinic Data Review', exact: true }).waitFor();
    assert.equal(await page.locator('.beacon-loading').count(), 0);
  }
  assert.deepEqual(errors, []);
  await context.close();
  console.log(`Captured ${filename}`);
}

try {
  for (const theme of ['dark', 'light']) {
    for (const variant of ['account', 'sector', 'mission', 'resume', 'assessment', 'nexus']) await scene(variant, theme, 1440, variant === 'account' && theme === 'dark');
  }
  for (const variant of ['account', 'sector', 'mission', 'resume', 'assessment', 'nexus']) await scene(variant, 'dark', 390);
  fs.writeFileSync(path.join(output, 'captures.json'), JSON.stringify(captures, null, 2));
} finally { await browser.close(); }
