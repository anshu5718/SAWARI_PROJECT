import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../img/hero-bg.png';

function Home() {
  return (
    <main
      className="min-h-screen text-[#f0ede8] flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Hero — always dark, never changes with theme ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center w-full overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 w-full"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 60%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Dark overlay — always dark */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 60%, rgba(15,15,15,1) 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className="text-xs uppercase tracking-[0.18em] mb-6 flex items-center gap-2"
            style={{ color: "#e8c84a" }}
          >
            <span style={{ display: "inline-block", width: 24, height: 1, background: "#e8c84a" }} />
            Book a vehicle. Bring a driver. Explore Nepal.
            <span style={{ display: "inline-block", width: 24, height: 1, background: "#e8c84a" }} />
          </div>

          <h1
            className="font-bold leading-none tracking-tight mb-6"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(3rem, 10vw, 7rem)",
              letterSpacing: "-0.04em",
              color: '#ffffff',
            }}
          >
            Your trip,<br />
            <span style={{ color: "#e8c84a", fontStyle: "italic" }}>our wheels</span>
          </h1>

          <p className="text-base max-w-md leading-relaxed mb-10" style={{ color: '#aaaaaa' }}>
            Sawari makes it easy to book a vehicle with a driver for your next tour —
            whether it's a family trip to Pokhara, a mountain escape, or a cross-city journey.
            Just pick your vehicle, set your dates, and go.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg text-sm font-medium text-black transition-all hover:-translate-y-0.5"
              style={{ background: "#e8c84a" }}
            >
              Plan your trip
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg text-sm border transition-all"
              style={{ color: '#cccccc', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Become a driver →
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs uppercase tracking-widest text-[#f0ede8]">Scroll</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f0ede8" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ── Stats strip — theme-aware ── */}
      <div
        className="border-t border-b grid grid-cols-3 max-w-3xl mx-auto w-full"
        style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        {[
          { num: "Driver included", label: "Every booking" },
          { num: "Cars to buses",   label: "All vehicle types" },
          { num: "Anywhere",        label: "Across Nepal" },
        ].map(({ num, label }) => (
          <div
            key={label}
            className="py-8 px-6 text-center border-r last:border-r-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}
            >
              {num}
            </div>
            <div
              className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── About section — theme-aware ── */}
      <section
        className="max-w-3xl mx-auto w-full px-6 py-16 grid md:grid-cols-2 gap-6"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* About card */}
        <div
          className="border rounded-xl p-6"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            About Sawari
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Sawari means "ride" — and that's exactly what we deliver. We connect
            travellers with trusted drivers and vehicles across Nepal, so you can
            focus on the journey, not the logistics.
          </p>
        </div>

        {/* For travellers card */}
        <div
          className="border rounded-xl p-6"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            For travellers
          </p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Browse available vehicles, choose your travel dates, tell us where
            you're headed — and we'll handle the rest. No haggling, no stress,
            just your next adventure.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-medium px-4 py-2 rounded-lg text-black transition-all hover:opacity-90"
            style={{ background: "#e8c84a" }}
          >
            Start exploring
          </Link>
        </div>

        {/* For drivers card — always dark green, intentional brand block */}
        <div
          className="rounded-xl p-6 md:col-span-2 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: '#0a1400', border: '1px solid #1e2e1e' }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#3a6a2a' }}>
              For drivers & owners
            </p>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: '#668855' }}>
              Got a vehicle? Turn it into a tour business. List your vehicle on Sawari,
              accept booking requests, and take travellers to their destinations —
              on your schedule, at your price.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
