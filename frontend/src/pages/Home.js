import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../img/hero-bg.png';

function Home() {
  return (
    <main
      className="min-h-screen  text-[#f0ede8] flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero Section with background image */}
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
        {/* Dark overlay */}
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
            }}
          >
            Your trip,<br />
            <span style={{ color: "#e8c84a", fontStyle: "italic" }}>our wheels</span>
          </h1>

          <p className="text-[#aaa] text-base max-w-md leading-relaxed mb-10">
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
              className="px-6 py-3 rounded-lg text-sm text-[#ccc] border border-[#ffffff33] hover:border-[#ffffff66] hover:text-white transition-all"
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

      {/* Stats strip */}
      <div className="border-t border-b border-[#1e1e1e] grid grid-cols-3 max-w-3xl mx-auto w-full">
        {[
          { num: "Driver included",  label: "Every booking" },
          { num: "Cars to buses",    label: "All vehicle types" },
          { num: "Anywhere",         label: "Across Nepal" },
        ].map(({ num, label }) => (
          <div key={label} className="py-8 px-6 text-center border-r border-[#1e1e1e] last:border-r-0">
            <div
              className="text-2xl font-bold tracking-tight text-[#f0ede8] mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {num}
            </div>
            <div className="text-xs uppercase tracking-widest text-[#444]">{label}</div>
          </div>
        ))}
      </div>

      {/* About section */}
      <section className="max-w-3xl mx-auto w-full px-6 py-16 grid md:grid-cols-2 gap-6">

        {/* About card */}
        <div className=" border border-[#1e1e1e] rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-[#444] mb-4">About Sawari</p>
          <p className="text-[#888] text-sm leading-relaxed">
            Sawari means "ride" — and that's exactly what we deliver. We connect
            travellers with trusted drivers and vehicles across Nepal, so you can
            focus on the journey, not the logistics.
          </p>
        </div>

        {/* For travellers card */}
        <div className=" border border-[#1e1e1e] rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-[#444] mb-4">For travellers</p>
          <p className="text-[#888] text-sm leading-relaxed mb-6">
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

        {/* For drivers card — full width */}
        <div className="bg-[#0a1400] border border-[#1e2e1e] rounded-xl p-6 md:col-span-2 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#3a6a2a] mb-2">For drivers & owners</p>
            <p className="text-[#668855] text-sm leading-relaxed max-w-md">
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
