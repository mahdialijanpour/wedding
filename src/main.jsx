import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUp, CalendarDays, Camera, Cake, Car, ChevronDown, Copy, Heart, MailOpen, MapPin, Music2, Pause, Play, Sparkles, Utensils, X } from 'lucide-react';
import { wedding } from './config';
import './style.css';

const fa = value => String(value).replace(/\d/g, n => '۰۱۲۳۴۵۶۷۸۹'[n]);
const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Ornament({ light = false }) {
  return <div className={`ornament ${light ? 'light' : ''}`} aria-hidden="true"><span/><span>❦</span><span/></div>;
}

function ScratchTile({ value, label, onReveal }) {
  const canvas = useRef(null), drawing = useRef(false), previous = useRef(null), checks = useRef(0);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 240, 300);
    gradient.addColorStop(0, '#a3b8bd'); gradient.addColorStop(.5, '#91aab1'); gradient.addColorStop(1, '#78959e');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 240, 300);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff12' : '#203e4b09';
      ctx.fillRect(Math.random() * 240, Math.random() * 300, 1.5, 1.5);
    }
    ctx.fillStyle = '#ecf1edb0'; ctx.textAlign = 'center'; ctx.font = '27px Georgia'; ctx.fillText('✧', 120, 164);
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
    <canvas ref={canvas} width="240" height="300" role="button" tabIndex={revealed ? -1 : 0} aria-label={`نمایش ${label} مراسم`} aria-pressed={revealed}
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
  return <section className="countdown section" aria-label="شمارش معکوس مراسم"><span className="eyebrow">COUNTING THE MOMENTS</span><h2 className="calligraphy">تا شروعِ همیشه</h2>
    <div className="countdown-row">{parts.map((v, i) => <div className="count-circle" key={i}><strong>{fa(String(v).padStart(2, '0'))}</strong><span>{['روز', 'ساعت', 'دقیقه', 'ثانیه'][i]}</span></div>)}</div>
    {left === 0 && <p>روزِ قشنگِ ما از راه رسید</p>}
  </section>;
}

const timelineIcons = { sparkles: Sparkles, rings: Heart, camera: Camera, music: Music2, cake: Cake, dinner: Utensils, car: Car };

function App() {
  const [opened, setOpened] = useState(false), [opening, setOpening] = useState(false), [music, setMusic] = useState(false);
  const [revealed, setRevealed] = useState(0), [toast, setToast] = useState(''), [rsvp, setRsvp] = useState(false), [attendance, setAttendance] = useState(''), [guest, setGuest] = useState('');
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
    setOpening(true); toggleMusic();
    openTimer.current = setTimeout(() => { setOpened(true); window.scrollTo(0, 0); }, motionAllowed() ? 1250 : 0);
  }
  function calendar() {
    const icsDate = value => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const icsText = value => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sina Nadia//Wedding//FA', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:sina-nadia-14050907@wedding', `DTSTAMP:${icsDate(Date.now())}`, `DTSTART:${icsDate(wedding.dateTime)}`, `DTEND:${icsDate(wedding.endDateTime)}`, `SUMMARY:${icsText(`جشن عروسی ${wedding.groom} و ${wedding.bride}`)}`, `LOCATION:${icsText(wedding.venue)}`, `DESCRIPTION:${wedding.isVenueExample ? 'ساعت و مکان فعلاً نمونه هستند و بعداً تأیید می‌شوند.' : 'به جشن آغاز زندگی مشترک ما دعوتید.'}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'Sina-Nadia-Wedding.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('فایل یادآوری مراسم آماده شد.');
  }
  function map(provider) {
    if (!wedding.coordinates) { notify('مسیریابی پس از ثبت آدرس دقیق تالار فعال می‌شود.'); return; }
    const { lat, lng } = wedding.coordinates;
    const urls = { google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, neshan: `https://neshan.org/maps/@${lat},${lng},16z`, balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}`, waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes` };
    window.open(urls[provider], '_blank', 'noopener,noreferrer');
  }
  async function saveAttendance(e) {
    e.preventDefault();
    const message = `سلام، من ${guest} هستم. ${attendance === 'yes' ? 'با خوشحالی در جشن سینا و نادیا حضور خواهم داشت.' : 'متأسفانه امکان حضور در جشن سینا و نادیا را ندارم.'}`;
    if (wedding.rsvpPhone) window.open(`https://wa.me/${wedding.rsvpPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    else {
      try { await navigator.clipboard.writeText(message); notify('متن پاسخ کپی شد؛ می‌توانید برای عروس و داماد بفرستید.'); }
      catch { notify('امکان کپی خودکار نیست؛ پاسخ هنوز ارسال نشده است.'); }
    }
    setRsvp(false);
  }
  return <>
    <audio ref={audio} src="/audio/wedding.mp3" loop preload="none"/>
    {!opened && <div className={`envelope-screen ${opening ? 'opening' : ''}`}><div className="envelope-glow"/>
      <div className="envelope-top"><p className="eyebrow">THE WEDDING OF</p><h1 className="calligraphy">سینا و نادیا</h1><p className="envelope-date">۷ آذر ۱۴۰۵</p></div>
      <button className="open-envelope" onClick={openCard} disabled={opening} aria-label="باز کردن دعوت‌نامه سینا و نادیا"><span className="seal-hit"/><span className="open-caption"><MailOpen size={19}/>{opening ? 'قصهٔ ما آغاز می‌شود…' : 'برای مشاهدهٔ دعوت‌نامه لمس کنید'}<ChevronDown size={16}/></span></button>
      <div className="envelope-bottom">نامه‌ای از عشق، برای شما</div>
    </div>}
    <main className={opened ? 'invitation is-open' : 'invitation'} inert={!opened ? true : undefined} aria-hidden={!opened}>
      <header className="hero">
        <img className="palace" src="/images/palace.webp" alt="عمارت باشکوه و نورانی با گل‌های سفید در آسمان شب" fetchPriority="high"/>
        <div className="hero-shade"/><div className="stars" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37 + 9) % 100}%`, '--y': `${(i * 23 + 4) % 70}%`, '--delay': `${i * .37}s` }}/>)}</div>
        <div className="hero-copy"><span className="eyebrow">A LOVE STORY, A NEW BEGINNING</span><h2 dir="ltr">Sina <em>&</em> Nadia</h2><p className="hero-english" dir="ltr">are getting married…</p><Ornament light/><p className="hero-persian">به جشنِ آغازِ همیشهٔ ما دعوتید</p></div>
        <a className="scroll-cue" href="#date"><span>برای تماشای ادامهٔ قصه، ورق بزنید</span><span className="mouse"><i/></span><ArrowDown size={14}/></a>
      </header>

      <section id="date" className="date-section section reveal"><span className="eyebrow">SAVE OUR DATE</span><h2>✦ تاریخِ قصهٔ ما را کشف کنید ✦</h2><p className="section-note">روی هر کارت بکشید تا رازِ روزمان آشکار شود</p>
        <div className="date-row" dir="ltr"><ScratchTile value="۱۴۰۵" label="سال" onReveal={() => setRevealed(n => n + 1)}/><ScratchTile value="آذر" label="ماه" onReveal={() => setRevealed(n => n + 1)}/><ScratchTile value="۷" label="روز" onReveal={() => setRevealed(n => n + 1)}/></div>
        <div className={`date-revealed ${revealed === 3 ? 'visible' : ''}`} aria-live="polite">{revealed === 3 ? 'شنبه، هفتم آذر هزار و چهارصد و پنج' : 'سه کارت، یک روزِ فراموش‌نشدنی'}</div>
      </section>

      <section className="love-letter section reveal"><img className="portrait" src="/images/portrait.webp" alt="تصویر هنری عروس و داماد از پشت، در قاب بیضی تزئینی" loading="lazy"/><p className="calligraphy invocation">به نام حضرت دوست</p>
        <div className="couple-names"><h2 className="calligraphy">{wedding.groom}</h2><span className="ampersand">&</span><h2 className="calligraphy">{wedding.bride}</h2></div>
        <Ornament/><div className="letter calligraphy"><p>و حالا آغاز می‌کنیم<br/>سفری به وسعت یک زندگی</p><p>به شوقِ با هم رفتن<br/>و به امیدِ با هم ماندن</p><p>دوست داریم نخستین قدم‌های این راه<br/>با حضورِ گرم شما خاطره شود.</p></div><p className="letter-signature">با عشق، سینا و نادیا</p>
      </section>

      <div className="promise-banner reveal"><span>TOGETHER IS A BEAUTIFUL PLACE TO BE</span><p className="calligraphy">تو، تمامِ ناتمامِ منی</p><Heart size={20} strokeWidth={1}/></div>
      <div className="reveal"><Countdown/></div>
      <section className="timeline-section section reveal"><span className="eyebrow">OUR SPECIAL DAY</span><h2 dir="ltr">WEDDING<br/>TIMELINE</h2><p className="script" dir="ltr">Sina & Nadia</p><p className="timeline-note">برنامهٔ یک شبِ عاشقانه</p>
        <div className="timeline">{wedding.timeline.map((event, i) => { const Icon = timelineIcons[event.icon]; return <div className={`timeline-event ${i % 2 ? 'left' : 'right'}`} key={event.icon}><div className="timeline-node"/><div className="event-icon"><Icon size={33} strokeWidth={1}/></div><div className="event-copy"><time>{event.time}</time><h3>{event.title}</h3><p>{event.subtitle}</p></div></div>; })}</div>
        <p className="sample-note">ساعت‌های برنامه فعلاً پیشنهادی هستند</p>
      </section>

      <section className="venue-section section reveal"><MapPin className="venue-pin" size={64} strokeWidth={.8}/><span className="eyebrow">WHERE WE CELEBRATE</span><h2 className="calligraphy">قرارِ عاشقانهٔ ما</h2><p className="event-date">{wedding.date}</p><div className="venue-time">از ساعت {wedding.time} تا {wedding.endTime}</div><Ornament/><h3>{wedding.venue}</h3><p className="address">{wedding.address}</p>{wedding.isVenueExample && <span className="sample-badge">مکان و ساعت نمونه · در انتظار تأیید</span>}
        <div className="map-preview" aria-label="پیش‌نمایش تزئینی نقشه؛ مکان هنوز ثبت نشده"><div className="map-road road-one"/><div className="map-road road-two"/><div className="map-road road-three"/><div className="map-road road-four"/><div className="map-park"/><div className="map-label"><MapPin size={30}/><span>اینجا، کنار هم</span><small>مکان دقیق به‌زودی</small></div></div>
        <p className="section-note">مسیرِ رسیدن به یک شبِ خاطره‌انگیز</p><div className="map-buttons">{[['neshan', 'نشان'], ['balad', 'بلد'], ['google', 'گوگل‌مپ'], ['waze', 'Waze']].map(([id, label]) => <button key={id} onClick={() => map(id)}><MapPin size={14}/>{label}</button>)}</div>
        <button className="calendar-button" onClick={calendar}><CalendarDays size={18}/>ذخیرهٔ تاریخ در تقویم</button>
      </section>

      <section className="rsvp-section section reveal"><Ornament/><span className="eyebrow">YOUR PRESENCE IS OUR PRESENT</span><h2 className="calligraphy">با شما، زیباتر است</h2><p>بودنتان، قشنگ‌ترین هدیهٔ این شب است.<br/>خوشحال می‌شویم از همراهی‌تان باخبر شویم.</p><button className="primary-button" onClick={() => setRsvp(true)}>من هم در این قصه هستم<Heart size={16}/></button><p className="tiny-note">پاسخ را آماده کنید و برای ما بفرستید</p></section>
      <footer><span className="script" dir="ltr">Sina & Nadia</span><p>۷ آذر ۱۴۰۵ · آغازِ یک عمر دوست داشتن</p><Heart size={15} strokeWidth={1}/><button onClick={() => window.scrollTo({ top: 0, behavior: motionAllowed() ? 'smooth' : 'instant' })} aria-label="بازگشت به ابتدای کارت"><ArrowUp size={17}/></button></footer>
    </main>
    {opened && <button className={`music-button ${music ? 'playing' : ''}`} onClick={toggleMusic} aria-label={music ? 'توقف موسیقی' : 'پخش موسیقی'} aria-pressed={music}><span className="music-bars"><i/><i/><i/></span><span>موسیقی</span>{music ? <Pause size={15}/> : <Play size={15}/>}</button>}
    {toast && <div className="toast" role="status">{toast}</div>}
    {rsvp && <RsvpModal onClose={() => setRsvp(false)} onSubmit={saveAttendance} guest={guest} setGuest={setGuest} attendance={attendance} setAttendance={setAttendance}/>}
  </>;
}

function RsvpModal({ onClose, onSubmit, guest, setGuest, attendance, setAttendance }) {
  const dialog = useRef(null);
  useEffect(() => { const el = dialog.current; el.showModal(); return () => el.close(); }, []);
  return <dialog ref={dialog} className="rsvp-modal" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><button className="modal-close" onClick={onClose} aria-label="بستن"><X size={20}/></button><Heart size={30} strokeWidth={1}/><h2>منتظر دیدارتان هستیم</h2><form onSubmit={onSubmit}><label htmlFor="guest">نام و نام خانوادگی</label><input id="guest" value={guest} onChange={e => setGuest(e.target.value)} required maxLength={90} placeholder="نام زیبای شما"/><fieldset><legend>در جشن همراه ما هستید؟</legend><label><input type="radio" name="attendance" value="yes" checked={attendance === 'yes'} onChange={e => setAttendance(e.target.value)} required/>با عشق می‌آیم</label><label><input type="radio" name="attendance" value="no" checked={attendance === 'no'} onChange={e => setAttendance(e.target.value)}/>از دور به یادتان هستم</label></fieldset><p className="tiny-note">{wedding.rsvpPhone ? 'برای ارسال پاسخ به واتساپ هدایت می‌شوید.' : 'پاسخ شما کپی می‌شود تا برای عروس و داماد ارسال کنید؛ ارسال خودکار نیست.'}</p><button className="primary-button" type="submit">{wedding.rsvpPhone ? 'ارسال در واتساپ' : 'کپی متن پاسخ'}<Copy size={16}/></button></form></dialog>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
