import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { couple, events, story, galleryImages, giftRegistry, liveStream, musicConfig } from './data/siteContent';
import './styles.css';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "@emailjs/browser";

const ASSET_BASE = import.meta.env.BASE_URL || '/';
const musicSrc = `${ASSET_BASE}music/wedding.mp3`;
function asset(path) {
  return `${ASSET_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
}


function normalizePhone(value = "") {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

function namesMatch(savedName = "", enteredName = "") {
  const saved = savedName.trim().toLowerCase();
  const entered = enteredName.trim().toLowerCase();

  if (!saved || !entered) return true;

  return saved.startsWith(entered) || entered.startsWith(saved);
}

function InvitationAccess({ onContinue }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);

  const continueToInvitation = async (e) => {
    e.preventDefault();

    const enteredName = name.trim();
    const normalizedPhone = normalizePhone(phone);

    if (!enteredName) {
      alert("Please enter your first name.");
      return;
    }

    if (normalizedPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setChecking(true);

    try {
      const invitationRef = doc(db, "invitations", normalizedPhone);
      const invitationSnap = await getDoc(invitationRef);

      let inviteType = "wedding";
let displayName = enteredName;

if (invitationSnap.exists()) {
  const invitationData = invitationSnap.data();

  if (namesMatch(invitationData.name || "", enteredName)) {
    inviteType = "all";
    displayName = invitationData.name || enteredName;
  }
}

const guest = {
  name: displayName,
  phone: normalizedPhone,
  inviteType,
};

localStorage.setItem(
  "weddingGuest",
  JSON.stringify(guest)
);

onContinue(guest);
    } catch (error) {
      console.error("Invitation lookup error:", error);
      alert("We could not open the invitation. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="welcome invitationAccess">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="invitationAccessCard"
      >
        <img
          src={asset("images/gallery/ganesha.png")}
          alt="Ganesha"
          className="heroGanesha"
        />
        <p className="eyebrow">Hari & Neetha</p>
        <h1>Open Your Invitation</h1>
        <p>Enter your first name and mobile number.</p>

        <form onSubmit={continueToInvitation}>
          <input
            required
            placeholder="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button type="submit" disabled={checking}>
            {checking ? "Opening…" : "View Invitation"}
          </button>
        </form>
      </motion.div>
    </section>
  );
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

function Welcome({ open, onOpenInvitation }) {
  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div className="welcome" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ganesh">
              <img src={asset('images/gallery/HariNeethaWedding.png')} alt="Hari and Neetha" className="welcomeImage" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}>{couple.logo}</motion.h1>
            <p>{couple.tagline}</p>
            <button onClick={onOpenInvitation}>Open Invitation</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Petals() { return <div className="petals">{Array.from({ length: 22 }).map((_, i) => <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 8}s`, animationDuration: `${7 + Math.random() * 9}s` }}>🌸</span>)}</div> }

function Hero({ open }) {
  const backgroundStyle = open ? {
    backgroundImage: `url(${asset('images/gallery/InvitationBackground.png')})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : undefined;

  return (
    <section className="hero section" style={backgroundStyle}>
      <Petals />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: .8 }}
      >
        <img src={asset('images/gallery/ganesha.png')} alt="Ganesha" className="heroGanesha" />
        <div className="crest">KALYANAM</div>
        <h1>{couple.groom}<span>♥</span>{couple.bride}</h1>
        <h2>{couple.headline}</h2>
        <p>{couple.date}</p>
        <div className="scrollHint">Scroll to begin ↓</div>
      </motion.div>
    </section>
  );
}

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
          <div className="cityIcon" aria-label="Coimbatore image">
            <img src={asset('images/gallery/Coimbatore.png')} alt="Coimbatore" style={{ width: '100%', height: 'auto', display: 'block' }} />
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
          <div className="cityIcon" aria-label="Hyderabad image">
            <img src={asset('images/gallery/Hyderabad.png')} alt="Hyderabad" style={{ width: '100%', height: 'auto', display: 'block' }} />
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
        <div className="nycIcon">
          <img src={asset('images/gallery/Newyork.png')} alt="New York" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
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
       <div className="countdownTitleWrapper">
    <div className="divineRays"></div>

    <h2 className="countdownTitle">
        Until We Begin Forever
    </h2>

    <p className="countdownSubtitle">
        Every moment brings us closer to our special day.
    </p>
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
      <div className="timeFlower" aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <ellipse cx="32" cy="17" rx="5" ry="11" />
            <ellipse cx="32" cy="47" rx="5" ry="11" />
            <ellipse cx="17" cy="32" rx="5" ry="11" transform="rotate(90 17 32)" />
            <ellipse cx="47" cy="32" rx="5" ry="11" transform="rotate(90 47 32)" />
            <ellipse cx="21.5" cy="21.5" rx="5" ry="11" transform="rotate(-45 21.5 21.5)" />
            <ellipse cx="42.5" cy="21.5" rx="5" ry="11" transform="rotate(45 42.5 21.5)" />
            <ellipse cx="21.5" cy="42.5" rx="5" ry="11" transform="rotate(45 21.5 42.5)" />
            <ellipse cx="42.5" cy="42.5" rx="5" ry="11" transform="rotate(-45 42.5 42.5)" />
            <circle cx="32" cy="32" r="5" />
          </g>
        </svg>
      </div>

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
function Events({ invitedEvents }) {
  return (
    <section className="section events">
      <h2>Wedding Celebrations</h2>
      {invitedEvents.map((e) => (
        <motion.article
          className="eventCard"
          key={e.id}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eventIcon">{e.icon}</div>
          <div>
            <h3>{e.title}</h3>
            <h4>{e.date} | {e.time}</h4>
            <p className="venue">📍 {e.venue} — {e.location}</p>
            <p>{e.description}</p>
            <a href={e.map} target="_blank" rel="noopener noreferrer">
              View Location
            </a>
          </div>
        </motion.article>
      ))}
    </section>
  );
}

function Gallery() { return <section className="section gallery"><h2>Gallery</h2>
{/* <p className="lead">Add your photos later inside <b>public/images/gallery</b> and update <b>src/data/siteContent.js</b>.</p> */}
<div className="grid">{galleryImages.map(g => <div className="photo" key={g.id}><div className="placeholder">{g.category}</div><h3>{g.title}</h3></div>)}</div></section> }
function GuestCounter({
  label,
  value,
  onDecrease,
  onIncrease,
}) {
  return (
    <div className="guestCounter">
      <span className="guestCounterLabel">{label}</span>

      <div className="counterControls">
        <button
          type="button"
          onClick={onDecrease}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>

        <input
          type="number"
          value={value}
          min="0"
          readOnly
          aria-label={`${label} count`}
        />

        <button
          type="button"
          onClick={onIncrease}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
function ScratchFortune({ message }) {
  const canvasRef = useRef(null);
  const scratchingRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.globalCompositeOperation = "source-over";

    const gradient = context.createLinearGradient(
      0,
      0,
      rect.width,
      rect.height
    );

    gradient.addColorStop(0, "#b88735");
    gradient.addColorStop(0.5, "#f4dfa4");
    gradient.addColorStop(1, "#c9a24a");

    context.fillStyle = gradient;
    context.fillRect(0, 0, rect.width, rect.height);

    context.fillStyle = "#6d1f2d";
    context.font = "700 17px Georgia";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
      "Scratch to reveal your blessing ✨",
      rect.width / 2,
      rect.height / 2
    );
  }, []);

  const scratch = (event) => {
    if (!scratchingRef.current || revealed) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 28, 0, Math.PI * 2);
    context.fill();
  };

  const stopScratching = () => {
    if (!scratchingRef.current) return;

    scratchingRef.current = false;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const pixels = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    let transparent = 0;

    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 50) {
        transparent += 1;
      }
    }

    const percentage =
      (transparent / (pixels.length / 4)) * 100;

    if (percentage >= 30) {
      setRevealed(true);
    }
  };

  return (
    <div className="scratchFortune">
      <div className="fortuneContent">
        <span className="fortuneIcon">🪔</span>

        <p className="fortuneLabel">
          A Wedding Blessing Just for You
        </p>

        <p className="fortuneText">
          {message || "May happiness and prosperity always remain with you."}
        </p>
      </div>

      {!revealed && (
        <canvas
          ref={canvasRef}
          className="scratchCanvas"
          onPointerDown={(event) => {
            scratchingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            scratch(event);
          }}
          onPointerMove={scratch}
          onPointerUp={stopScratching}
          onPointerCancel={stopScratching}
          onPointerLeave={stopScratching}
        />
      )}
    </div>
  );
}
const fortuneMessages = [
  "🌸 May Lord Ganesha remove every obstacle and fill your life with endless happiness.",
  "✨ May love, peace, and prosperity always find their way to your home.",
  "💛 May every sunrise bring you new opportunities and joyful moments.",
  "🌺 Wishing you a lifetime filled with laughter, health, and cherished memories.",
  "🪔 May your family always be surrounded by warmth, kindness, and togetherness.",
  "💐 Good things are on their way—embrace every beautiful moment.",
  "🌿 May every step you take lead to success and happiness.",
  "❤️ May your heart always find reasons to smile.",
  "🌞 Wishing you abundance, peace, and unforgettable adventures.",
  "🌸 May your kindness return to you a hundredfold.",
  "✨ May happiness bloom in every season of your life.",
  "💛 May every dream you hold close become reality.",
  "🌺 The best chapters of your story are still waiting to be written.",
  "🪔 May your journey always be guided by hope and love.",
  "🌼 Wishing you strength during challenges and joy in every success.",
  "🌈 Brighter days are just around the corner.",
  "🌷 May every celebration in your life be filled with people who truly care about you.",
  "💖 Your presence is a blessing—never underestimate the joy you bring to others.",
  "🌿 May every path you choose lead to wonderful experiences.",
  "⭐ May good fortune follow you wherever life takes you.",
  "🙏 May your home always echo with laughter and happiness.",
  "💫 The universe has wonderful surprises waiting just for you.",
  "🌸 Every ending is the beginning of something even more beautiful.",
  "✨ Wishing you countless reasons to celebrate life.",
  "💛 May your heart stay light and your spirit stay strong.",
  "🌺 May every challenge become a stepping stone to success.",
  "🕊️ Peace, love, and happiness—today and always.",
  "🌷 May your friendships grow stronger and your dreams grow bigger.",
  "🌞 Every new day is another chance for something amazing.",
  "🍀 Good luck is already finding its way to you.",
  "🌻 Stay hopeful—beautiful things often arrive unexpectedly.",
  "💖 May you always be surrounded by genuine love and kindness.",
  "🌼 Wishing you endless reasons to smile today and every day.",
  "🌙 May every night bring peace and every morning bring hope.",
  "🪷 May blessings overflow into every corner of your life.",
  "💐 Happiness multiplies when shared—thank you for sharing ours.",
  "🌈 Your presence has made our celebration even more meaningful.",
  "✨ A beautiful journey awaits you—enjoy every step.",
  "🌺 May health, happiness, and harmony always stay with you.",
  "💛 Your kindness makes the world brighter.",
  "🌸 May every wish in your heart find its perfect moment.",
  "⭐ Keep believing—good things are closer than you think.",
  "🌿 May your future be filled with exciting adventures and beautiful memories.",
  "🪔 May every festival, celebration, and gathering bring your family closer.",
  "❤️ Wishing you love that grows stronger every single day.",
  "🌼 May life always surprise you with moments worth remembering.",
  "💫 Today is another reminder that beautiful memories are created together.",
  "🌷 Thank you for being part of our special journey.",
  "🙏 May you always have reasons to celebrate, smile, and be grateful.",
  "✨ Love shared is love multiplied. Thank you for sharing ours."
];
function RSVP({ guest, invitedEvents }) {
  const [form, setForm] = useState({
    name: guest.name,
    email: "",
    phone: guest.phone,
    groupSize: 1,
    rsvps: {},
  });

  const [submitted, setSubmitted] = useState(false);
  const confirmationRef = useRef(null);
  const max = Number(form.groupSize) || 1;

const [fortuneMessage] = useState(() => {
  const index = Math.floor(
    Math.random() * fortuneMessages.length
  );

  return fortuneMessages[index];
});

  useEffect(() => {
    if (!submitted) return;
    try {
      if (confirmationRef.current) {
        confirmationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        confirmationRef.current.focus();
        <ScratchFortune message={fortuneMessage} />
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // ignore
    }
  }, [submitted]);

  const update = (eventId, changes) => {
  setForm((currentForm) => ({
    ...currentForm,
    rsvps: {
      ...currentForm.rsvps,
      [eventId]: {
        attending: false,
        adults: 0,
        kids: 0,
        ...(currentForm.rsvps[eventId] || {}),
        ...changes,
      },
    },
  }));
};

const changeGuestCount = (eventId, type, amount) => {
  setForm((currentForm) => {
    const currentEvent = currentForm.rsvps[eventId] || {
      attending: true,
      adults: 0,
      kids: 0,
    };

    const currentValue = Number(currentEvent[type]) || 0;
    const nextValue = Math.max(0, currentValue + amount);

    return {
      ...currentForm,
      rsvps: {
        ...currentForm.rsvps,
        [eventId]: {
          ...currentEvent,
          attending: true,
          [type]: nextValue,
        },
      },
    };
  });
};

const formatEventStatus = (attending, adults, kids) => {
  if (!attending) {
    return "Not Attending";
  }

  return `Attending
Adults: ${adults}
Kids: ${kids}`;
};
  const submit = async (e) => {
  e.preventDefault();


  if (!form.name.trim()) return alert("Please enter your name.");
  if (!form.email.trim()) return alert("Please enter your email.");

  const emailKey = form.email.trim().toLowerCase();

  const getEvent = (eventId) => {
  const eventResponse = form.rsvps?.[eventId] || {};

  const attending = Boolean(eventResponse.attending);

  return {
    attending,
    adults: attending
      ? Math.max(0, Number(eventResponse.adults) || 0)
      : 0,
    kids: attending
      ? Math.max(0, Number(eventResponse.kids) || 0)
      : 0,
  };
};

  const prelude = getEvent("prelude");
  const haldi = getEvent("traditions");
  const wedding = getEvent("muhurtham");

  const payload = {
  inviteType: guest.inviteType,
  name: form.name.trim(),
  email: emailKey,
  phone: form.phone.trim(),

  preludeAttending: prelude.attending,
  preludeAdults: prelude.adults,
  preludeKids: prelude.kids,

  haldiAttending: haldi.attending,
  haldiAdults: haldi.adults,
  haldiKids: haldi.kids,

  weddingAttending: wedding.attending,
  weddingAdults: wedding.adults,
  weddingKids: wedding.kids,

  rsvps: {
    prelude,
    haldi,
    wedding,
  },

  updatedAt: serverTimestamp(),
};

  try {
  await setDoc(doc(db, "rsvps", guest.phone), payload, {
    merge: true,
  });

  const isVip = invitedEvents.some(
  (event) => event.id !== "muhurtham"
);

console.log("Guest:", guest);
console.log("Invited Events:", invitedEvents);
console.log("isVip:", invitedEvents.some(event => event.id !== "muhurtham"));

const eventDetails = isVip
  ? `
🎶 Sangeet Night
${formatEventStatus(
  payload.preludeAttending,
  payload.preludeAdults,
  payload.preludeKids
)}

🌼 Haldi & Engagement
${formatEventStatus(
  payload.haldiAttending,
  payload.haldiAdults,
  payload.haldiKids
)}

🤵👰 Wedding Ceremony
${formatEventStatus(
  payload.weddingAttending,
  payload.weddingAdults,
  payload.weddingKids
)}
`
  : `
🤵👰 Wedding Ceremony
${formatEventStatus(
  payload.weddingAttending,
  payload.weddingAdults,
  payload.weddingKids
)}
`;

const eventInformation = isVip
  ? `
🎶 Sangeet Night
📅 28 August 2026
📍 Biriyani City, Hillsborough, NJ

🌼 Haldi & Engagement
📅 29 August 2026
📍 Serene Spring Farms, Hillsborough, NJ

🤵👰 Wedding Ceremony
📅 30 August 2026
📍 Royal Albert Palace, Fords, NJ
`
  : `
🤵👰 Wedding Ceremony
📅 30 August 2026
📍 Royal Albert Palace, Fords, NJ
`;

const websiteUrl =
  `https://harineethawedding.com/?name=${encodeURIComponent(payload.name)}` +
  `&phone=${encodeURIComponent(payload.phone)}`;

console.log("Email website URL:", websiteUrl);

await emailjs.send(
  "service_ao3gy1t",
  "template_gjl4a5l",
  {
    guest_name: payload.name,
    guest_email: payload.email,
    guest_phone: payload.phone,
    event_details: eventDetails,
    event_information: eventInformation,
    website_url: websiteUrl,
  },
  "8S9vafjYNbuTwGQjx"
);

  if (payload.preludeAttending || payload.haldiAttending || payload.weddingAttending) {
    confetti();
  }
  setSubmitted(true);
} catch (error) {
  console.error("RSVP submit/email error:", error);
  alert("RSVP saved, but email may not have been sent. Please try again.");
}

};

  if (submitted) {
    const attendingAny =
      form.rsvps.prelude?.attending ||
      form.rsvps.traditions?.attending ||
      form.rsvps.muhurtham?.attending;

    return (
      <section className="section rsvp">
        <div className="rsvpCard" ref={confirmationRef} tabIndex={-1}>
          <h2>RSVP Received ❤️</h2>
          {attendingAny ? (
            <p>Thank you, {form.name}. We can’t wait to celebrate with you!</p>
          ) : (
            <>
              <p>Thank you, {form.name}. We’ll miss you at the celebration.</p>
              <p>
                Even though you won’t be with us in person, your blessings will always be part of our wedding celebrations.
              </p>
              <p>Thank you for your love and support.</p>
            </>
          )}
          <ScratchFortune message={fortuneMessage} />
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
          readOnly
          placeholder="Full Name"
          value={form.name}
          className="readonlyInput"
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
          readOnly
          placeholder="Phone Number"
          value={form.phone}
          className="readonlyInput"
        />

        {invitedEvents.map((ev) => {
  const response = form.rsvps[ev.id] || {
    attending: false,
    adults: 0,
    kids: 0,
  };

  return (
    <div className="rsvpEvent" key={ev.id}>
      <h3>
        {ev.icon} {ev.title}
      </h3>

      <div className="toggle">
        <button
          type="button"
          className={response.attending ? "active" : ""}
          onClick={() =>
            update(ev.id, {
              attending: true,
              adults: response.adults || 1,
              kids: response.kids || 0,
            })
          }
        >
          Attending
        </button>

        <button
          type="button"
          className={!response.attending ? "active muted" : ""}
          onClick={() =>
            update(ev.id, {
              attending: false,
              adults: 0,
              kids: 0,
            })
          }
        >
          Not Attending
        </button>
      </div>

      {response.attending && (
        <div className="guestCounters">
          <GuestCounter
            label="Adults"
            value={response.adults || 0}
            onDecrease={() =>
              changeGuestCount(ev.id, "adults", -1)
            }
            onIncrease={() =>
              changeGuestCount(ev.id, "adults", 1)
            }
          />

          <GuestCounter
            label="Kids"
            value={response.kids || 0}
            onDecrease={() =>
              changeGuestCount(ev.id, "kids", -1)
            }
            onIncrease={() =>
              changeGuestCount(ev.id, "kids", 1)
            }
          />
        </div>
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
function App() {
  const [guest, setGuest] = useState(() => {
    try {
      const savedGuest = localStorage.getItem("weddingGuest");
      return savedGuest ? JSON.parse(savedGuest) : null;
    } catch {
      return null;
    }
  });

  const [open, setOpen] = useState(false);
  const [restoringGuest, setRestoringGuest] = useState(true);
  const bookOpenAudioRef = useRef(null);

  
  useEffect(() => {
    const restoreGuestFromEmailLink = async () => {
      const params = new URLSearchParams(window.location.search);

      const linkedName = params.get("name")?.trim() || "";
      const linkedPhone = normalizePhone(params.get("phone") || "");

      // Normal website visit without email parameters
      if (!linkedName || linkedPhone.length !== 10) {
        setRestoringGuest(false);
        return;
      }

      try {
        const invitationRef = doc(
          db,
          "invitations",
          linkedPhone
        );

        const invitationSnap = await getDoc(invitationRef);

        let inviteType = "wedding";
        let displayName = linkedName;

        if (invitationSnap.exists()) {
          const invitationData = invitationSnap.data();
          const savedName = invitationData.name || "";

          if (namesMatch(savedName, linkedName)) {
            inviteType = "all";
            displayName = savedName || linkedName;
          }
        }

        const linkedGuest = {
          name: displayName,
          phone: linkedPhone,
          inviteType,
        };

        localStorage.setItem(
          "weddingGuest",
          JSON.stringify(linkedGuest)
        );

        setGuest(linkedGuest);

        // Open the website directly when coming from email
        setOpen(true);

        // Remove personal information from the visible URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error(
          "Unable to restore guest from email link:",
          error
        );
      } finally {
        setRestoringGuest(false);
      }
    };

    restoreGuestFromEmailLink();
  }, []);

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
      });
    } catch {
      // Ignore browser scroll errors
    }
  }, []);

  const handleGuestContinue = (guestData) => {
    localStorage.setItem(
      "weddingGuest",
      JSON.stringify(guestData)
    );

    setGuest(guestData);
  };

  const handleOpenInvitation = () => {
    setOpen(true);

    const audio = bookOpenAudioRef.current;

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  if (restoringGuest) {
    return (
      <section className="welcome">
        <p>Opening your invitation…</p>
      </section>
    );
  }

  if (!guest) {
    return (
      <InvitationAccess
        onContinue={handleGuestContinue}
      />
    );
  }

  const invitedEvents =
    guest.inviteType === "all"
      ? events
      : events.filter(
          (event) => event.id === "muhurtham"
        );

  return (
    <>
      <Welcome
        open={open}
        onOpenInvitation={handleOpenInvitation}
      />

      <Hero open={open} />
      <Countdown />
      <Story />

      <Events invitedEvents={invitedEvents} />

      <Gallery />

      <RSVP
        guest={guest}
        invitedEvents={invitedEvents}
      />

      <InfoSections />
      <Footer />
      <MusicButton opened={open} />

      <audio
        ref={bookOpenAudioRef}
        preload="auto"
        src={asset("bookopen.mp3")}
      />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
