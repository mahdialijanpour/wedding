import portrait from '../assets/wedding-portrait-v3.png';
import soundtrack from '../assets/babe-delami.mp3';

// Change the invitation here. The map QR code is generated from mapQuery.
export const invitation = {
  bride: 'حدیث نگین راز',
  groom: 'حسن صفافر',
  firstNames: 'حدیث و حسن',
  familyNames: 'نگین راز - صفافر',
  portrait,
  music: { src: soundtrack, startAt: 12, volume: 0.7 },
  intro: 'به نام عشق و پیمانش',
  poem: [
    'جهان به چه کار آید گر تو را کنار خود نداشته باشم',
    'و کلمات چه بیهوده خواهند بود اگر نتوانم روبرویت بایستم',
    'و فریاد بزنم که دوستت دارم',
  ],
  welcome: 'حضورتان یادگار است و خاطره‌ای ماندگار',
  date: {
    weekday: 'سه‌شنبه',
    day: '۲۸',
    month: 'مهر',
    year: '۱۴۰۵',
    iso: '2026-10-20',
    gregorian: ['20', '10', '2026'],
  },
  // For example: 'از ساعت ۱۸ تا ۲۳'. An empty value hides the time.
  time: '',
  venue: 'تالار نگین کوهستان',
  address: 'لاهیجان، خیابان سعدی',
  mapQuery: 'تالار نگین کوهستان لاهیجان خیابان سعدی',
  closing: 'چشم‌به‌راه حضور گرم شما هستیم',
};

export const DURATION = 32;
