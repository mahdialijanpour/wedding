import { useEffect, useState } from 'react';
import { DURATION } from '../data/invitation';

// The visual sequence finishes on the venue page; music has its own lifetime.
export function usePlayback(ready) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const start = performance.now();
    let frame;
    const tick = now => {
      const elapsed = Math.min(DURATION, (now - start) / 1000);
      setTime(elapsed);
      if (elapsed < DURATION) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ready]);
  return { time };
}
