// Frizerski studio Ilda — interakcije (bez frameworka, bez backend-a)

const STUDIO = {
  phone: '+38761577529',
  name: 'Ilda',
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

$('#year').textContent = new Date().getFullYear();

/* ---------- Slike: placeholder dok nema prave fotografije ---------- */
function toPlaceholder(img) {
  const ph = document.createElement('div');
  ph.className = 'ph';
  ph.setAttribute('role', 'img');
  ph.setAttribute('aria-label', img.alt);
  ph.textContent = img.dataset.ph || img.alt;
  img.replaceWith(ph);
}
$$('img[data-ph]').forEach((img) => {
  if (img.complete && img.naturalWidth === 0) toPlaceholder(img);
  else img.addEventListener('error', () => toPlaceholder(img), { once: true });
});

/* ---------- Header i meni ---------- */
const header = $('.header');
const nav = $('#nav');
const navToggle = $('#navToggle');

addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 10), { passive: true });

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  document.documentElement.classList.toggle('menu-open', open);
}
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
$$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

/* ---------- Animacija pri skrolanju ---------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Galerija ulazi sa zoomom, kontakt s lijeva/desna
$$('.gallery__item').forEach((el) => el.classList.add('reveal', 'reveal--zoom'));
$('.contact__info')?.classList.add('reveal--left');
$('.contact__map')?.classList.add('reveal--right');

// Postepeni ulaz elemenata koji stoje jedan pored drugog
$$('.cards, .steps__list, .gallery, .packages').forEach((group) => {
  $$(':scope > .reveal', group).forEach((el, i) => el.style.setProperty('--d', `${(i % 6) * 90}ms`));
});

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));
} else {
  $$('.reveal').forEach((el) => el.classList.add('is-in'));
}

/* ---------- Brojači u hero sekciji ---------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  const fmt = (n) => `${n.toLocaleString('de-DE')}+`;
  if (reduceMotion) { el.textContent = fmt(target); return; }
  const start = performance.now();
  const dur = 1800;
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(target * eased / 10) * 10);
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = fmt(0);
  setTimeout(() => requestAnimationFrame(tick), 1200);
}
$$('[data-count]').forEach(countUp);

/* ---------- Blagi parallax glavne fotografije ---------- */
const heroMedia = $('.hero__media');
if (heroMedia && !reduceMotion) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (scrollY < innerHeight * 1.2) heroMedia.style.setProperty('--py', `${scrollY * 0.12}px`);
      ticking = false;
    });
  }, { passive: true });
}

/* ---------- Galerija: filter + lightbox ---------- */
$$('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    $$('.chip').forEach((c) => {
      c.classList.toggle('is-active', c === chip);
      c.setAttribute('aria-selected', String(c === chip));
    });
    const f = chip.dataset.filter;
    let i = 0;
    $$('.gallery__item').forEach((item) => {
      const hide = f !== 'sve' && item.dataset.cat !== f;
      item.classList.toggle('is-hidden', hide);
      item.classList.remove('is-shown');
      if (!hide) {
        void item.offsetWidth; // ponovo pokreni animaciju
        item.style.setProperty('--d', `${i++ * 60}ms`);
        item.classList.add('is-shown');
      }
    });
  });
});

const lightbox = $('#lightbox');
const lightboxBody = $('.lightbox__body', lightbox);
$$('.gallery__item').forEach((item) => {
  item.tabIndex = 0;
  const open = () => {
    lightboxBody.replaceChildren(item.firstElementChild.cloneNode(true));
    lightbox.showModal();
  };
  item.addEventListener('click', open);
  item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});
$('.lightbox__close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });

/* ---------- Rezervacija ---------- */
const form = $('#bookingForm');
const preview = $('#preview');
const errorBox = $('#formError');
const toast = $('#toast');
let type = 'frizura';

const today = new Date();
const isoToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
$$('input[type=date]', form).forEach((i) => { i.min = isoToday; });

function setType(next) {
  type = next;
  $('.tabs', form).dataset.active = next;
  $$('.tab', form).forEach((t) => {
    const active = t.dataset.type === next;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  });
  $$('[data-for]', form).forEach((field) => {
    const show = field.dataset.for === next;
    field.hidden = !show;
    $$('input, select, textarea', field).forEach((el) => { el.disabled = !show; });
  });
  errorBox.hidden = true;
  updatePreview();
}
$$('.tab', form).forEach((t) => t.addEventListener('click', () => setType(t.dataset.type)));

// Linkovi "Rezerviši" biraju tip i uslugu
$$('[data-book]').forEach((link) => {
  link.addEventListener('click', () => {
    setType(link.dataset.book);
    if (link.dataset.service) form.elements.usluga.value = link.dataset.service;
    updatePreview();
  });
});

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}.`;
}

function buildMessage() {
  const f = form.elements;
  const v = (name) => (f[name] && !f[name].disabled ? f[name].value.trim() : '');
  const lines = [];

  if (type === 'frizura') {
    lines.push(`Pozdrav ${STUDIO.name}, želim rezervisati termin za frizuru.`, '');
    lines.push(`Usluga: ${v('usluga') || '—'}`);
    lines.push(`Datum: ${formatDate(v('datum')) || '—'}`);
    if (v('vrijeme')) lines.push(`Vrijeme: ${v('vrijeme')}`);
    if (v('osobe') && v('osobe') !== '1') lines.push(`Broj osoba: ${v('osobe')}`);
    const kosa = form.querySelector('input[name=kosa]:checked');
    if (kosa) lines.push(`Dužina kose: ${kosa.value}`);
  } else {
    lines.push(`Pozdrav ${STUDIO.name}, zanima me live crtanje na vjenčanju.`, '');
    lines.push(`Datum vjenčanja: ${formatDate(v('datumVjencanja')) || '—'}`);
    lines.push(`Lokacija: ${v('lokacija') || '—'}`);
    lines.push(`Paket: ${v('paket')}`);
    if (v('gosti')) lines.push(`Broj gostiju: oko ${v('gosti')}`);
    if (f.kombinacija.checked) lines.push('Želim i svadbenu frizuru za mladu.');
  }
  if (v('napomena')) lines.push(`Napomena: ${v('napomena')}`);
  lines.push('', `${v('ime') || '—'}, ${v('telefon') || '—'}`);
  return lines.join('\n');
}

function updatePreview() {
  const text = buildMessage();
  if (text === preview.textContent) return;
  preview.textContent = text;
  preview.classList.remove('is-updated');
  void preview.offsetWidth;
  preview.classList.add('is-updated');
}
form.addEventListener('input', updatePreview);
form.addEventListener('change', updatePreview);

function validate() {
  let firstInvalid = null;
  $$('[required]', form).forEach((el) => {
    if (el.disabled) return;
    let ok = el.value.trim() !== '';
    if (ok && el.type === 'date') ok = el.value >= isoToday;
    if (ok && el.type === 'tel') ok = el.value.replace(/\D/g, '').length >= 6;
    el.classList.toggle('is-invalid', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    if (!ok && !firstInvalid) firstInvalid = el;
  });
  if (firstInvalid) {
    errorBox.textContent = 'Molimo popunite označena polja (*) — datum ne može biti u prošlosti.';
    errorBox.hidden = false;
    firstInvalid.focus();
    return false;
  }
  errorBox.hidden = true;
  return true;
}
form.addEventListener('input', (e) => {
  if (e.target.classList.contains('is-invalid') && e.target.value.trim()) {
    e.target.classList.remove('is-invalid');
    e.target.removeAttribute('aria-invalid');
  }
});

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('is-visible');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('is-visible'), 4500);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const viberUrl = (text) =>
  `viber://chat?number=${encodeURIComponent(STUDIO.phone)}` + (text ? `&draft=${encodeURIComponent(text)}` : '');

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const smsUrl = (text) => `sms:${STUDIO.phone}${isIOS ? '&' : '?'}body=${encodeURIComponent(text)}`;

$$('[data-send]', form).forEach((btn) => {
  btn.addEventListener('click', async () => {
    if (!validate()) return;
    const text = buildMessage();
    if (btn.dataset.send === 'viber') {
      const copied = await copy(text);
      showToast(copied
        ? 'Poruka je kopirana ✓ Otvaramo Viber — ako je polje prazno, samo zalijepite poruku.'
        : 'Otvaramo Viber… Ako se poruka ne pojavi, prepišite je iz pregleda.');
      location.href = viberUrl(text);
    } else {
      location.href = smsUrl(text);
    }
  });
});

setType('frizura');
