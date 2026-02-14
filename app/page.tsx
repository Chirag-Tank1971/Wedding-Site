 "use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, easeInOut, motion } from "framer-motion";

type TimeLeft = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const galleryItems = [
  {
    src: "/gallery/gallery-1.jpg",
    alt: "Warm candid moment of the couple",
    quote: "Every love story is beautiful, but ours is my favorite.",
    author: "A & P",
  },
  {
    src: "/gallery/gallery-2.jpg",
    alt: "Hands held together with mehndi",
    quote: "Two hearts, one soul, and a lifetime of togetherness.",
    author: "With love",
  },
  {
    src: "/gallery/gallery-3.jpg",
    alt: "Traditional wedding details",
    quote: "Wrapped in traditions, surrounded by love.",
    author: "Our families",
  },
  {
    src: "/gallery/gallery-4.jpg",
    alt: "Joyful dance moment",
    quote: "Here’s to love, laughter and happily ever after.",
    author: "Forever",
  },
] as const;

const timelineEvents = [
  {
    time: "8 March 2026",
    title: "जनेऊ — A sacred thread: A joyful start",
    note: "Pooja ceremony starts at 9 am followed by lunch · Venue: At our residence, 1089, Vivekanand Nagar, Ghaziabad",
    image: "/timeline/janeu.jpg",
    accent: "#b8860b",
  },
  {
    time: "9 March 2026",
    title: "Haldi highs & happy vibes",
    note: "Timings: 11 am · Venue: At our residence · Attire: Hues of yellow",
    image: "/timeline/haldi.jpg",
    accent: "#daa520",
  },
  {
    time: "10 March 2026",
    title: "DJ night — Glitz and glam",
    note: "DJ night 7 pm onwards",
    image: "/timeline/dj-night.jpg",
    accent: "#8b4789",
  },
  {
    time: "11 March 2026",
    title: "Wedding and vows",
    note: "Venue: Crystal Hall, The Continental by Red Carpet, Raj Nagar Extension, Ghaziabad",
    image: "/timeline/wedding.jpg",
    accent: "#c9a15d",
  },
];

type LocationKey = "wedding" | "residence";

// Countdown to the main wedding day (11 March 2026, Ghaziabad)
const targetDate = new Date("2026-03-11T00:00:00+05:30");

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeInOut },
  },
};

const galleryItemVariants = {
  hidden: () => ({ opacity: 0, y: 30 }),
  visible: () => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeInOut },
  }),
};

const SCRATCH_WIDTH = 260;
const SCRATCH_HEIGHT = 280;
const SCRATCH_THRESHOLD = 0.6; // 60% scratched = auto complete
const SCRATCH_BRUSH_SIZE = 32;
const THRESHOLD_CHECK_INTERVAL_MS = 280;

function ScratchIntroCard({
  onComplete,
  isClosing,
}: {
  onComplete: () => void;
  isClosing: boolean;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const completedRef = useRef(false);
  const thresholdCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReveal = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsRevealed(true);
    if (thresholdCheckRef.current) {
      clearTimeout(thresholdCheckRef.current);
      thresholdCheckRef.current = null;
    }
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  // Draw gold + glitter base layer once
  const drawBase = useRef(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(SCRATCH_WIDTH * dpr);
    const h = Math.round(SCRATCH_HEIGHT * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Gold fill
    ctx.fillStyle = "#c9a15d";
    ctx.fillRect(0, 0, w, h);
    // Glitter: light dots overlay
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff";
    const step = 12;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const jitter = (x + y) % 3;
        ctx.beginPath();
        ctx.arc(x + (jitter - 1) * 2, y + (jitter % 2) * 2, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });

  const getScratchedRatio = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let transparent = 0;
      const total = (data.length / 4) | 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 128) transparent++;
      }
      return total > 0 ? transparent / total : 0;
    } catch {
      return 0;
    }
  };

  const scheduleThresholdCheck = () => {
    if (thresholdCheckRef.current) return;
    thresholdCheckRef.current = setTimeout(() => {
      thresholdCheckRef.current = null;
      if (completedRef.current) return;
      if (getScratchedRatio() >= SCRATCH_THRESHOLD) {
        handleReveal();
      }
    }, THRESHOLD_CHECK_INTERVAL_MS);
  };

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const drawStroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const brush = SCRATCH_BRUSH_SIZE * dpr;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = brush * 0.4;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (isRevealed || completedRef.current) return;
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;
    isDrawingRef.current = true;
    lastPosRef.current = point;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || !lastPosRef.current || isRevealed) return;
    e.preventDefault();
    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;
    drawStroke(lastPosRef.current, point);
    lastPosRef.current = point;
    scheduleThresholdCheck();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    isDrawingRef.current = false;
    lastPosRef.current = null;
    scheduleThresholdCheck();
  };

  const onPointerLeave = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    scheduleThresholdCheck();
  };

  useEffect(() => {
    drawBase.current();
  }, []);

  return (
    <motion.div
      className="mobile-intro-card mobile-intro-card--scratch"
      initial={{ scale: 1.05, y: 20, opacity: 0 }}
      animate={
        isClosing
          ? { scale: 1.02, y: -20, opacity: 0 }
          : { scale: 1, y: 0, opacity: 1 }
      }
      transition={{ duration: 0.8, ease: easeInOut }}
    >
      <p className="scratch-intro-hint">Scratch to reveal</p>
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="scratch-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5 0.92 C0.25 0.65 0 0.42 0 0.26 C0 0.08 0.14 0 0.5 0.22 C0.86 0 1 0.08 1 0.26 C1 0.42 0.75 0.65 0.5 0.92 Z" />
          </clipPath>
        </defs>
      </svg>
      <div
        className="scratch-container scratch-container--heart"
        style={{ width: SCRATCH_WIDTH, height: SCRATCH_HEIGHT, touchAction: "none" }}
      >
        <div className="scratch-reveal" aria-hidden="true">
          <span className="scratch-save-the-date">Save the date</span>
          <span className="scratch-date">8–11 March 2026</span>
        </div>

        <motion.div
          className="scratch-canvas-wrap"
          initial={{ opacity: 1 }}
          animate={isRevealed ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ pointerEvents: isRevealed ? "none" : "auto" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          onPointerCancel={onPointerUp}
        >
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            width={SCRATCH_WIDTH}
            height={SCRATCH_HEIGHT}
            style={{ width: SCRATCH_WIDTH, height: SCRATCH_HEIGHT }}
            aria-hidden
          />
        </motion.div>
      </div>

      <motion.div
        className="scratch-names-wrap"
        initial={{ opacity: 0, y: 6 }}
        animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="scratch-place">Aadarsh &amp; Pragya</div>
      </motion.div>

      <motion.div
        className="scratch-cta-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeInOut, delay: 0.3 }}
      >
        <button
          type="button"
          className="mobile-intro-button"
          onClick={handleReveal}
          disabled={isRevealed}
        >
          {isRevealed ? "Proceeding..." : "Tap to reveal"}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroClosing, setIsIntroClosing] = useState(false);
  const [activeLocation, setActiveLocation] = useState<LocationKey>("wedding");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showRsvpThanks, setShowRsvpThanks] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {
          // ignore play errors
        });
    }
  };

  useEffect(() => {
    // Detect mobile viewport and only show the intro animation there
    const detectMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowIntro(false);
      }
    };

    detectMobile();
    window.addEventListener("resize", detectMobile);

    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60),
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad = (v: number) => v.toString().padStart(2, "0");

      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      {/* Background music (place your track as /public/music.mp3) */}
      <audio ref={audioRef} src="/music.mp3" loop />
      {/* MOBILE OPENING INTRO — heart-shaped scratch, Save the date + date */}
      <AnimatePresence>
        {isMobile && showIntro && (
          <motion.div
            className="mobile-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeInOut }}
          >
            <ScratchIntroCard
              isClosing={isIntroClosing}
              onComplete={() => {
                setIsIntroClosing(true);
                if (audioRef.current) {
                  audioRef.current
                    .play()
                    .then(() => setIsMusicPlaying(true))
                    .catch(() => {});
                }
                setTimeout(() => {
                  setShowIntro(false);
                  setIsIntroClosing(false);
                }, 750);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <header className="hero">
        <div className="container">
          <motion.div
            className="hero-inner"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="hero-date">8–11 March 2026 • Ghaziabad</div>
            <div className="hero-names">Aadarsh &amp; Pragya</div>
            <div className="hero-place">Crystal Hall, Raj Nagar Extension</div>
            <p className="hero-tagline">
              With the blessings of our families, we invite you to join us in
              celebrating four days of love, traditions, music and memories in
              Ghaziabad.
            </p>
            <div className="hero-cta">
              <a href="#rsvp" className="btn-primary">
                Discover the details &amp; RSVP
              </a>
              <div className="hero-subtle">
                Let&apos;s celebrate the start of forever together
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* INTRO */}
      <section className="intro">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="eyebrow">Dear friends &amp; family</div>
            <h2>We are inviting you to our wedding</h2>
            <div className="divider" />
          </motion.div>
          <motion.p
            className="intro-text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={1}
          >
            With joyful hearts, we invite you to join us as we celebrate our
            love and commitment to one another on our special day. Your
            presence means the world to us, and we cannot wait to share this
            unforgettable moment with you.
          </motion.p>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section id="countdown" className="countdown">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
          >
            <div className="eyebrow">The event starts in</div>
            <h2>Countdown to 11 March 2026</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="countdown-wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={1}
          >
            <div className="countdown-grid">
              <CountdownBox label="Days" value={timeLeft.days} />
              <CountdownBox label="Hours" value={timeLeft.hours} />
              <CountdownBox label="Minutes" value={timeLeft.minutes} />
              <CountdownBox label="Seconds" value={timeLeft.seconds} />
            </div>
            <p className="countdown-note">
              Mark your calendars — celebrations begin on 8 March 2026 and
              culminate with the wedding and vows on 11 March 2026.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAMILY */}
      <section>
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
          >
            <div className="eyebrow">With blessings of</div>
            <h2>Our parents</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="two-column"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" },
              },
            }}
          >
            <div className="card">
              <div className="tag">Groom&apos;s family</div>
              <h3>Aadarsh</h3>
              <p>
                Son of <strong>Mr. Ashok Kumar Tripathi</strong> &amp;{" "}
                <strong>Mrs. Veena Tripathi</strong>.
              </p>
            </div>

            <div className="card">
              <div className="tag">Bride&apos;s family</div>
              <h3>Pragya</h3>
              <p>
                Daughter of <strong>Mr. Kripa Shankar Pandey</strong> &amp;{" "}
                <strong>Mrs. Prem Lata Pandey</strong>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* EVENTS TIMELINE */}
      <section className="timeline">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
          >
            <div className="eyebrow">Wedding celebrations</div>
            <h2>Event timeline</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="timeline-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {timelineEvents.map((event) => (
              <TimelineEventCard
                key={event.time}
                time={event.time}
                title={event.title}
                note={event.note}
                image={event.image}
                accent={event.accent}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* GALLERY */}
      <GallerySection />

      {/* DRESS CODE & LOCATION */}
      <section>
        <div className="container">
          <div className="two-column">
            <motion.div
              className="card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              custom={0}
            >
              <div className="tag">Dress code</div>
              <h3>Celebratory Indian attire</h3>
              <p>
                Join us in vibrant, traditional Indian outfits. For the Haldi
                ceremony, we warmly invite you to wear beautiful{" "}
                <strong>hues of yellow</strong>.
              </p>
            </motion.div>

            <motion.div
              className="card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              custom={1}
            >
              <div className="tag">Locations</div>
              <h3>How to reach us</h3>

              <div className="map-toggle">
                <button
                  type="button"
                  className={
                    activeLocation === "wedding"
                      ? "map-toggle-btn map-toggle-btn-active"
                      : "map-toggle-btn"
                  }
                  onClick={() => setActiveLocation("wedding")}
                >
                  Wedding venue
                </button>
                <button
                  type="button"
                  className={
                    activeLocation === "residence"
                      ? "map-toggle-btn map-toggle-btn-active"
                      : "map-toggle-btn"
                  }
                  onClick={() => setActiveLocation("residence")}
                >
                  Residence (जनेऊ / Haldi)
                </button>
              </div>

              {activeLocation === "wedding" ? (
                <>
                  <div className="location-name">Crystal Hall</div>
                  <div className="location-name">
                    The Continental by Red Carpet
                  </div>
                  <div className="location-address">
                    Raj Nagar Extension, Ghaziabad
                  </div>
                  <a
                    className="muted-link"
                    href="https://maps.google.com/?q=Crystal+Hall+The+Continental+by+Red+Carpet+Raj+Nagar+Extension+Ghaziabad"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                  <div className="map-wrapper">
                    <iframe
                      src="https://www.google.com/maps?q=Crystal+Hall+The+Continental+by+Red+Carpet+Raj+Nagar+Extension+Ghaziabad&output=embed"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{ width: "100%", height: "320px", border: 0 }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="location-name">Our residence</div>
                  <div className="location-address">
                    1089, Vivekanand Nagar, Ghaziabad
                  </div>
                  <p className="location-note">
                    जनेऊ and Haldi ceremonies will be held here as mentioned in
                    the schedule.
                  </p>
                  <a
                    className="muted-link"
                    href="https://www.google.com/maps/search/?api=1&query=1089,+Vivekanand+Nagar,+Ghaziabad"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                  <div className="map-wrapper">
                    <iframe
                      src="https://www.google.com/maps?q=1089,+Vivekanand+Nagar,+Ghaziabad&output=embed"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{ width: "100%", height: "320px", border: 0 }}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ORGANIZATIONAL / PLANNER */}
      {/* (Planner / FAQ sections intentionally omitted to avoid incorrect details) */}

      {/* RSVP */}
      <section id="rsvp" className="rsvp">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
          >
            <div className="eyebrow">Please confirm your presence</div>
            <h2>RSVP</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="rsvp-inner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={1}
          >
            <p>
              Kindly let us know how many of you will join and which celebrations
              you&apos;ll be a part of, so we can plan the food, music and
              memories just right.
            </p>
            <div className="rsvp-deadline">RSVP FORM</div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                
                // Collect form data
                const formData = new FormData(form);
                const name = formData.get("name") as string;
                const attending = formData.get("attending") as string;
                const wishes = formData.get("wishes") as string;
                
                // Collect events checkboxes
                const events = Array.from(formData.getAll("events")) as string[];
                
                // Collect fun checkboxes
                const fun = Array.from(formData.getAll("fun")) as string[];

                try {
                  // Send to API route
                  const response = await fetch("/api/rsvp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      attending,
                      events,
                      fun,
                      wishes: wishes || undefined,
                    }),
                  });

                  if (response.ok) {
                    // Show success modal
                    form.reset();
                    setShowRsvpThanks(true);
                  } else {
                    alert("Failed to submit RSVP. Please try again.");
                  }
                } catch (error) {
                  console.error("RSVP submission error:", error);
                  alert("Error submitting RSVP. Please try again.");
                }
              }}
            >
              <div>
                <label htmlFor="name">Your name *</label>
                <input id="name" name="name" required />
              </div>

              <div>
                <label htmlFor="attending">Will you come? *</label>
                <select id="attending" name="attending" required>
                  <option value="">Select an option</option>
                  <option value="yes">Yes, I will</option>
                  <option value="no">Unfortunately, I can not :(</option>
                  <option value="later">I will tell you a bit later</option>
                </select>
              </div>


              <div>
                <label>Which events are you most likely to attend?</label>
                <div className="checkbox-list">
                  <label className="checkbox-pill">
                    <input type="checkbox" name="events" value="janeu" />
                    जनेऊ
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" name="events" value="haldi" />
                    Haldi
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" name="events" value="dj-night" />
                    DJ night
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" name="events" value="wedding" />
                    Wedding &amp; vows
                  </label>
                </div>
              </div>

              <div>
                <label>Fun question: what are you most excited about?</label>
                <div className="checkbox-list">
                  <label className="checkbox-pill">
                    <input type="checkbox" name="fun" value="dance" />
                    Dancing till the DJ stops
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" name="fun" value="food" />
                    Unlimited food &amp; desserts
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" name="fun" value="photos" />
                    Getting clicked in my best outfit
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" name="fun" value="family" />
                    Meeting everyone after so long
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="wishes">
                  Any special wishes or blessings for the couple?
                </label>
                <textarea id="wishes" name="wishes" placeholder="Share your heartfelt wishes..." />
              </div>

              <button type="submit" className="btn-submit">
                Submit RSVP
              </button>
              <div className="small-note">
                Prefer confirming over a call? RSVP with{" "}
                <strong>Mr. Ashok Kumar Tripathi</strong> (97177 74567) or{" "}
                <strong>Mrs. Veena Tripathi</strong> (+91 70489 82783).
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* RSVP success modal */}
      <AnimatePresence>
        {showRsvpThanks && (
          <motion.div
            className="rsvp-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeInOut }}
            onClick={() => setShowRsvpThanks(false)}
          >
            <motion.div
              className="rsvp-modal"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.3, ease: easeInOut }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="rsvp-modal-pill">RSVP received</div>
              <h3 className="rsvp-modal-title">Thank you for your response</h3>
              <p className="rsvp-modal-text">
                We&apos;re so happy you&apos;ll be a part of our celebrations.
                Your RSVP has been noted — see you on the dance floor!
              </p>
              <button
                type="button"
                className="rsvp-modal-button"
                onClick={() => setShowRsvpThanks(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music toggle (bottom-right) — portaled to body so it stays above intro/overlays */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <button
            type="button"
            className="music-toggle"
            onClick={toggleMusic}
            aria-label={isMusicPlaying ? "Mute background music" : "Play background music"}
          >
            <span className="music-toggle-icon" aria-hidden="true">
              {isMusicPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 9v6h4l5 4V5L8 9H4z"
                    fill="currentColor"
                  />
                  <path
                    d="M16.5 8.11a4 4 0 0 1 0 7.78"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 5.5a7 7 0 0 1 0 13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 9v6h4l5 4V5L8 9H4z"
                    fill="currentColor"
                  />
                  <path
                    d="M18 9l-3 3 3 3M21 9l-3 3 3 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
          </button>,
          document.body
        )}

      <footer>
        Hope to see you
        <br />
        With love — Aadarsh &amp; Pragya
      </footer>
    </div>
  );
}

function CountdownBox({ label, value }: { label: string; value: string }) {
  return (
    <motion.div className="count-box" variants={fadeInUp} custom={Math.random()}>
      <div className="count-value">{value}</div>
      <div className="count-label">{label}</div>
    </motion.div>
  );
}

const FALLBACK_TIMELINE_IMAGE = "/timeline-intro.jpg";

function TimelineEventCard({
  time,
  title,
  note,
  image,
  accent,
}: {
  time: string;
  title: string;
  note: string;
  image: string;
  accent: string;
}) {
  const [imgSrc, setImgSrc] = useState(image);
  const handleImageError = () => setImgSrc(FALLBACK_TIMELINE_IMAGE);

  return (
    <motion.div
      className="timeline-event-card"
      variants={fadeInUp}
      style={{ "--timeline-accent": accent } as React.CSSProperties}
    >
      <div className="timeline-event-card-image-wrap">
        <img
          src={imgSrc}
          alt=""
          className="timeline-event-card-image"
          loading="lazy"
          onError={handleImageError}
        />
        <div
          className="timeline-event-card-overlay"
          style={{ "--timeline-accent": accent } as React.CSSProperties}
        />
        <div className="timeline-event-card-content">
          <div className="timeline-event-card-date">{time}</div>
          <h3 className="timeline-event-card-title">{title}</h3>
          <p className="timeline-event-card-note">{note}</p>
        </div>
      </div>
    </motion.div>
  );
}

function GallerySection() {
  return (
    <section className="gallery">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="eyebrow">Captured moments</div>
          <h2>Love in small frames</h2>
          <div className="divider" />
        </motion.div>

        <motion.div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <motion.figure
              key={item.src}
              className="gallery-item"
              variants={galleryItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              whileHover={{ y: -8, scale: 1.03, rotate: -1.5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="gallery-image"
                  loading="lazy"
                />
                <div className="gallery-overlay">
                  <p className="gallery-quote">“{item.quote}”</p>
                  <p className="gallery-quote-author">— {item.author}</p>
                </div>
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// (FAQ component removed for now to avoid hard-coding details that may not apply)
