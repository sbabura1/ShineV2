const pages = await fetch('http://127.0.0.1:9222/json').then((response) => response.json());
const page = pages.find((entry) => entry.type === 'page' && entry.url.includes('prototype=1'));

if (!page) throw new Error('Prototype browser tab not found.');

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let commandId = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function command(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

const pause = (milliseconds = 120) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const bodyText = () => evaluate('document.body.innerText');

async function assertText(text) {
  await pause();
  const body = await bodyText();
  if (!body.includes(text)) throw new Error(`Expected page text: ${text}\nCurrent page: ${body.slice(0, 600)}`);
}

async function clickText(text) {
  const clicked = await evaluate(`(() => {
    const target = [...document.querySelectorAll('button')].find((button) => button.textContent.includes(${JSON.stringify(text)}));
    if (!target || target.disabled) return false;
    target.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Could not click enabled button: ${text}`);
  await pause();
}

await command('Page.reload', { ignoreCache: true });
await pause(1000);
await assertText('ENTER THE NEXUS');
await clickText('ENTER THE NEXUS');
await assertText('Build Your Nexus Identity');
await clickText('CONTINUE TO THE NEXUS');
await assertText('Required: Complete the Nexus Pre-Assessment');
await clickText('BEGIN PRE-ASSESSMENT');
await assertText('HSI-SHINE Baseline Pre-Assessment');

const attitudeCount = await evaluate('document.querySelectorAll(".assessment-question .likert-row").length');
for (let index = 0; index < attitudeCount; index += 1) {
  await evaluate(`document.querySelectorAll('.assessment-question .likert-row')[${index}].querySelector('button').click()`);
  await pause(15);
}
await clickText('CONTINUE TO PART 2');
await assertText('Part 2: Cognitive Questions');

const cognitiveCount = await evaluate('document.querySelectorAll(".assessment-question .mc-grid").length');
for (let index = 0; index < cognitiveCount; index += 1) {
  await evaluate(`document.querySelectorAll('.assessment-question .mc-grid')[${index}].querySelector('button').click()`);
  await pause(15);
}
await clickText('VIEW SKILLS RECAP');
await assertText('Quantitative Skills Recap');
await clickText('CONTINUE TO PART 3');
await assertText('Part 3: Socio-Demographic Questions');

const demographicInputCount = await evaluate('document.querySelectorAll(".demo-grid input").length');
for (let index = 0; index < demographicInputCount; index += 1) {
  await evaluate(`(() => {
    const input = document.querySelectorAll('.demo-grid input')[${index}];
    const value = input.type === 'email' ? 'student@example.edu' : '2000';
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await pause(20);
}
const demographicSelectCount = await evaluate('document.querySelectorAll(".demo-grid select").length');
for (let index = 0; index < demographicSelectCount; index += 1) {
  await evaluate(`(() => {
    const select = document.querySelectorAll('.demo-grid select')[${index}];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, select.options[1].value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await pause(20);
}
await evaluate("document.querySelector('.checkbox-grid .option-chip').click()");
await pause(250);
await clickText('COMPLETE PRE-ASSESSMENT');
await assertText('Nexus Pre-Assessment Complete');
await assertText('Sector access unlocked');

const sectorOpened = await evaluate(`(() => {
  const sector = document.querySelector('.card.sector');
  if (!sector) return false;
  sector.click();
  return true;
})()`);
if (!sectorOpened) throw new Error('Could not open the first sector.');
await assertText('Available Missions');
await clickText('START MISSION');
await assertText('The West District Spike');

console.log(JSON.stringify({ attitudeQuestions: attitudeCount, cognitiveQuestions: cognitiveCount, result: 'full flow passed' }));
socket.close();
