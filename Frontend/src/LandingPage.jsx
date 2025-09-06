// LandingPage.jsx
import React, { useRef } from "react";
import Signup from "./Signup";
import "./Landingpage.css";

export default function LandingPage() {
  const signupRef = useRef(null);

  const scrollToSignup = () => {
    if (signupRef.current) {
      signupRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // focus the input inside signup after scroll
      setTimeout(() => {
        const el = signupRef.current.querySelector("input");
        if (el) el.focus({ preventScroll: true });
      }, 500);
    }
  };

  return (
    <div className="w-full min-h-screen text-white font-sans bg-gradient-to-b from-[#071025] via-[#071025] to-[#071025]">
      <Navbar onGetStarted={scrollToSignup} />
      <Hero onGetStarted={scrollToSignup} />

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Features */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">
            Why GemiSeek?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Feature
              title="Fast Answers"
              desc="Get concise, reliable answers in seconds — optimized for developers and creators."
            />
            <Feature
              title="Voice-Assistant"
              desc="We respond to voice commands instantly — fast, reliable, and secure."
            />
            <Feature
              title="Contextual Chat"
              desc="Maintain context across messages so your conversations stay coherent."
            />
            <Feature
              title="Privacy-first"
              desc="We use secure sign-in methods and keep your data private and safe."
            />
          </div>
        </section>
      </main>

      {/* Signup section at bottom */}
      <section
        ref={signupRef}
        className="w-full py-16 px-4 flex justify-center border-t border-white/6"
      >
        <div className="w-full max-w-md">
          <h3 className="text-center text-2xl font-bold mb-6">
            Join <span className="text-blue-400">GemiSeek</span>
          </h3>
          {/* Signup card: subtle, matches background */}
          <div className="p-6 rounded-xl border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] backdrop-blur-sm">
            <Signup />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="p-10 rounded-xl border border-white/6 bg-white/4">
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-slate-300 text-sm">{desc}</p>
    </div>
  );
}

const Navbar = ({ onGetStarted }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-transparent p-6">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="text-lg font-bold">GemiSeek</div>
      <div className="flex items-center gap-3">
        <button
          onClick={onGetStarted}
          className="hidden md:inline-block bg-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
        >
          Get started
        </button>
      </div>
    </div>
  </header>
);

const Hero = ({ onGetStarted }) => {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-4 pt-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Get started with <span className="text-blue-400">GemiSeek</span>
        </h1>
        <p className="text-slate-300 mb-8">
          Smart AI chat, faster answers — built for you.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-white"
          >
            Get started
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="mt-24 py-8 text-center text-slate-400">
    <div className="max-w-7xl mx-auto px-4">
      © {new Date().getFullYear()} GemiSeek
    </div>
  </footer>
);
