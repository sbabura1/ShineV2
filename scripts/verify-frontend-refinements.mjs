import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { questionProgress } from '../src/components/learning/progress.js';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/shrey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // No credentials and no authentication requests leave this browser test.
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('http://127.0.0.1:5173/#/login');
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
  for (const theme of ['dark', 'light']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: `Switch to ${theme} mode` }).click();
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ['sign-in', 'sign-up']) {
        if (view === 'sign-up') await page.getByRole('button', { name: 'Create Account', exact: true }).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${theme} ${view} overflows at ${width}`);
        const contrast = await page.locator('.shine-card-head h2').evaluate(node => {
          const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
          const luminance = value => rgb(value).reduce((sum, channel, i) => sum + channel * [.2126, .7152, .0722][i], 0);
          const ink = luminance(getComputedStyle(node).color);
          const ground = luminance(getComputedStyle(document.querySelector('.shine-login-card')).backgroundColor);
          return (Math.max(ink, ground) + .05) / (Math.min(ink, ground) + .05);
        });
        assert.ok(contrast >= 4.5, `Login title contrast ${contrast} at ${theme} ${width}`);
        await page.screenshot({ path: `.frontend-verification/login-${view}-${theme}-${width}.png`, fullPage: true });
        if (view === 'sign-up') await page.getByRole('button', { name: 'Back to Sign In', exact: true }).click();
      }
    }
  }
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('alert').getByText('Enter your email and password to continue.').waitFor();
  assert.deepEqual(errors, []);

  const definition = { questions: [
    { id: 'choice', type: 'multiple_choice', followUp: { whenOptionId: 'other', field: { id: 'detail' } } },
    { id: 'scale', type: 'likert' },
    { id: 'investigation', type: 'investigation', responses: [{ id: 'response-1' }, { id: 'response-2' }] },
  ] };
  assert.deepEqual(questionProgress(definition, { choice: [], scale: 0, 'response-1': '   ' }), { total: 4, answered: 1, remaining: 3 });
  assert.equal(questionProgress(definition, { choice: ['other'] }).answered, 0);
  assert.equal(questionProgress(definition, { choice: ['other'], 'choice:detail': 'A different option', 'response-2': 'My reasoning' }).answered, 2);
  console.log('PASS login themes, contrast, sign-up, validation, persistence and responsive layouts; question progress handles empty, zero, follow-up and investigation responses.');
} finally { await browser.close(); }
