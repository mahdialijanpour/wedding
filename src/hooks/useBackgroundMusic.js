import { useCallback, useEffect, useRef, useState } from 'react';
import { invitation } from '../data/invitation';

export function useBackgroundMusic() {
  const audioRef = useRef(null);
  const activeRef = useRef(false);
  const startedRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeRef.current) return;
    setError('');
    setIsStarting(true);
    if (audio.error) audio.load();
    if (audio.readyState >= 1) audio.currentTime = invitation.music.startAt;
    // Keep this synchronous with the play-button click. If the file is still
    // loading, loadedmetadata sets the start position before playback begins.
    audio.play().catch(reason => {
      if (!activeRef.current) return;
      setIsStarting(false);
      if (reason.name !== 'AbortError') {
        setError(reason.name === 'NotAllowedError'
          ? 'اجازهٔ پخش صدا را برای این صفحه فعال کنید و دوباره دکمهٔ پخش را بزنید.'
          : 'آهنگ بارگذاری نشد. دوباره دکمهٔ پخش را بزنید.');
      }
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    activeRef.current = true;
    audio.volume = invitation.music.volume;
    const cue = () => {
      if (!startedRef.current) audio.currentTime = invitation.music.startAt;
    };
    const onPlaying = () => {
      startedRef.current = true;
      setHasStarted(true);
      setIsStarting(false);
      setError('');
    };
    const onError = () => {
      setIsStarting(false);
      setError('آهنگ بارگذاری نشد. دوباره دکمهٔ پخش را بزنید.');
    };
    audio.addEventListener('loadedmetadata', cue);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', start);
    audio.addEventListener('error', onError);
    if (audio.readyState >= 1) cue();
    return () => {
      activeRef.current = false;
      audio.removeEventListener('loadedmetadata', cue);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', start);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [start]);

  return { audioRef, error, hasStarted, isStarting, start };
}
