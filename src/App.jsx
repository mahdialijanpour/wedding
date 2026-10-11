import { useCallback, useEffect, useState } from 'react';
import InvitationCard from './components/InvitationCard';
import { usePlayback } from './hooks/usePlayback';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { invitation } from './data/invitation';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const music = useBackgroundMusic();
  const playback = usePlayback(ready && music.hasStarted);
  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => setError('بارگذاری عکس یا فونت کامل نشد. لطفاً صفحه را دوباره باز کنید.'), []);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = event => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  return (
    <main className="app-shell">
      <audio id="wedding-music" ref={music.audioRef} src={invitation.music.src} preload="auto" aria-hidden="true" />
      <div className={`presentation ${ready ? 'is-ready' : ''}`} aria-busy={!ready}>
        <InvitationCard time={playback.time} started={music.hasStarted} isStarting={music.isStarting} onStart={music.start} reducedMotion={reducedMotion} onReady={handleReady} onError={handleError} />
        {!ready && !error && <p className="loading-message" role="status">کمی تا آغاز قصهٔ ما…</p>}
      </div>
      {(error || music.error) && <p className="error-message" role="alert">{error || music.error}</p>}
      <noscript>برای نمایش کارت متحرک، جاوااسکریپت مرورگر را فعال کنید.</noscript>
    </main>
  );
}
