import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/shrey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5174/.frontend-verification/loading-behavior.html', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Brief wait', exact: true }).click();
  await page.waitForFunction(() => document.getElementById('request-state').textContent === 'Content ready');
  assert.equal(await page.evaluate(() => window.loadingEvents.length), 0, 'A brief request must never show the loader.');
  await page.getByRole('button', { name: 'Start wait', exact: true }).click();
  await page.locator('.beacon-loading').waitFor();
  assert.ok(await page.evaluate(() => window.loadingEvents.at(-1) - window.waitStarted >= 350), 'Loading indicator must be delayed.');
  const before = await page.locator('.beacon-loading-character').evaluate(node => getComputedStyle(node).transform);
  await page.waitForFunction(previous => getComputedStyle(document.querySelector('.beacon-loading-character')).transform !== previous, before);
  const tip = await page.locator('.beacon-loading-moment > p').textContent();
  await page.waitForFunction(previous => document.querySelector('.beacon-loading-moment > p').textContent !== previous, tip, { timeout: 8000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.beacon-loading-character').evaluate(node => getComputedStyle(node).animationName), 'none');
  await page.getByRole('button', { name: 'Ready', exact: true }).click();
  await page.locator('.beacon-loading').waitFor({ state: 'detached' });
  assert.deepEqual(errors, []);
  console.log('PASS: no loader on a brief request; delayed appearance, active animation, rotating facts, reduced motion and immediate dismissal.');
} finally { await browser.close(); }
