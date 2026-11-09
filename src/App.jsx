import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Heart, MapPin, Pause, Play } from 'lucide-react';
import { wedding } from './config';
import './style.css';

const fa = value => String(value).replace(/\d/g, n => '۰۱۲۳۴۵۶۷۸۹'[n]);
const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dateParts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(wedding.dateTime));
const datePart = type => dateParts.find(part => part.type === type).value;

function Ornament({ light = false }) {
  return <div className={`ornament ${light ? 'light' : ''}`} aria-hidden="true"><span/><span>❦</span><span/></div>;
}

function ScratchTile({ value, label, accessibleLabel, onReveal }) {
  const canvas = useRef(null), drawing = useRef(false), previous = useRef(null), checks = useRef(0);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 240, 300);
    gradient.addColorStop(0, '#93adb6'); gradient.addColorStop(.5, '#8ca8b3'); gradient.addColorStop(1, '#82a1ae');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 240, 300);
    for (let i = 0; i < 22000; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff12' : '#203e4b0a';
      ctx.fillRect(Math.random() * 240, Math.random() * 300, 1, 1);
    }
  }, []);
  function reveal() { if (!revealed) { setRevealed(true); onReveal(); } }
  function scratch(e) {
    if (!drawing.current || revealed) return;
    const el = canvas.current, box = el.getBoundingClientRect(), ctx = el.getContext('2d');
    const point = { x: (e.clientX - box.left) * 240 / box.width, y: (e.clientY - box.top) * 300 / box.height };
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 50; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(previous.current?.x ?? point.x, previous.current?.y ?? point.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(point.x, point.y, 25, 0, Math.PI * 2); ctx.fill(); previous.current = point;
    if (++checks.current % 5 === 0) {
      const pixels = ctx.getImageData(0, 0, 240, 300).data;
      let clear = 0; for (let i = 3; i < pixels.length; i += 16) if (pixels[i] < 128) clear++;
      if (clear / (pixels.length / 16) > .36) reveal();
    }
  }
  return <div className="date-column"><div className={`scratch-tile ${revealed ? 'revealed' : ''}`}>
    <span className="date-value">{value}</span>
    <canvas ref={canvas} width="240" height="300" role="button" tabIndex={revealed ? -1 : 0} aria-label={`نمایش ${accessibleLabel} مراسم`} aria-pressed={revealed}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } }}
      onPointerDown={e => { drawing.current = true; previous.current = null; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }}
      onPointerMove={scratch} onPointerUp={() => { drawing.current = false; previous.current = null; }} onPointerCancel={() => { drawing.current = false; previous.current = null; }}/>
    </div><span className="date-label">{label}</span></div>;
}

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const left = Math.max(0, new Date(wedding.dateTime).getTime() - now);
  const parts = [Math.floor(left / 86400000), Math.floor(left / 3600000) % 24, Math.floor(left / 60000) % 60, Math.floor(left / 1000) % 60];
  return <section className="countdown section" aria-label="شمارش معکوس مراسم"><span className="countdown-flourish" aria-hidden="true">❦</span><h2 className="calligraphy">تا روزِ وصال</h2>
    <div className="countdown-row" dir="ltr">{parts.map((v, i) => <div className="count-unit" key={i}><div className="count-dial"><strong>{fa(String(v).padStart(2, '0'))}</strong></div><span className="count-label" dir="rtl">{['روز', 'ساعت', 'دقیقه', 'ثانیه'][i]}</span></div>)}</div>
    <p className="countdown-date">{wedding.date}</p>
    {left === 0 && <p>روزِ قشنگِ ما از راه رسید</p>}
  </section>;
}

function App() {
  const [opened, setOpened] = useState(false), [opening, setOpening] = useState(false), [music, setMusic] = useState(false);
  const [revealed, setRevealed] = useState(0), [toast, setToast] = useState('');
  const audio = useRef(null), toastTimer = useRef(null), openTimer = useRef(null);
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [opened]);
  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(openTimer.current); }, []);
  useEffect(() => {
    if (!opened) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), { threshold: .09 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [opened]);
  function notify(message) { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4200); }
  async function toggleMusic() {
    if (music) { audio.current.pause(); setMusic(false); }
    else { try { await audio.current.play(); setMusic(true); } catch { notify('برای پخش موسیقی، دوباره دکمه را لمس کنید.'); } }
  }
  function openCard() {
    if (opening) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setOpening(true); toggleMusic();
    openTimer.current = setTimeout(() => { setOpened(true); window.scrollTo({ top: 0, behavior: 'instant' }); }, motionAllowed() ? 2400 : 0);
  }
  function map(provider) {
    if (!wedding.coordinates) { notify('مسیریابی پس از ثبت آدرس دقیق تالار فعال می‌شود.'); return; }
    const { lat, lng } = wedding.coordinates;
    const urls = { google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, neshan: `https://neshan.org/maps/@${lat},${lng},16z`, balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}`, waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes` };
    window.open(urls[provider], '_blank', 'noopener,noreferrer');
  }
  return <>
    <audio ref={audio} src="/audio/wedding.mp3" loop preload="none"/>
    {!opened && <div className={`envelope-screen ${opening ? 'opening' : ''}`}>
      <div className="envelope-inner" aria-hidden="true"><div className="envelope-insert"/></div>
      <div className="envelope-layer envelope-bottom-fold" aria-hidden="true"/>
      <div className="envelope-layer envelope-left-fold" aria-hidden="true"/>
      <div className="envelope-layer envelope-right-fold" aria-hidden="true"/>
      <div className="envelope-layer envelope-flap" aria-hidden="true"/>
      <div className="envelope-flash" aria-hidden="true"/>
      <button className="open-envelope" onClick={openCard} disabled={opening} aria-label="باز کردن دعوت‌نامه سینا و نادیا"><span className="open-caption">برای مشاهده کارت کلیک فرمایید</span></button>
    </div>}
    <main className={opened ? 'invitation is-open' : opening ? 'invitation is-opening' : 'invitation'} inert={!opened ? true : undefined} aria-hidden={!opened}>
      <header className="hero">
        <img className="palace" src="/images/palace.webp" alt="عمارت باشکوه و نورانی با گل‌های سفید در آسمان شب" fetchPriority="high"/>
        <div className="hero-shade"/><div className="stars" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37 + 9) % 100}%`, '--y': `${(i * 23 + 4) % 70}%`, '--delay': `${i * .37}s` }}/>)}</div>
        <div className="fireworks" aria-hidden="true">{[0, 1, 2].map(burst => <div className={`firework burst-${burst}`} key={burst}>{Array.from({ length: 20 }, (_, i) => { const angle = i * Math.PI / 10; return <i key={i} style={{ '--dx': `${Math.cos(angle) * 76}px`, '--dy': `${Math.sin(angle) * 76}px`, '--angle': `${i * 18}deg`, '--burst-delay': `${burst * 1.8}s` }}/>; })}</div>)}</div>
        <div className="hero-copy"><span className="eyebrow">A LOVE STORY, A NEW BEGINNING</span><h2 dir="ltr">Nadia <em>&</em> Sina</h2><p className="hero-english" dir="ltr">are getting married…</p><Ornament light/><p className="hero-persian">به جشنِ آغازِ همیشهٔ ما دعوتید</p></div>
        <a className="scroll-cue" href="#date"><span>برای تماشای ادامهٔ قصه، ورق بزنید</span><span className="mouse"><i/></span><ArrowDown size={14}/></a>
      </header>

      <section id="date" className="date-section section reveal" aria-label="تاریخ مراسم؛ ۷ آذر ۱۴۰۵ برابر با ۲۸ نوامبر ۲۰۲۶">
        <h2 className="scratch-heading" dir="ltr" lang="en"><span aria-hidden="true">✦</span>Scratch to reveal the date<span aria-hidden="true">✦</span></h2>
        <div className="date-row" dir="ltr" lang="en"><ScratchTile value={datePart('year')} label="YEAR" accessibleLabel="سال" onReveal={() => setRevealed(n => n + 1)}/><ScratchTile value={datePart('month')} label="MONTH" accessibleLabel="ماه" onReveal={() => setRevealed(n => n + 1)}/><ScratchTile value={datePart('day')} label="DAY" accessibleLabel="روز" onReveal={() => setRevealed(n => n + 1)}/></div>
        <div className="sr-only" aria-live="polite">{revealed === 3 ? 'شنبه، هفتم آذر هزار و چهارصد و پنج' : 'روی کارت‌ها بکشید یا برای نمایش تاریخ کلید ورود را بزنید.'}</div>
      </section>

      <section className="love-letter section reveal" aria-label="متن دعوت‌نامه">
        <p className="calligraphy invocation">به نام حضرت دوست</p>
        <div className="couple-names calligraphy" aria-label={`${wedding.bride} و ${wedding.groom}`}>
          <div className="person-name"><h2>نادیا</h2><span>علیزاده نژاد</span></div>
          <span className="name-join">و</span>
          <div className="person-name"><h2>سینا</h2><span>حسین زاده</span></div>
        </div>
        <div className="letter calligraphy">
          <div className="poem-couplet"><p>و حالا آغاز سفریم</p><p>سفری به وسعت یک زندگی</p></div>
          <div className="poem-couplet"><p>به شوق با هم رفتن</p><p>و به امید با هم ماندن</p></div>
          <p className="letter-ending">دوست داریم نخستین قدم‌های این راه<br/>با حضور پرمهر شما خاطره شود.</p>
        </div>
      </section>
      <div className="reveal"><Countdown/></div>

      <section className="venue-section section reveal"><MapPin className="venue-pin" size={64} strokeWidth={.8}/><span className="eyebrow">WHERE WE CELEBRATE</span><h2 className="calligraphy">قرارِ عاشقانهٔ ما</h2><p className="event-date">{wedding.date}</p><div className="venue-time">از ساعت {wedding.time} تا {wedding.endTime}</div><Ornament/><h3>{wedding.venue}</h3><p className="address">{wedding.address}</p>{wedding.isVenueExample && <span className="sample-badge">مکان و ساعت نمونه · در انتظار تأیید</span>}
        <div className="map-preview" aria-label="پیش‌نمایش تزئینی نقشه؛ مکان هنوز ثبت نشده"><div className="map-road road-one"/><div className="map-road road-two"/><div className="map-road road-three"/><div className="map-road road-four"/><div className="map-park"/><div className="map-label"><MapPin size={30}/><span>اینجا، کنار هم</span><small>مکان دقیق به‌زودی</small></div></div>
        <p className="section-note">مسیرِ رسیدن به یک شبِ خاطره‌انگیز</p><div className="map-buttons">{[['neshan', 'نشان'], ['balad', 'بلد'], ['google', 'گوگل‌مپ'], ['waze', 'Waze']].map(([id, label]) => <button key={id} onClick={() => map(id)}><MapPin size={14}/>{label}</button>)}</div>
      </section>

      <footer><span className="script" dir="ltr">Sina & Nadia</span><p>۷ آذر ۱۴۰۵ · آغازِ یک عمر دوست داشتن</p><Heart size={15} strokeWidth={1}/><button onClick={() => window.scrollTo({ top: 0, behavior: motionAllowed() ? 'smooth' : 'instant' })} aria-label="بازگشت به ابتدای کارت"><ArrowUp size={17}/></button></footer>
    </main>
    {opened && <button className={`music-button ${music ? 'playing' : ''}`} onClick={toggleMusic} aria-label={music ? 'توقف موسیقی' : 'پخش موسیقی'} aria-pressed={music}><span className="music-bars"><i/><i/><i/></span><span>موسیقی</span>{music ? <Pause size={15}/> : <Play size={15}/>}</button>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </>;
}

export default App;
