import { useEffect, useId, useState } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import beacon from '../../prototype/assets/characters/beacon-base.png';
import { loadingMessage, mathMoments, studyMoments } from './loadingMessages';
import useDelayedLoading from './useDelayedLoading';
import './loading.css';

export function BeaconLoading({ variant = 'account', name, fullPage = false, overlay = false, onBack }) {
  const id = useId();
  const neutral = variant === 'assessment';
  const moments = neutral ? studyMoments : mathMoments;
  const [moment, setMoment] = useState(() => Math.floor(Math.random() * moments.length));
  const [slow, setSlow] = useState(false);
  const message = loadingMessage(variant, name);
  const titleWords = message.title.split(' ');
  const titleEnd = titleWords.pop();

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) setMoment(current => (current + 1) % moments.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [moments]);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  return <section className={`beacon-loading ${fullPage ? 'beacon-loading--full' : ''} ${overlay ? 'beacon-loading--overlay' : ''}`} data-loading-variant={variant} aria-labelledby={`${id}-title`}>
    {fullPage && <div className="beacon-loading-brand" aria-label="Scalaris, The Nexus">
      <span className="planet-mark" aria-hidden="true" /><span><strong>SCALARIS</strong><span>The Nexus</span></span>
    </div>}
    <div className="beacon-loading-content">
      <div className="beacon-loading-stage" aria-hidden="true">
        <span className="beacon-loading-symbol beacon-loading-symbol--plus">+</span>
        <span className="beacon-loading-symbol beacon-loading-symbol--percent">%</span>
        <span className="beacon-loading-symbol beacon-loading-symbol--equals">=</span>
        <div className="beacon-loading-character">
          <img src={beacon} alt="" width="280" height="280" fetchPriority="high" />
          <span className="beacon-loading-bulb" />
        </div>
        <span className="beacon-loading-ground" />
      </div>
      <div className="beacon-loading-status" role="status" aria-live="polite" aria-atomic="true">
        <h1 id={`${id}-title`}>{titleWords.join(' ')} <span className="beacon-loading-title-end">{titleEnd}<span className="beacon-loading-dots" aria-hidden="true"><i /><i /><i /></span></span></h1>
        <p>{message.description}</p>
      </div>
      <div className="beacon-loading-moment">
        <div className="beacon-loading-moment-label"><Lightbulb size={16} aria-hidden="true" />{neutral ? 'A moment to get ready' : "Beacon’s math moment"}</div>
        <p key={moment}>{moments[moment % moments.length]}</p>
      </div>
      <p className="beacon-loading-footnote" role={slow ? 'status' : undefined}>{slow ? 'This is taking longer than usual. Still waiting for a response.' : 'Your page will open as soon as it’s ready.'}</p>
      {onBack && <button type="button" className="beacon-loading-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Go back</button>}
    </div>
  </section>;
}

export default function DelayedBeaconLoading({ active = true, initiallyVisible = false, ...props }) {
  const visible = useDelayedLoading(active, 400, initiallyVisible);
  if (!active) return null;
  return visible ? <BeaconLoading {...props} /> : <div className={`beacon-loading-placeholder ${props.fullPage ? 'beacon-loading-placeholder--full' : ''}`} aria-busy="true" />;
}
