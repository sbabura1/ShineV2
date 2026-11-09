// Browser contract tests only. Production source has no fixture data or auth bypass.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const playwrightPath = process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/shrey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwrightPath));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const env = Object.fromEntries(fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => { const index = line.indexOf('='); return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
const baseline = read('content/assessments/v1/questions/baseline.json');
const vitalis = read('content/sectors/v1/vitalis/sector.json');
const catalogue = read('content/sectors/v1/catalog.json').sectors.map(sector => sector.id === 'vitalis' ? { ...sector, ...vitalis, enabled: true } : { ...sector, enabled: false });
const profile = { rev: 1, name: 'API Account Owner', sector: 'vitalis', beacon: 'Beacon-Forest.jpg' };
const progress = { profile, baseline: {}, missions: [], sectors: [], difficultyStates: [], assessments: [] };
const runs = new Map();
const requests = [];
const operations = new Map();
let failSaveNext = false;
let failContent = false;
let failProfile = false;
let runCounter = 0;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const token = claims => `${Buffer.from('{"alg":"RS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.test-signature`;
const user = '11111111-1111-1111-1111-111111111111';
const issued = Math.floor(Date.now() / 1000);
const issuer = `https://cognito-idp.${env.VITE_COGNITO_USER_POOL_ID.split('_')[0]}.amazonaws.com/${env.VITE_COGNITO_USER_POOL_ID}`;
await context.addInitScript(({ client, access, id, user }) => {
  const prefix = `CognitoIdentityServiceProvider.${client}`;
  localStorage.setItem(`${prefix}.LastAuthUser`, 'fixture-user');
  localStorage.setItem(`${prefix}.fixture-user.accessToken`, access);
  localStorage.setItem(`${prefix}.fixture-user.idToken`, id);
  localStorage.setItem(`${prefix}.fixture-user.refreshToken`, 'test-refresh');
  localStorage.setItem(`${prefix}.fixture-user.clockDrift`, '0');
  localStorage.setItem(`scalaris:user:${user}:identity`, JSON.stringify({ name: 'John Legacy Mock' }));
}, { client: env.VITE_COGNITO_CLIENT_ID, user,
  access: token({ sub: user, username: 'fixture-user', token_use: 'access', client_id: env.VITE_COGNITO_CLIENT_ID, iss: issuer, exp: issued + 3600, iat: issued }),
  id: token({ sub: user, 'cognito:username': 'fixture-user', token_use: 'id', aud: env.VITE_COGNITO_CLIENT_ID, iss: issuer, exp: issued + 3600, iat: issued }) });

await context.route('**/*', async route => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.hostname === '127.0.0.1' || url.protocol === 'data:') return route.continue();
  if (url.hostname !== 'p35o8uoofd.execute-api.us-west-1.amazonaws.com') return route.abort();
  const method = request.method();
  const pathname = url.pathname;
  const body = request.postData() ? JSON.parse(request.postData()) : {};
  const key = request.headers()['idempotency-key'];
  requests.push({ method, path: pathname, body, key });
  const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,content-type,idempotency-key', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS' }, body: JSON.stringify(data) });
  if (method === 'OPTIONS') return reply({});
  if (operations.has(key)) return reply(operations.get(key));
  if (pathname === '/v1/me' && method === 'GET') return failProfile ? route.abort('failed') : reply({ profile, userId: user, accountRole: 'student' });
  if (pathname === '/v1/me' && method === 'PATCH') { Object.assign(profile, body.profile, { rev: profile.rev + 1 }); return reply({ profile }); }
  if (pathname === '/v1/me/progress') return reply(progress);
  if (pathname === '/v1/sectors') return reply({ sectors: catalogue });
  const start = pathname.match(/^\/v1\/sectors\/vitalis\/missions\/([^/]+)\/([^/]+)\/runs$/);
  if (method === 'POST' && (start || pathname === '/v1/assessments/baseline/runs')) {
    const kind = start ? 'MISSION' : 'ASSESSMENT';
    const pointer = start ? progress.difficultyStates.find(track => track.missionId === start[1] && track.difficulty === start[2]) : progress.baseline;
    let saved = pointer?.activeRunId ? runs.get(pointer.activeRunId) : null;
    if (!saved || body.restart || !['IN_PROGRESS', 'CHANGES_REQUESTED'].includes(saved.run.status)) {
      const run = { runId: `fixture-run-${++runCounter}`, kind, rev: 1, status: 'IN_PROGRESS', ...(start ? { sectorId: 'vitalis', missionId: start[1], difficulty: start[2] } : { assessmentId: 'baseline' }) };
      saved = { run, answers: {}, investigations: {}, reviews: [] }; runs.set(run.runId, saved);
      if (start) {
        if (pointer) Object.assign(pointer, { ...run, activeRunId: run.runId });
        else progress.difficultyStates.push({ ...run, activeRunId: run.runId });
      } else Object.assign(progress.baseline, { ...run, activeRunId: run.runId });
    }
    const result = { run: saved.run }; operations.set(key, structuredClone(result)); return reply(result);
  }
  const runPath = pathname.match(/^\/v1\/runs\/([^/]+)(?:\/(content|assets)\/?([^/]+)?)?$/);
  if (runPath) {
    const saved = runs.get(runPath[1]);
    if (!saved) return reply({ message: 'Not found' }, 404);
    if (runPath[2] === 'content') {
      if (failContent) return reply({ error: { message: 'Content temporarily unavailable.' } }, 503);
      return reply(saved.run.kind === 'ASSESSMENT' ? baseline : read(`content/sectors/v1/vitalis/missions/${saved.run.missionId}/${saved.run.difficulty}.json`));
    }
    if (runPath[2] === 'assets') return reply({ url: `data:image/gif;base64,${fs.readFileSync(path.join(root, 'content/assessments/v1/assets', `${runPath[3]}.gif`)).toString('base64')}` });
    if (method === 'GET') return reply(saved);
    if (method === 'PATCH') {
      if (failSaveNext) { failSaveNext = false; return reply({ error: { message: 'Temporary save failure.' } }, 503); }
      if (body.expectedVersion !== saved.run.rev) return reply({ error: { message: 'Version conflict.', code: 'VERSION_CONFLICT' } }, 409);
      Object.assign(saved.answers, body.answers); Object.assign(saved.investigations, body.investigations);
      Object.assign(saved.run, { rev: saved.run.rev + 1, ...(body.currentQuestionId ? { currentQuestionId: body.currentQuestionId } : {}), ...(body.currentStep ? { currentStep: body.currentStep } : {}) });
      const result = { run: saved.run, saved: true }; operations.set(key, structuredClone(result)); return reply(result);
    }
  }
  const submission = pathname.match(/^\/v1\/(?:mission|assessment)-runs\/([^/]+)\/submit$/);
  if (submission) {
    const saved = runs.get(submission[1]);
    saved.run.rev++; saved.run.status = saved.run.difficulty === 'advanced' ? 'PENDING_REVIEW' : 'COMPLETED';
    if (saved.run.kind === 'ASSESSMENT') progress.baseline.submittedAt = 'submitted';
    else {
      const track = progress.difficultyStates.find(track => track.activeRunId === saved.run.runId); track.status = saved.run.status;
      if (saved.run.status === 'COMPLETED') progress.missions.push({ missionId: saved.run.missionId, sectorId: 'vitalis', completed: true });
    }
    saved.run.result = { score: 2, maximumScore: 2, percentage: 100 };
    const result = { run: saved.run }; operations.set(key, structuredClone(result)); return reply(result);
  }
  return reply({ message: `Unmocked test route ${method} ${pathname}` }, 404);
});

const screenshotDirectory = path.join(root, '.frontend-verification');
fs.mkdirSync(screenshotDirectory, { recursive: true });
try {
  await page.goto('http://127.0.0.1:5173/#/identity');
  await page.getByRole('heading', { name: 'Build Your Nexus Identity' }).waitFor();
  assert.equal(await page.locator('#identity-name').inputValue(), profile.name);
  assert.equal(await page.getByText('John Legacy Mock').count(), 0);
  await page.getByAltText('Beacon appearance preview', { exact: true }).waitFor();
  const savedBeaconSrc = await page.getByAltText('Beacon appearance preview', { exact: true }).getAttribute('src');
  await page.getByRole('button', { name: 'Save and go to the Nexus' }).click();
  await page.getByRole('heading', { name: /Welcome to The Nexus/ }).waitFor();
  assert.equal(await page.locator('button.sector-node:disabled').count(), 13);
  assert.equal(await page.locator('button.card.sector:disabled').count(), 13);
  await page.screenshot({ path: path.join(screenshotDirectory, 'nexus-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Begin pre-assessment' }).click();
  await page.getByRole('heading', { name: baseline.title, exact: true }).waitFor();
  assert.equal(await page.locator('.mission-beacon').count(), 0);
  assert.equal(await page.locator('.remote-run').evaluate(node => node.getBoundingClientRect().width === window.innerWidth), true);
  assert.equal(await page.getByRole('progressbar', { name: 'Questions answered' }).getAttribute('value'), '0');
  const attitude = page.locator('fieldset.remote-question').filter({ has: page.locator('legend', { hasText: baseline.sections[0].questions[0].prompt }) });
  await attitude.getByRole('radio').nth(3).check();
  assert.equal(await page.getByRole('progressbar', { name: 'Questions answered' }).getAttribute('value'), '1');
  await page.screenshot({ path: path.join(screenshotDirectory, 'assessment-refined.png'), fullPage: false });
  await page.getByRole('button', { name: 'Cognitive Questions', exact: true }).click();
  await page.getByRole('heading', { name: 'Cognitive Questions', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Save and return' }).click();
  await page.getByRole('heading', { name: /Welcome to The Nexus/ }).waitFor();
  assert.equal(runs.get(progress.baseline.activeRunId).answers[baseline.sections[0].questions[0].id], 4);
  await page.getByRole('button', { name: 'Open Vitalis', exact: true }).click();
  await page.getByRole('heading', { name: 'Vitalis Missions' }).waitFor();
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const sizes = await page.locator('.sector-mission-card').evaluateAll(nodes => nodes.map(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
    assert.ok(sizes.every(size => Math.abs(size.width - sizes[0].width) < 1), `Equal mission widths at ${width}`);
    assert.ok(sizes.every(size => Math.abs(size.height - sizes[0].height) < 1), `Equal mission heights at ${width}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotDirectory, 'mission-cards-refined.png'), fullPage: true });
  const first = page.locator('.sector-mission-card').nth(0);
  await first.getByRole('button', { name: 'Start mission', exact: true }).click();
  await page.getByRole('heading', { name: 'The Clinic Data Review', exact: true }).waitFor();
  assert.equal(await page.locator('.mission-beacon button:disabled').count(), 6);
  await page.waitForFunction(src => document.querySelector('.mission-beacon-image')?.getAttribute('src') === src, savedBeaconSrc);
  for (const theme of ['dark', 'light']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: `Switch to ${theme} mode` }).click();
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme);
    if (theme === 'dark') await page.waitForFunction(() => getComputedStyle(document.documentElement).backgroundColor === 'rgb(16, 17, 18)');
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${theme} mission overflow at ${width}`);
      if (width >= 768) {
        const question = await page.locator('.remote-run-work').boundingBox();
        const beacon = await page.locator('.mission-beacon').boundingBox();
        assert.ok(beacon.x >= question.x + question.width, `Beacon beside questions at ${width}`);
      }
      await page.screenshot({ path: path.join(screenshotDirectory, `mission-${theme}-${width}.png`), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  failSaveNext = true;
  await page.getByRole('radio').nth(1).check();
  assert.equal(await page.getByRole('progressbar', { name: 'Questions answered' }).getAttribute('value'), '1');
  await page.getByRole('button', { name: 'Retry save' }).waitFor();
  await page.getByRole('button', { name: 'Retry save' }).click();
  await page.getByText('All changes saved', { exact: true }).waitFor();
  const retries = requests.filter(request => request.method === 'PATCH' && request.path.includes('/runs/') && request.body.answers?.['vitalis-q001-beginning']);
  assert.equal(retries.at(-1).key, retries.at(-2).key);
  await page.getByRole('button', { name: 'Save and return' }).click();
  await page.getByRole('heading', { name: 'Vitalis Missions' }).waitFor();
  const second = page.locator('.sector-mission-card').nth(1);
  await second.getByLabel('Difficulty').selectOption('advanced');
  await second.getByRole('button', { name: 'Start mission', exact: true }).click();
  await page.getByRole('heading', { name: 'The Care Comparison', exact: true }).waitFor();
  await page.getByRole('textbox').first().fill('My investigation response is saved separately.');
  await page.getByRole('button', { name: 'Save and return' }).click();
  await page.getByRole('heading', { name: 'Vitalis Missions' }).waitFor();
  await page.locator('.sector-mission-card').nth(0).getByRole('button', { name: 'Continue mission', exact: true }).click();
  await page.getByRole('heading', { name: 'The Clinic Data Review', exact: true }).waitFor();
  assert.equal(await page.getByRole('radio').nth(1).isChecked(), true);
  assert.equal(await page.getByRole('progressbar', { name: 'Questions answered' }).getAttribute('value'), '1');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  assert.equal(await page.getByRole('progressbar', { name: 'Questions answered' }).getAttribute('value'), '1');
  await page.getByRole('radio').nth(2).check();
  await page.getByRole('button', { name: 'Submit mission', exact: true }).click();
  await page.getByRole('heading', { name: 'Completed', exact: true }).waitFor();
  assert.equal(await page.getByRole('progressbar', { name: 'Overall score', exact: true }).getAttribute('value'), '2');
  await page.screenshot({ path: path.join(screenshotDirectory, 'mission-score-refined.png'), fullPage: true });
  assert.equal(await page.getByText('2 / 2', { exact: false }).count() > 0, true);
  await page.getByRole('button', { name: 'Start again', exact: true }).click();
  await page.getByText('Activity 1 of 2', { exact: true }).waitFor();
  assert.equal(await page.getByRole('radio').nth(1).isChecked(), false);
  assert.equal(await page.getByRole('progressbar', { name: 'Questions answered' }).getAttribute('value'), '0');
  assert.equal(progress.missions.some(mission => mission.missionId === 'vitalis-mission-01' && mission.completed), true);
  await page.getByRole('button', { name: 'Save and return' }).click();
  await page.getByRole('button', { name: 'Back to Nexus', exact: false }).click();
  await page.getByRole('heading', { name: /Welcome to The Nexus/ }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(screenshotDirectory, 'nexus-mobile.png'), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
  await page.getByRole('button', { name: 'Open Vitalis', exact: true }).click();
  await page.locator('.sector-mission-card').nth(2).getByRole('button', { name: 'Start mission', exact: true }).click();
  failContent = true;
  await page.reload();
  await page.getByRole('heading', { name: 'Unable to open your saved work' }).waitFor();
  assert.equal(await page.getByRole('radio').count(), 0);
  failProfile = true;
  await page.reload();
  const accountError = page.getByRole('heading', { name: 'Unable to load your account' });
  await accountError.waitFor();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await accountError.evaluate(node => parseFloat(getComputedStyle(node).fontSize) <= 36), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
    await page.screenshot({ path: path.join(screenshotDirectory, `account-error-${width}.png`), fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log('PASS browser contracts: identity, disabled sectors, baseline autosave, mission tracks, save retries, resume, server results, replay credit, equal cards, customized Beacon, disabled assistance, progress, graphite theme and responsive layouts.');
} finally { await browser.close(); }
