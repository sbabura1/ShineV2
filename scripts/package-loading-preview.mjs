import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadingMessage, mathMoments, studyMoments } from '../src/components/loading/loadingMessages.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'artifacts/loading-design');
const captures = JSON.parse(fs.readFileSync(path.join(output, 'captures.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'src/components/loading/loading.css'), 'utf8');
const markup = fs.readFileSync(path.join(output, 'motion-markup.html'), 'utf8').replace(/src="[^"]+"/, 'src="beacon-base.png"');
fs.copyFileSync(path.join(root, 'src/prototype/assets/characters/beacon-base.png'), path.join(output, 'beacon-base.png'));
const labels = { account: 'Account / first login', sector: 'Sector', mission: 'Mission', resume: 'Saved work', assessment: 'Pre-assessment', nexus: 'Return to the Nexus' };
const messages = Object.fromEntries(Object.keys(labels).map(variant => [variant, loadingMessage(variant, variant === 'sector' ? 'Vitalis' : ['mission', 'resume'].includes(variant) ? 'The Clinic Data Review' : undefined)]));
const html = `<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beacon loading screens</title><style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,'Segoe UI',sans-serif;color:var(--text);background:var(--bg)}
:root{--bg:#101112;--text:#F2F4F5;--text-muted:#ADB4BB;--primary:#57D8FF;--gold-color:#FFD166;--surface:#191B1D;--surface-alt:#24272A;--border:#484D52;--page-background:var(--bg);--ring:var(--primary);--radius-control:10px}
:root[data-theme=light]{--bg:#F0F6FB;--text:#132C43;--text-muted:#3E586E;--primary:#006581;--gold-color:#795100;--surface:#fff;--surface-alt:#E5EFF8;--border:#8CA8BD;--page-background:radial-gradient(circle at 15% 0%,#DFF4FF,transparent 45%),linear-gradient(#F7FAFF,#EAF2F9)}
.preview-toolbar{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;padding:20px 32px;background:var(--surface);border-bottom:1px solid var(--border)}.preview-toolbar h1{margin:0;font-size:20px;font-weight:600}.preview-toolbar p{margin:6px 0 0;font-size:13px;color:var(--text-muted)}.preview-controls{display:flex;gap:12px;flex-wrap:wrap}.preview-controls label{font-size:12px;color:var(--text-muted)}.preview-controls select{display:block;min-height:36px;margin-top:5px;padding:6px 10px;border:1px solid var(--border);border-radius:8px;color:var(--text);background:var(--bg);font:inherit}
.planet-mark{display:block;border:1px solid var(--primary);border-radius:50%;background:radial-gradient(circle at 35% 30%,#79EAFF,#1D4470 58%,#07111F 100%);position:relative}.planet-mark:after{content:'';position:absolute;left:-8px;right:-8px;top:12px;height:9px;border:1px solid var(--primary);border-radius:50%;transform:rotate(-15deg)}
${css}
#live .beacon-loading{min-height:calc(100svh - 100px)}#gallery{padding:28px 32px 36px;display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}figure{margin:0;min-width:0}figure a{display:block}figure img{display:block;width:100%;height:auto;border-radius:10px}figcaption{margin:0 0 12px;font-size:18px;font-weight:600}body[data-view=gallery] #live{display:none}body[data-view=gallery] #gallery{display:grid}@media(max-width:850px){#gallery{grid-template-columns:1fr}.preview-toolbar{padding:20px}.preview-controls{gap:8px}}
</style></head><body><header class="preview-toolbar"><div><h1>Beacon loading screens</h1><p>Six loading states · one shared animation · no forced waiting in the app</p></div><div class="preview-controls"><label>View<select id="view"><option value="motion">Live animation</option><option value="gallery">All screenshots</option></select></label><label>Screen<select id="screen">${Object.entries(labels).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></label><label>Theme<select id="theme"><option value="dark">Graphite</option><option value="light">Light</option></select></label></div></header><main id="live">${markup}</main><main id="gallery"></main><script>
const labels=${JSON.stringify(labels)},messages=${JSON.stringify(messages)},math=${JSON.stringify(mathMoments)},study=${JSON.stringify(studyMoments)},captures=${JSON.stringify(captures)};
const query=new URLSearchParams(location.search);let moment=0;
for(const id of ['view','screen','theme'])if(query.has(id))document.getElementById(id).value=query.get(id);
function render(){const variant=document.getElementById('screen').value,theme=document.getElementById('theme').value;document.documentElement.dataset.theme=theme;document.body.dataset.view=document.getElementById('view').value;const loader=document.querySelector('.beacon-loading');loader.dataset.loadingVariant=variant;const h=loader.querySelector('h1'),dots=h.querySelector('.beacon-loading-dots');const words=messages[variant].title.split(' '),end=document.createElement('span');end.className='beacon-loading-title-end';end.append(document.createTextNode(words.pop()),dots);h.replaceChildren(document.createTextNode(words.join(' ')+' '),end);loader.querySelector('.beacon-loading-status>p').textContent=messages[variant].description;loader.querySelector('.beacon-loading-moment-label').lastChild.textContent=variant==='assessment'?'A moment to get ready':'Beacon’s math moment';loader.querySelector('.beacon-loading-moment>p').textContent=(variant==='assessment'?study:math)[moment%(variant==='assessment'?study:math).length];document.getElementById('gallery').innerHTML=captures.filter(c=>c.width===1440&&c.theme===theme).map(c=>'<figure><figcaption>'+labels[c.variant]+'</figcaption><a href="'+c.filename+'" target="_blank"><img src="'+c.filename+'" alt="'+labels[c.variant]+' loading screen in '+theme+' theme"></a></figure>').join('');}
for(const id of ['view','screen','theme'])document.getElementById(id).addEventListener('change',()=>{moment=0;render()});setInterval(()=>{if(!document.hidden&&document.body.dataset.view!=='gallery'){moment++;render()}},6000);render();
</script></body></html>`;
fs.writeFileSync(path.join(output, 'index.html'), html);

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/shrey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
  for (const theme of ['dark', 'light']) {
    await page.goto(`http://127.0.0.1:5174/artifacts/loading-design/index.html?view=gallery&theme=${theme}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelectorAll('#gallery img').length === 6 && [...document.querySelectorAll('#gallery img')].every(image => image.complete && image.naturalWidth > 0));
    await page.screenshot({ path: path.join(output, `all-loading-screens-${theme}.png`), fullPage: true });
  }
} finally { await browser.close(); }
console.log(`Wrote animated preview and screenshot overviews to ${output}`);
