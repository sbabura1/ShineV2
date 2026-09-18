import { Sparkles, X } from 'lucide-react';
import Button from '../ui/Button';

export default function BeaconPanel({ onClose }) {
  return (
    <aside className="beacon-popover">
      <button className="popover-close" onClick={onClose} aria-label="Close Beacon"><X size={17} /></button>
      <div className="beacon-icon"><Sparkles size={20} /></div>
      <span className="eyebrow">Beacon AI</span>
      <h3>A thinking partner, not an answer machine.</h3>
      <p>Ask for a hint, challenge your reasoning, or clarify a quantitative concept without giving away the decision.</p>
      <Button variant="ghost" onClick={onClose}>Close</Button>
    </aside>
  );
}
