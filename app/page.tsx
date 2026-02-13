 "use client";

import { useEffect, useRef, useState } from "react";
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
  // Simple fade + slide-up, no left/right tilt so it can't
  // visually interfere with other fixed elements like the mute button.
  hidden: () => ({
    opacity: 0,
    y: 30,
  }),
  visible: () => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeInOut,
    },
  }),
};

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroClosing, setIsIntroClosing] = useState(false);
  const [activeLocation, setActiveLocation] = useState<LocationKey>("wedding");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showRsvpThanks, setShowRsvpThanks] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
      {/* MOBILE OPENING INTRO (only on small screens) */}
      <AnimatePresence>
        {isMobile && showIntro && (
          <motion.div
            className="mobile-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeInOut }}
          >
            <motion.div
              className="mobile-intro-card"
              initial={{ scale: 1.05, y: 20, opacity: 0 }}
              animate={
                isIntroClosing
                  ? { scale: 1.02, y: -20, opacity: 0 }
                  : { scale: 1, y: 0, opacity: 1 }
              }
              transition={{ duration: 0.8, ease: easeInOut }}
            >
              <div className="mobile-intro-circle">
                <motion.div
                  className="mobile-intro-half mobile-intro-half-left"
                  animate={
                    isIntroClosing
                      ? { x: "-100%" }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.7, ease: easeInOut }}
                />
                <motion.div
                  className="mobile-intro-half mobile-intro-half-right"
                  animate={
                    isIntroClosing
                      ? { x: "100%" }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.7, ease: easeInOut }}
                />
                <div className="mobile-intro-circle-inner">
                  <div className="mobile-intro-subtitle">
                    8–11 March 2026 · Ghaziabad
                  </div>
                  <div className="mobile-intro-names">Aadarsh &amp; Pragya</div>
                  <div className="mobile-intro-text">
                    invite you to join them in romance…
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mobile-intro-button"
                onClick={() => {
                  setIsIntroClosing(true);
                  // Start background music on user interaction
                  if (audioRef.current) {
                    audioRef.current
                      .play()
                      .then(() => setIsMusicPlaying(true))
                      .catch(() => {
                        // ignore autoplay issues
                      });
                  }
                  setTimeout(() => {
                    setShowIntro(false);
                    setIsIntroClosing(false);
                  }, 750);
                }}
              >
                Discover the details
              </button>
            </motion.div>
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
            className="timeline-intro-image"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src="/timeline-intro.jpg"
              alt="A warm moment setting the mood for the celebrations"
              loading="lazy"
            />
          </motion.div>

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
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            <TimelineItem
              time="8 March 2026"
              title="जनेऊ — A sacred thread: A joyful start"
              note="Pooja ceremony starts at 9 am followed by lunch · Venue: At our residence, 1089, Vivekanand Nagar, Ghaziabad"
            />
            <TimelineItem
              time="9 March 2026"
              title="Haldi highs &amp; happy vibes"
              note="Timings: 11 am · Venue: At our residence · Attire: Hues of yellow"
            />
            <TimelineItem
              time="10 March 2026"
              title="DJ night — Glitz and glam"
              note="DJ night 7 pm onwards"
            />
            <TimelineItem
              time="11 March 2026"
              title="Wedding and vows"
              note="Venue: Crystal Hall, The Continental by Red Carpet, Raj Nagar Extension, Ghaziabad"
            />
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
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                form.reset();
                setShowRsvpThanks(true);
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
                <label htmlFor="diet">
                  Do you have any food intolerances or allergies?
                </label>
                <textarea id="diet" name="diet" placeholder="Optional" />
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

      {/* Music toggle (bottom-right) */}
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
      </button>

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

function TimelineItem({
  time,
  title,
  note,
}: {
  time: string;
  title: string;
  note?: string;
}) {
  return (
    <motion.div className="timeline-item" variants={fadeInUp}>
      <div className="timeline-dot" />
      <div className="timeline-time">{time}</div>
      <div className="timeline-title">{title}</div>
      {note && <div className="timeline-note">{note}</div>}
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
