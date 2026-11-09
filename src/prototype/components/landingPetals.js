// Rasterize only on entry, then let the browser animate the letter fragments.
// No render loop, remote assets, or animation dependency is needed.
const PETAL = 'polygon(0% 50%, 12% 18%, 48% 0%, 86% 8%, 100% 50%, 85% 82%, 50% 100%, 12% 90%)';
const TILE = 'polygon(0% 0%, 50% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%, 0% 50%)';
const TRANSITION_MS = 2000;
const STAGGER_MS = 260;

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function captureText(element) {
  const style = getComputedStyle(element);
  const node = element.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent;
  const range = document.createRange();
  const lines = [];
  let offset = 0;

  // Ranges retain the browser's wrapping, kerning, and line positions. The
  // paragraph and the small label can therefore dissolve just like the title.
  for (const character of text) {
    range.setStart(node, offset);
    range.setEnd(node, offset + character.length);
    const rect = range.getBoundingClientRect();
    if (rect.width && rect.height) {
      const previous = lines.at(-1);
      if (previous && Math.abs(previous.top - rect.top) < 1) {
        previous.end = offset + character.length;
      } else {
        lines.push({ start: offset, end: offset + character.length, top: rect.top });
      }
    }
    offset += character.length;
  }
  if (!lines.length) return null;
  lines.forEach(line => {
    range.setStart(node, line.start);
    range.setEnd(node, line.end);
    line.bounds = range.getBoundingClientRect();
    line.text = text.slice(line.start, line.end);
    if (style.textTransform === 'uppercase') line.text = line.text.toUpperCase();
    if (style.textTransform === 'lowercase') line.text = line.text.toLowerCase();
  });

  const surface = element.closest('[data-petal-surface]');
  const left = Math.min(...lines.map(line => line.bounds.left));
  const top = Math.min(...lines.map(line => line.bounds.top));
  const right = Math.max(...lines.map(line => line.bounds.right));
  const bottom = Math.max(...lines.map(line => line.bounds.bottom));
  const bounds = surface?.getBoundingClientRect() || { left, top, right, bottom, width: right - left, height: bottom - top };
  const padding = 6;
  const width = Math.ceil(bounds.width) + padding * 2;
  const height = Math.ceil(bounds.height) + padding * 2;
  const resolution = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * resolution);
  canvas.height = Math.ceil(height * resolution);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Text capture unavailable');
  context.scale(resolution, resolution);
  if (surface) {
    const surfaceStyle = getComputedStyle(surface);
    context.fillStyle = surfaceStyle.backgroundColor;
    context.beginPath();
    const radius = parseFloat(surfaceStyle.borderTopLeftRadius) || 0;
    if (context.roundRect) context.roundRect(padding, padding, bounds.width, bounds.height, radius);
    else context.rect(padding, padding, bounds.width, bounds.height);
    context.fill();
  }
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.fillStyle = style.color;
  context.textBaseline = 'alphabetic';
  context.fontKerning = style.fontKerning;
  context.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
  const metrics = context.measureText(text);
  const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
  lines.forEach(line => {
    const baseline = (line.bounds.height - ascent - descent) / 2 + ascent;
    context.fillText(line.text, padding + line.bounds.left - bounds.left, padding + line.bounds.top - bounds.top + baseline);
  });
  return {
    element: surface || element, bounds, width, height, padding, resolution,
    cell: Math.max(6, Math.min(22, parseFloat(style.fontSize) * .18)),
    image: canvas.toDataURL(),
    pixels: context.getImageData(0, 0, canvas.width, canvas.height),
  };
}

function textTiles(captures, budget) {
  let scale = 1;
  let tiles;
  do {
    tiles = [];
    captures.forEach((capture, source) => {
      const cell = Math.ceil(capture.cell * scale);
      for (let y = 0; y < capture.height; y += cell) {
        for (let x = 0; x < capture.width; x += cell) {
          const width = Math.min(cell, capture.width - x);
          const height = Math.min(cell, capture.height - y);
          if (containsInk(capture, x, y, width, height)) tiles.push({ capture, source, x, y, width, height });
        }
      }
    });
    scale *= Math.max(1.15, Math.sqrt(tiles.length / budget));
  } while (tiles.length > budget);
  return tiles;
}

function driftingFlight({ distance, lift, spin, tilt, sway }) {
  const transform = (x, y, rotation, turn, scale) => `perspective(600px) translate3d(${x}px, ${y}px, 0) rotateZ(${rotation}deg) rotateY(${turn}deg) rotateX(${turn * .4}deg) scale(${scale})`;
  // Letter fragments gently lift, tumble, and drift away in the same breeze.
  return [
    { transform: transform(0, 0, 0, 0, 1), opacity: 1, clipPath: TILE, offset: 0 },
    { transform: transform(distance * .06, -lift * .12, spin * .12, tilt * .3, .97), opacity: 1, clipPath: PETAL, offset: .18 },
    { transform: transform(distance * .48, -lift * .5 + sway, spin * .65, -tilt, .8), opacity: .85, clipPath: PETAL, offset: .62 },
    { transform: transform(distance, -lift, spin, tilt, .35), opacity: 0, clipPath: PETAL, offset: 1 },
  ];
}

function containsInk(capture, x, y, width, height) {
  const { pixels, resolution } = capture;
  for (let row = Math.floor(y * resolution); row < (y + height) * resolution; row += 3) {
    for (let column = Math.floor(x * resolution); column < (x + width) * resolution; column += 3) {
      if (pixels.data[(row * pixels.width + column) * 4 + 3] > 24) return true;
    }
  }
  return false;
}

export function dissolveLanding(root) {
  const animations = [];
  const hiddenSources = [];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const style = getComputedStyle(root);
  const easeOut = style.getPropertyValue('--ease-out').trim();
  const easeInOut = style.getPropertyValue('--ease-in-out').trim();
  const layer = document.createElement('div');
  layer.className = 'petal-dissolve-layer';
  layer.setAttribute('aria-hidden', 'true');
  const initialOpacity = root.style.opacity;
  let resolveFinished;
  let settled = false;
  let fallback;
  const finished = new Promise(resolve => { resolveFinished = resolve; });

  const settle = (cancelled = false) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(fallback);
    motion.removeEventListener('change', onMotionChange);
    // Keep the outgoing page hidden until React mounts sign in; cancelling an
    // animation with forwards fill would otherwise briefly reveal the old type.
    root.style.opacity = cancelled ? initialOpacity : '0';
    animations.forEach(animation => animation.cancel());
    layer.remove();
    hiddenSources.forEach(({ element, visibility }) => { element.style.visibility = visibility; });
    resolveFinished({ cancelled });
  };
  const onMotionChange = () => { if (motion.matches) settle(); };
  const animate = (element, frames, options) => {
    const animation = element.animate(frames, { fill: 'both', ...options });
    animations.push(animation);
    return animation;
  };

  // Read all layout before adding particles; nothing measures layout per frame.
  try {
    if (typeof root.animate !== 'function') {
      settle();
      return { finished, cancel: () => settle(true) };
    }

    const textElements = [...root.querySelectorAll('[data-petal-text]')];
    const captures = motion.matches ? [] : textElements.map(captureText).filter(Boolean);

    if (!captures.length) {
      animate(root.querySelector('.hero-inner'), [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: easeOut });
      Promise.all(animations.map(animation => animation.finished)).then(() => settle()).catch(() => settle());
    } else {
      const mobile = window.innerWidth < 600;
      const tiles = textTiles(captures, mobile ? 260 : 460);
      const random = seededRandom(20261106);
      const fragment = document.createDocumentFragment();
      const particles = [];

      tiles.forEach(({ capture, source, x, y, width, height }) => {
        const flake = document.createElement('span');
        flake.className = 'petal-letter-fragment';
        Object.assign(flake.style, {
          left: `${capture.bounds.left - capture.padding + x}px`,
          top: `${capture.bounds.top - capture.padding + y}px`,
          width: `${width}px`, height: `${height}px`,
          backgroundImage: `url("${capture.image}")`,
          backgroundSize: `${capture.width}px ${capture.height}px`,
          backgroundPosition: `${-x}px ${-y}px`,
        });
        fragment.append(flake);
        const delay = STAGGER_MS * (source / Math.max(1, captures.length - 1) * .5 + x / capture.width * .35 + random() * .15);
        particles.push({
          flake, delay,
          distance: (mobile ? 140 : 260) + random() * (mobile ? 100 : 220),
          lift: 50 + random() * (mobile ? 90 : 180),
          spin: (random() - .3) * 380,
          tilt: 50 + random() * 100,
          sway: (random() - .5) * 70,
        });
      });

      // Decode every shared text texture before replacing the live content.
      const textures = captures.map(capture => {
        const image = new Image();
        image.src = capture.image;
        return image.decode();
      });
      Promise.all(textures).then(() => {
        if (settled) return;
        layer.append(fragment);
        document.body.append(layer);
        captures.forEach(({ element }) => {
          hiddenSources.push({ element, visibility: element.style.visibility });
          element.style.visibility = 'hidden';
        });
        particles.forEach(particle => {
          // The stagger is included in the two-second total.
          animate(particle.flake, driftingFlight(particle), { duration: TRANSITION_MS - particle.delay, delay: particle.delay, easing: easeInOut });
        });
        Promise.all(animations.map(animation => animation.finished)).then(() => settle()).catch(() => settle());
      }).catch(() => settle());
    }

    motion.addEventListener('change', onMotionChange);
    // Navigation still completes if a browser cannot finish a decorative effect.
    fallback = window.setTimeout(() => settle(), !captures.length ? 220 : TRANSITION_MS + 300);
  } catch {
    settle();
  }

  return { finished, cancel: () => settle(true) };
}
