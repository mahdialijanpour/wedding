import { useEffect, useMemo, useRef, useState } from 'react';
import qrcode from 'qrcode-generator';
import Animated from './Animated';
import { invitation } from '../data/invitation';

export default function InvitationCard({ time, started, isStarting, onStart, reducedMotion, onReady, onError }) {
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const cardRef = useRef(null);
  const [scale, setScale] = useState(0);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.mapQuery)}`;
  const qrImage = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(mapUrl);
    qr.make();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true }))}`;
  }, [mapUrl]);

  useEffect(() => {
    const stage = stageRef.current;
    const fit = () => setScale(Math.min(stage.clientWidth / 486, stage.clientHeight / 864));
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    fit();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([document.fonts.load('24px Nastaliq'), document.fonts.load('32px DateScript'), imageRef.current.decode()])
      .then(() => {
        if (!active) return;
        for (const text of cardRef.current.querySelectorAll('.poem-line-text')) {
          const line = text.parentElement;
          let size = 24;
          line.style.fontSize = `${size}px`;
          while (text.offsetWidth > line.clientWidth - 16 && size > 18) line.style.fontSize = `${--size}px`;
        }
        onReady();
      })
      .catch(() => { if (active) onError(); });
    return () => { active = false; };
  }, [onReady, onError]);

  const progress = Math.min(1, Math.max(0, time / 3.2));
  const portraitProgress = !started ? 0 : reducedMotion ? 1 : progress * progress * (3 - 2 * progress);
  const animation = { time: Math.max(0, time - 2.6), reducedMotion };
  return (
    <div className="card-stage" ref={stageRef}>
      <div className="card-frame" style={{ width: 486 * scale, height: 864 * scale }}>
        <article ref={cardRef} className="invitation-card" aria-label={`جشن پیوند ${invitation.bride} و ${invitation.groom}`} style={{ transform: `scale(${scale})` }}>
          <div className="card-content" aria-hidden={!started} inert={!started} style={{ opacity: started ? 1 : 0 }}>
          <div className="portrait" style={{ opacity: portraitProgress, transform: portraitProgress < 1 ? `translateY(${(1 - portraitProgress) * 16}px)` : 'none', filter: portraitProgress < 1 ? `blur(${(1 - portraitProgress) * 5}px)` : 'none' }}>
            <img ref={imageRef} src={invitation.portrait} alt="عکس کودکی حدیث و حسن با لباس عروس و داماد" fetchPriority="high" style={{ transform: portraitProgress < 1 ? `scale(${1 + (1 - portraitProgress) * 0.12})` : 'none' }} />
          </div>
          <Animated {...animation} className="date-stack" start={0} end={15.1}>
            {invitation.date.gregorian.map((part, i) => <span key={i}>{part}</span>)}
          </Animated>
          <Animated {...animation} as="p" className="card-text intro" start={0.45} end={14.8}>{invitation.intro}</Animated>
          <Animated {...animation} as="h1" className="card-text names" start={1.5} end={14.8} reveal={1.9}>
            <span>{invitation.firstNames}</span>
          </Animated>
          <div className="poem">
            {invitation.poem.map((line, index) => (
              <Animated {...animation} as="p" key={index} start={3.8 + index * 1.6} end={14.8} reveal={1.5}><span className="poem-line-text">{line}</span></Animated>
            ))}
          </div>
          <Animated {...animation} as="p" className="card-text family-names" start={8.8} end={14.8}>{invitation.familyNames}</Animated>
          <Animated {...animation} as="p" className="card-text welcome" start={16.2} reveal={1.7}>{invitation.welcome}</Animated>
          <Animated {...animation} as="time" className="calendar" dateTime={invitation.date.iso} start={18.1}>
            <span className="calendar-wing">{invitation.date.weekday}</span>
            <span className="calendar-day">{invitation.date.day}</span>
            <span className="calendar-wing calendar-month">{invitation.date.month} {invitation.date.year}</span>
          </Animated>
          {invitation.time && <Animated {...animation} as="p" className="card-text ceremony-time" start={18.9}>{invitation.time}</Animated>}
          <Animated {...animation} as="p" className="card-text venue-title" start={20.1} reveal={1.5}>{invitation.venue}</Animated>
          <Animated {...animation} as="p" className="card-text address" start={21.6} reveal={1.5}>آدرس: {invitation.address}</Animated>
          <Animated {...animation} as="a" className="map-link" start={23.3} href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label="جستجوی تالار نگین کوهستان در نقشه" title="باز کردن نقشهٔ تالار">
            <img src={qrImage} alt="کد نقشهٔ تالار؛ برای باز کردن لمس کنید" />
          </Animated>
          <Animated {...animation} as="p" className="card-text closing" start={25} reveal={1.7}>{invitation.closing}</Animated>
          </div>
          {!started && <div className="card-entry">
            <button className="card-start-button" type="button" onClick={onStart} disabled={isStarting} aria-label={isStarting ? 'در حال پخش…' : 'پخش دعوت‌نامه'} aria-busy={isStarting} aria-controls="wedding-music">
              <span className="play-circle">
                <svg className={isStarting ? 'start-loader' : 'start-play-icon'} width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                  {isStarting
                    ? <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="34 17" />
                    : <path d="M9 6.5 18 12l-9 5.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />}
                </svg>
              </span>
            </button>
          </div>}
        </article>
      </div>
    </div>
  );
}
