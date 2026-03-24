import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A1A] overflow-hidden">
      {/* Animated background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-transparent to-slate-950/90" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">VoteSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center pt-16 pb-12">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-10 animate-fade-in">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-indigo-300 text-xs font-medium tracking-wide">Powered by Ethereum Blockchain</span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tight animate-slide-up"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Voting That
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 mt-4 pb-3">
            Cannot Be Rigged
            </span>
        </h1>

        {/* Subheading */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed animate-fade-in">
          Every vote is a blockchain transaction. Transparent, tamper-proof, and verifiable by anyone.
          Built on Ethereum so your voice is permanent.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 animate-fade-in">
          <button
            onClick={() => navigate("/login")}
            className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Go to Voting System
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 font-medium px-8 py-4 rounded-xl transition-all"
          >
            Create Account
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-10 mb-4 animate-fade-in">
          {[
            { label: "Tamper Proof", icon: "🔒" },
            { label: "Transparent", icon: "🔍" },
            { label: "Decentralized", icon: "⛓️" },
            { label: "Instant Results", icon: "⚡" }
          ].map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{icon}</span>
              <span className="text-slate-400 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🗳️",
              title: "Cast Your Vote",
              desc: "Select your candidate and confirm with MetaMask. Your vote is recorded on Ethereum instantly."
            },
            {
              icon: "🔗",
              title: "Blockchain Verified",
              desc: "Every vote gets a unique transaction hash. Anyone can verify votes on the public blockchain."
            },
            {
              icon: "📊",
              title: "Live Results",
              desc: "Watch results update in real time with charts and statistics as votes are counted."
            }
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-white font-semibold mb-3 text-sm">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-10">
        <p className="text-slate-600 text-xs">
          VoteChain — Decentralized Voting on Ethereum · Built with React & Solidity
        </p>
      </div>
    </div>
  );
}