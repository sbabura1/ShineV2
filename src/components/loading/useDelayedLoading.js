import { useEffect, useState } from 'react';

// Delay the indicator, never the request or the arrival of real content.
export default function useDelayedLoading(active, delay = 400, initiallyVisible = false) {
  const [visible, setVisible] = useState(Boolean(active && initiallyVisible));
  useEffect(() => {
    if (!active) { setVisible(false); return undefined; }
    if (initiallyVisible) { setVisible(true); return undefined; }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [active, delay, initiallyVisible]);
  return Boolean(active && visible);
}
