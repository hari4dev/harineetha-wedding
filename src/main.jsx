import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { couple, events, story, galleryImages, giftRegistry, liveStream, musicConfig } from './data/siteContent';
import './styles.css';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "@emailjs/browser";

const ASSET_BASE = import.meta.env.BASE_URL || '/';
const musicSrc = `${ASSET_BASE}music/wedding.mp3`;
function asset(path) {
  return `${ASSET_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

function MusicButton({ opened }) {
  const audioRef = useRef(null); const [on, setOn] = useState(false);
  function toggle() {
    if (!audioRef.current) return;
    audioRef.current.volume = musicConfig.volume;
    if (on) { audioRef.current.pause(); setOn(false); } else { audioRef.current.play().catch(() => { }); setOn(true); }
  }
  return <>{musicConfig.enabled && <button className="musicBtn" onClick={toggle}>{on ? '🔊' : '🔇'} {on ? musicConfig.buttonTextOn : musicConfig.buttonTextOff}</button>}<audio ref={audioRef} loop preload="auto" src={musicSrc} /></>;
}

function Welcome() { const [open, setOpen] = useState(false); return <><AnimatePresence>{!open && <motion.div className="welcome" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1 }}><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ganesh"><img src={asset('images/gallery/HariNeethaWedding.png')} alt="Hari and Neetha" className="welcomeImage" /></motion.div><motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}>{couple.logo}</motion.h1><p>{couple.tagline}</p><button onClick={() => setOpen(true)}>Open Invitation</button></motion.div>}</AnimatePresence><MusicButton opened={open} /></> }

function Petals() { return <div className="petals">{Array.from({ length: 22 }).map((_, i) => <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 8}s`, animationDuration: `${7 + Math.random() * 9}s` }}>🌸</span>)}</div> }

function Hero() { return <section className="hero section"><Petals /><motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}><img src={asset('images/gallery/ganesha.png')} alt="Ganesha" className="heroGanesha" /><div className="crest">KALYANAM</div><h1>{couple.groom}<span>♥</span>{couple.bride}</h1><h2>{couple.headline}</h2><p>{couple.date}</p><div className="scrollHint">Scroll to begin ↓</div></motion.div></section> }

function Story() {
  return (
    <section className="section story parallelJourney">
      <motion.div
        className="storyIntro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="eyebrow">Our Journey</p>
        <h2>Two Cities. One Destiny.</h2>
        <p className="lead">
          From Coimbatore and Hyderabad, two beautiful journeys began in parallel —
          until life brought us together in New York.
        </p>
      </motion.div>

      <div className="parallelGrid">
        <motion.div
          className="cityPanel coimbatorePanel"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >
          <div className="cityIcon" aria-label="Coimbatore icons">
            <svg viewBox="0 0 64 64" role="img" aria-label="Marudamalai Temple">
              <rect width="64" height="64" fill="none" />
              <path d="M10 46c8-10 14-16 22-16s14 6 22 16" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 46V28h32v18" fill="#FFF8ED" stroke="#C99D4F" strokeWidth="2" />
              <path d="M20 28h24" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 28v-8l8-6 8 6v8" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24 36h16" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 42h16" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 18h20" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M32 12l4 8h-8l4-8Z" fill="#FFF8ED" stroke="#C99D4F" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <svg viewBox="0 0 64 64" role="img" aria-label="Annapoorna Coffee">
              <rect width="64" height="64" fill="none" />
              <path d="M20 22h22c4 0 8 3 8 8s-4 8-8 8H20" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 22v-4h18v4" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 40h20" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 40h28" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M26 14c2 1 3 2 3 4" fill="none" stroke="#C99D4F" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M38 14c-1 2-2 3-3 4" fill="none" stroke="#C99D4F" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <svg viewBox="0 0 64 64" role="img" aria-label="Textile City">
              <rect width="64" height="64" fill="none" />
              <path d="M18 18h28" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 18v22M42 18v22" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 40h28" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 28h20" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <circle cx="22" cy="28" r="2" fill="#C99D4F" />
              <circle cx="42" cy="28" r="2" fill="#C99D4F" />
              <path d="M30 18l8 8-8 8-8-8 8-8Z" fill="#FFF8ED" stroke="#C99D4F" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <svg viewBox="0 0 64 64" role="img" aria-label="Siruvani Hills">
              <rect width="64" height="64" fill="none" />
              <path d="M10 46l12-18 10 12 10-20 12 26" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 46c4-3 8-5 12-5s8 2 12 5" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 24c2-2 5-3 8-3s6 1 8 3" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 18c3 0 5-2 6-4" fill="none" stroke="#C99D4F" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M47 18c-3 0-5-2-6-4" fill="none" stroke="#C99D4F" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <svg viewBox="0 0 64 64" role="img" aria-label="Adiyogi">
              <rect width="64" height="64" fill="none" />
              <path d="M24 18a8 8 0 1 0 16 0 8 8 0 1 0-16 0Z" fill="#FFF8ED" stroke="#C99D4F" strokeWidth="2" />
              <path d="M22 28h20" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 28c0 8 4 14 8 14s8-6 8-14" fill="none" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 42h20" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M26 42v8M38 42v8" stroke="#C99D4F" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 14c3 2 5 3 8 3" fill="none" stroke="#C99D4F" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M46 14c-3 2-5 3-8 3" fill="none" stroke="#C99D4F" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h3>Coimbatore</h3>
          <p>
            Hari’s journey began with Tamil roots, tradition, dreams, and a heart
            full of hope.
          </p>
        </motion.div>

        <div className="journeyHeart">
          <span></span>
          <div>♥</div>
          <span></span>
        </div>

        <motion.div
          className="cityPanel hyderabadPanel"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >
          <div className="cityIcon" aria-label="Hyderabad icons">
            <svg viewBox="0 0 64 64" role="img" aria-label="Charminar landmark">
              <rect x="12" y="14" width="40" height="36" rx="10" fill="#fff6e1" />
              <path d="M24 46V28h16v18" fill="#b85d34" />
              <path d="M22 28h20" stroke="#7b3f1d" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 24h24" stroke="#d79b3f" strokeWidth="3" strokeLinecap="round" />
              <path d="M24 24v8M40 24v8" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 18l4 6-4 6-4-6 4-6Z" fill="#f0c66b" />
            </svg>
            <svg viewBox="0 0 64 64" role="img" aria-label="Pearls">
              <circle cx="24" cy="32" r="8" fill="#f7e7c3" stroke="#9a6f2f" strokeWidth="2" />
              <circle cx="40" cy="32" r="8" fill="#f7e7c3" stroke="#9a6f2f" strokeWidth="2" />
              <path d="M28 32h8" stroke="#9a6f2f" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 26c2 2 3 3 3 6s-1 4-3 6" stroke="#d4b978" strokeWidth="2" strokeLinecap="round" />
              <path d="M42 26c-2 2-3 3-3 6s1 4 3 6" stroke="#d4b978" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <svg viewBox="0 0 64 64" role="img" aria-label="Biryani plate">
              <circle cx="32" cy="32" r="22" fill="#fff8e8" stroke="#d48d3b" strokeWidth="3" />
              <path d="M20 30c0-8 6-12 12-12s12 4 12 12" fill="#7a4a1d" />
              <path d="M22 36h20" stroke="#a6502d" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 40h16" stroke="#a6502d" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 22c2 1 4 1 6 0" stroke="#f2c46d" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3>Hyderabad</h3>
          <p>
            Neetha’s journey began with Telugu warmth, culture, grace, and
            beautiful dreams.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="nycStory"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
      >
        <div className="nycIcon">🗽</div>
        <h3>And then, New York happened.</h3>
        <p>
          Two different stories crossed paths in one unforgettable city —
          and slowly became one beautiful forever.
        </p>
        <h4>Two Cultures. One Journey. One Forever.</h4>
      </motion.div>
    </section>
  );
}

function Countdown() {
  const weddingDate = useMemo(() => new Date("2026-08-30T10:00:00"), []);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(weddingDate - new Date(), 0);


      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  const blocks = [
    {
      label: "Days",
      value: time.days,
    },
    {
      label: "Hours",
      value: time.hours,
    },
    {
      label: "Minutes",
      value: time.minutes,
    },
    {
      label: "Seconds",
      value: time.seconds,
    },
  ];
  return (
    <section className="sacredCountdown">
      <img className="countdownBg" src={asset('images/designs/kolam.svg')} alt="" />

      <div className="topDecor leftDecor">
        <img src={asset('images/designs/jasmine-garland.svg')} alt="" />
        <img className="diyaImg" src={asset('images/designs/brass-diya.svg')} alt="" />
      </div>

      <div className="topDecor rightDecor">
        <img src={asset('images/designs/jasmine-garland.svg')} alt="" />
        <img className="diyaImg" src={asset('images/designs/brass-diya.svg')} alt="" />
      </div>

      <motion.div className="countdownContent">
        <p className="eyebrow">The Sacred Countdown</p>
        <h2>Until We Begin Forever</h2>

        <div className="lotusDivider">
          <span></span>
          <img src={asset('images/designs/lotus.svg')} alt="" />
          <span></span>
        </div>

        <div className="timerTemple">
          {blocks.map((block) => (
            <motion.div
              key={block.label}
              className="timePillar"
              whileHover={{
                y: -8,
                scale: 1.05,
              }}
            >
              <span>{String(block.value).padStart(2, "0")}</span>
              <small>{block.label}</small>
            </motion.div>
          ))}
        </div>

        <p className="countdownQuote">
          Every sunrise brings us one step closer to celebrating our forever with you.
        </p>
      </motion.div>
    </section>
  );
}
function Events() { return <section className="section events"><h2>Wedding Celebrations</h2>{events.map((e, i) => <motion.article className="eventCard" key={e.id} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}><div className="eventIcon">{e.icon}</div><div><h3>{e.title}</h3><h4>{e.date} | {e.time}</h4><p className="venue">📍 {e.venue} — {e.location}</p><p>{e.description}</p><a href={e.map}>View Location</a></div></motion.article>)}</section> }

function Gallery() { return <section className="section gallery"><h2>Gallery</h2><p className="lead">Add your photos later inside <b>public/images/gallery</b> and update <b>src/data/siteContent.js</b>.</p><div className="grid">{galleryImages.map(g => <div className="photo" key={g.id}><div className="placeholder">{g.category}</div><h3>{g.title}</h3></div>)}</div></section> }

function RSVP() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    groupSize: 1,
    rsvps: {},
  });

  const [submitted, setSubmitted] = useState(false);
  const max = Number(form.groupSize) || 1;

  const update = (id, obj) =>
    setForm((f) => ({
      ...f,
      rsvps: {
        ...f.rsvps,
        [id]: {
          ...(f.rsvps[id] || { attending: false, count: 0 }),
          ...obj,
        },
      },
    }));

  const submit = async (e) => {
  e.preventDefault();

  const eventIds = events.map((event) => event.id);

  const hasSelectedEvent = eventIds.some(
    (id) => form.rsvps?.[id]?.attending
  );

  if (!form.name.trim()) return alert("Please enter your name.");
  if (!form.email.trim()) return alert("Please enter your email.");
  if (!hasSelectedEvent) return alert("Please select at least one event.");

  const emailKey = form.email.trim().toLowerCase();

  const getEvent = (id) => {
    const event = form.rsvps?.[id] || {};
    const attending = !!event.attending;

    return {
      attending,
      guests: attending ? Number(event.count) || 1 : 0,
    };
  };

  const prelude = getEvent("prelude");
  const haldi = getEvent("traditions");
  const wedding = getEvent("muhurtham");

  const payload = {
    name: form.name.trim(),
    email: emailKey,
    phone: form.phone.trim(),
    groupSize: Number(form.groupSize) || 1,

    preludeAttending: prelude.attending,
    preludeGuests: prelude.guests,

    haldiAttending: haldi.attending,
    haldiGuests: haldi.guests,

    weddingAttending: wedding.attending,
    weddingGuests: wedding.guests,

    rsvps: {
      prelude,
      haldi,
      wedding,
    },

    updatedAt: serverTimestamp(),
  };

  try {
  await setDoc(doc(db, "rsvps", emailKey), payload, {
    merge: true,
  });

  await emailjs.send(
    "service_ao3gy1t",
    "template_gjl4a5l",
    {
      guest_name: payload.name,
      guest_email: payload.email,

      prelude_status: payload.preludeAttending
        ? `Attending (${payload.preludeGuests} Guest${payload.preludeGuests > 1 ? "s" : ""})`
        : "Not Attending",

      haldi_status: payload.haldiAttending
        ? `Attending (${payload.haldiGuests} Guest${payload.haldiGuests > 1 ? "s" : ""})`
        : "Not Attending",

      wedding_status: payload.weddingAttending
        ? `Attending (${payload.weddingGuests} Guest${payload.weddingGuests > 1 ? "s" : ""})`
        : "Not Attending",
    },
    "8S9vafjYNbuTwGQjx"
  );

  confetti();
  setSubmitted(true);
} catch (error) {
  console.error("RSVP submit/email error:", error);
  alert("RSVP saved, but email may not have been sent. Please try again.");
}

};

  if (submitted) {
    return (
      <section className="section rsvp">
        <div className="rsvpCard">
          <h2>RSVP Received ❤️</h2>
          <p>Thank you, {form.name}. We can’t wait to celebrate with you!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section rsvp">
      <h2>RSVP</h2>

      <form onSubmit={submit} className="rsvpCard">
        <input
          required
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          required
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <label>
          Total Group Size
          <select
            value={form.groupSize}
            onChange={(e) =>
              setForm({ ...form, groupSize: Number(e.target.value) })
            }
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>

        {events.map((ev) => {
          const r = form.rsvps[ev.id] || { attending: false, count: 0 };

          return (
            <div className="rsvpEvent" key={ev.id}>
              <h3>
                {ev.icon} {ev.title}
              </h3>

              <div className="toggle">
                <button
                  type="button"
                  className={r.attending ? "active" : ""}
                  onClick={() =>
                    update(ev.id, { attending: true, count: r.count || 1 })
                  }
                >
                  Attending
                </button>

                <button
                  type="button"
                  className={!r.attending ? "active muted" : ""}
                  onClick={() =>
                    update(ev.id, { attending: false, count: 0 })
                  }
                >
                  Not Attending
                </button>
              </div>

              {r.attending && (
                <select
                  value={r.count}
                  onChange={(e) =>
                    update(ev.id, { count: Number(e.target.value) })
                  }
                >
                  {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}

        <button className="submit">Submit RSVP</button>
      </form>
    </section>
  );
}
function InfoSections() { return <>{giftRegistry.enabled && <section className="section soft"><h2>{giftRegistry.title}</h2><p>{giftRegistry.description}</p><a className="primary" href={giftRegistry.link}>{giftRegistry.buttonText}</a></section>}{liveStream.enabled && <section className="section soft"><h2>{liveStream.title}</h2><p>{liveStream.description}</p><a className="primary" href={liveStream.youtubeLink}>{liveStream.buttonText}</a><small>{liveStream.note}</small></section>}</> }
function Footer() { return <footer><h2>{couple.logo}</h2><p>Every journey has a destination. Ours begins here.</p></footer> }
function App() { return <><Welcome /><Hero /><Countdown /><Story /><Events /><Gallery /><RSVP /><InfoSections /><Footer /></> }

createRoot(document.getElementById('root')).render(<App />);
