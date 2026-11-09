import React, { useEffect, useId, useRef } from 'react';
import './nexus-background.css';

const FIBER_COUNT = 112;
const TONES = ['blue', 'cyan', 'ice', 'gold', 'mint', 'rose', 'coral', 'blue', 'cyan'];

const FIBERS = Array.from({ length: FIBER_COUNT }, (_, index) => {
  // Deterministic spacing keeps the field steady across React renders.
  const noise = Math.sin((index + 1) * 127.1) * 43758.5453;
  const random = noise - Math.floor(noise);
  const position = index / (FIBER_COUNT - 1);
  const x = 360 + position * 720 + (random - .5) * 9;
  const endX = -520 + position * 2480;
  const spread = endX - x;
  const bend = 560 + random * 55;
  const path = `M ${x} -180 L ${x} ${bend} C ${x} ${bend + 95}, ${x + spread * .06} 680, ${x + spread * .22} 760 L ${endX} 1160`;
  return {
    path,
    tone: TONES[Math.floor(random * TONES.length)],
    opacity: .2 + random * .3,
    width: index % 9 === 0 ? 1.1 : .65,
    length: 24 + random * 68,
    duration: 6.5 + random * 6,
    offset: -(random * 12 + index * .31),
  };
});

export default function NexusBackground() {
  const svg = useRef(null);
  const id = useId().replace(/:/g, '');
  const mask = `${id}-stream-mask`;
  const contrast = `${id}-stream-contrast`;

  useEffect(() => {
    const field = svg.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePlayback = () => {
      if (reduced.matches || document.hidden) field.pauseAnimations?.();
      else field.unpauseAnimations?.();
    };
    updatePlayback();
    reduced.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      reduced.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
    };
  }, []);

  return (
    <div className="nexus-stream-background" aria-hidden="true">
      <svg ref={svg} viewBox="0 0 1440 1000" preserveAspectRatio="none" focusable="false">
        <defs>
          {/* Reduce line contrast beneath the text without adding a light bloom. */}
          <radialGradient id={contrast} cx="50%" cy="44%" r="52%">
            <stop offset="0%" stopColor="#303030" />
            <stop offset="48%" stopColor="#555555" />
            <stop offset="100%" stopColor="#ffffff" />
          </radialGradient>
          <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="1000" style={{ maskType: 'luminance' }}>
            <rect width="1440" height="1000" fill={`url(#${contrast})`} />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          {FIBERS.map((fiber, index) => (
            <g key={index} className={`nexus-light-fiber nexus-light-fiber--${fiber.tone}`}>
              <path d={fiber.path} fill="none" stroke="currentColor" strokeWidth={fiber.width} opacity={fiber.opacity} />
              <rect x={-fiber.length / 2} y="-.55" width={fiber.length} height="1.1" rx=".55" fill="currentColor" className="nexus-light-pulse">
                <animateMotion path={fiber.path} dur={`${fiber.duration}s`} begin={`${fiber.offset}s`} rotate="auto" repeatCount="indefinite" calcMode="linear" />
              </rect>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
