import React, { useState, useEffect, useMemo } from "react";
import {
  Sprout, Wheat, TrendingUp, ShieldCheck, FileSignature, Bell,
  Users, MapPin, ChevronRight, Menu, X, LayoutDashboard, LogOut,
  Plus, Search, CheckCircle2, Circle, Clock, IndianRupee, ArrowRight,
  BarChart3, Handshake, AlertTriangle, Settings, Star, ArrowLeft,
  Smartphone, KeyRound, RotateCcw, Lock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  night: "#122019",       // deep field-at-dusk background
  nightSoft: "#1B2C22",   // panel on dark
  paper: "#F4EEDE",       // ledger parchment for contract cards
  paperDim: "#EAE2CC",
  ink: "#1C1B15",         // near-black ink text on paper
  cream: "#F7F3E7",
  gold: "#D2A23A",        // turmeric — sole accent
  goldDeep: "#A97C1F",
  rust: "#9A4B26",        // dried-chili rust, secondary
  green: "#3B6B44",       // crop green
  greenDeep: "#274C31",
  line: "rgba(244,238,222,0.14)",
  muted: "rgba(244,238,222,0.62)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.font-display{font-family:'Fraunces',serif;}
.font-body{font-family:'Inter',sans-serif;}
.font-mono{font-family:'IBM Plex Mono',monospace;}
`;

/* ============================== MOCK DATA ============================== */
const CROPS = [
  { name: "Paddy", unit: "quintal", msp: 2320, market: 2540 },
  { name: "Turmeric", unit: "quintal", msp: 15200, market: 16850 },
  { name: "Sugarcane", unit: "tonne", msp: 3150, market: 3400 },
  { name: "Cotton", unit: "quintal", msp: 7020, market: 7480 },
  { name: "Tomato", unit: "quintal", msp: 1400, market: 1980 },
];

const PRICE_HISTORY = [
  { month: "Feb", locked: 2320, mandi: 2180 },
  { month: "Mar", locked: 2320, mandi: 2260 },
  { month: "Apr", locked: 2320, mandi: 2410 },
  { month: "May", locked: 2320, mandi: 2390 },
  { month: "Jun", locked: 2320, mandi: 2480 },
  { month: "Jul", locked: 2320, mandi: 2540 },
];

const STAGES = ["Proposed", "Negotiated", "Signed", "Sowing", "Growing", "Harvest", "Delivered", "Payment Settled"];

const INITIAL_CONTRACTS = [
  {
    id: "CF-2026-0142", crop: "Paddy", farmer: "K. Muthukumar", village: "Thanjavur, TN",
    buyer: "SouthGrain Mills Pvt. Ltd.", quantity: 40, unit: "quintal",
    lockedPrice: 2320, marketPrice: 2540, stageIndex: 4, signedDate: "2026-04-02",
    deliveryWindow: "Aug 2026",
  },
  {
    id: "CF-2026-0187", crop: "Turmeric", farmer: "R. Selvi", village: "Erode, TN",
    buyer: "Spicewell Exports", quantity: 12, unit: "quintal",
    lockedPrice: 15200, marketPrice: 16850, stageIndex: 6, signedDate: "2026-03-18",
    deliveryWindow: "Jul 2026",
  },
  {
    id: "CF-2026-0210", crop: "Cotton", farmer: "P. Arivazhagan", village: "Coimbatore, TN",
    buyer: "Anna Textile Co-op", quantity: 25, unit: "quintal",
    lockedPrice: 7020, marketPrice: 7480, stageIndex: 2, signedDate: "2026-06-05",
    deliveryWindow: "Nov 2026",
  },
];

const FARMER_LISTINGS = [
  { id: 1, name: "K. Muthukumar", village: "Thanjavur, TN", crop: "Paddy", acreage: 6, rating: 4.8, expected: 2380 },
  { id: 2, name: "R. Selvi", village: "Erode, TN", crop: "Turmeric", acreage: 3, rating: 4.9, expected: 15600 },
  { id: 3, name: "P. Arivazhagan", village: "Coimbatore, TN", crop: "Cotton", acreage: 8, rating: 4.6, expected: 7150 },
  { id: 4, name: "M. Lakshmi", village: "Salem, TN", crop: "Tomato", acreage: 2, rating: 4.7, expected: 1450 },
  { id: 5, name: "S. Ganesan", village: "Madurai, TN", crop: "Sugarcane", acreage: 10, rating: 4.5, expected: 3200 },
];

// Pre-registered demo accounts, so the login flow has real credentials to check against.
const DEMO_USERS = [
  { name: "K. Muthukumar", email: "farmer@agripact.com", phone: "9000000001", password: "farmer123", role: "farmer" },
  { name: "SouthGrain Mills", email: "buyer@agripact.com", phone: "9000000002", password: "buyer123", role: "buyer" },
  { name: "Admin", email: "admin@agripact.com", phone: "9000000003", password: "admin123", role: "admin" },
];

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function maskPhone(phone) {
  if (!phone) return "";
  return phone.slice(0, 2) + "••••••" + phone.slice(-2);
}

/* ============================== SMALL PIECES ============================== */
function Logo({ dark }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div style={{
        width: 34, height: 34, borderRadius: 9, background: C.gold,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Sprout size={19} color={C.night} strokeWidth={2.4} />
      </div>
      <span className="font-display text-xl tracking-tight" style={{ color: dark ? C.cream : C.ink }}>
        AgriPact
      </span>
    </div>
  );
}

function Stamp({ size = 92 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${C.rust}`, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: "rotate(-9deg)", flexShrink: 0
    }}>
      <div style={{
        position: "absolute", inset: 5, borderRadius: "50%", border: `1px dashed ${C.rust}`
      }} />
      <div className="font-display" style={{ color: C.rust, textAlign: "center", lineHeight: 1.05 }}>
        <div style={{ fontSize: size * 0.15, fontWeight: 700, letterSpacing: 1 }}>ASSURED</div>
        <div style={{ fontSize: size * 0.09, fontWeight: 500 }}>CONTRACT</div>
      </div>
    </div>
  );
}

function StageDots({ stageIndex, compact }) {
  return (
    <div className="flex items-center w-full">
      {STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center" style={{ minWidth: compact ? 0 : 64 }}>
            <div style={{
              width: 15, height: 15, borderRadius: "50%",
              background: i <= stageIndex ? C.green : "transparent",
              border: `2px solid ${i <= stageIndex ? C.green : C.line}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {i <= stageIndex && <CheckCircle2 size={11} color={C.cream} strokeWidth={3} />}
            </div>
            {!compact && (
              <span className="font-body mt-1 text-center" style={{
                fontSize: 10, color: i <= stageIndex ? C.cream : C.muted, maxWidth: 62
              }}>{s}</span>
            )}
          </div>
          {i < STAGES.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < stageIndex ? C.green : C.line, marginBottom: compact ? 0 : 16 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function TickerStrip() {
  const row = [...CROPS, ...CROPS];
  return (
    <div style={{ background: C.greenDeep, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, overflow: "hidden" }}>
      <div className="flex items-center gap-10 py-3 px-6 font-mono" style={{ whiteSpace: "nowrap", fontSize: 13 }}>
        {row.map((c, i) => (
          <div key={i} className="flex items-center gap-2" style={{ color: C.cream }}>
            <span style={{ color: C.gold }}>{c.name.toUpperCase()}</span>
            <span>₹{c.market.toLocaleString("en-IN")}/{c.unit}</span>
            <span style={{ color: "#7FBE8C" }}>▲ vs MSP ₹{c.msp.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = "gold", full, icon: Icon, type = "button" }) {
  const base = "font-body font-semibold rounded-lg px-5 py-3 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]";
  const styles = {
    gold: { background: C.gold, color: C.night },
    outline: { background: "transparent", color: C.cream, border: `1.5px solid ${C.line}` },
    ghost: { background: "transparent", color: C.gold, padding: 0 },
    dark: { background: C.night, color: C.cream },
  };
  return (
    <button type={type} onClick={onClick} className={base + (full ? " w-full" : "")} style={styles[variant]}>
      {children}{Icon && <Icon size={17} />}
    </button>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block mb-4">
      <span className="font-body text-sm mb-1.5 block" style={{ color: C.muted }}>{label}</span>
      <input {...props} className="w-full font-body rounded-lg px-3.5 py-2.5 outline-none"
        style={{ background: C.nightSoft, border: `1.5px solid ${C.line}`, color: C.cream }} />
    </label>
  );
}

/**
 * Shared OTP verification panel.
 * `sentOtp` is the code that was "sent" to the phone — in this demo, there's no real SMS
 * gateway, so it's shown on screen labelled as a simulation, exactly like a sandboxed test
 * environment for an SMS API would.
 */
function OtpPanel({ phone, sentOtp, onResend, onVerify, onCancel, headline, subline }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const verify = () => {
    if (code.trim() === sentOtp) {
      setError("");
      onVerify();
    } else {
      setError("That code doesn't match. Check the demo OTP below and try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4" style={{ color: C.gold }}>
        <Smartphone size={18} />
        <span className="font-display text-lg">{headline}</span>
      </div>
      <p className="font-body text-sm mb-5" style={{ color: C.muted }}>
        {subline} We've sent a 4-digit code to <span className="font-mono" style={{ color: C.cream }}>{maskPhone(phone)}</span>.
      </p>

      <div className="p-3 mb-5 rounded-lg font-mono text-sm" style={{ background: C.nightSoft, border: `1px dashed ${C.goldDeep}`, color: C.gold }}>
        Demo mode — no SMS gateway is connected, so your code is: {sentOtp}
      </div>

      <Field label="Enter OTP" placeholder="4-digit code" value={code} maxLength={4}
        onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
      {error && <div className="font-body text-sm mb-4" style={{ color: C.rust }}>{error}</div>}

      <div className="flex gap-2 mb-4">
        <Btn variant="gold" full onClick={verify} icon={KeyRound}>Verify & continue</Btn>
      </div>
      <div className="flex justify-between">
        <button onClick={onCancel} className="font-body text-sm flex items-center gap-1.5" style={{ color: C.muted }}>
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onResend} className="font-body text-sm flex items-center gap-1.5" style={{ color: C.gold }}>
          <RotateCcw size={14} /> Resend code
        </button>
      </div>
    </div>
  );
}

/* ============================== NAV ============================== */
function Nav({ go, session, logout }) {
  const [open, setOpen] = useState(false);
  const links = [
    { k: "features", label: "Features" },
    { k: "how", label: "How it works" },
    { k: "prices", label: "Market prices" },
  ];
  return (
    <div className="sticky top-0 z-40" style={{ background: "rgba(18,32,25,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <button onClick={() => go("landing")}><Logo dark /></button>
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.k} href={`#${l.k}`} className="font-body text-sm" style={{ color: C.muted }}>{l.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Btn variant="outline" onClick={() => go(session.role === "farmer" ? "farmerDash" : session.role === "buyer" ? "buyerDash" : "admin")} icon={LayoutDashboard}>Dashboard</Btn>
              <Btn variant="ghost" onClick={logout}>Sign out</Btn>
            </>
          ) : (
            <>
              <Btn variant="outline" onClick={() => go("login")}>Log in</Btn>
              <Btn variant="gold" onClick={() => go("signup")} icon={ArrowRight}>Sign up</Btn>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: C.cream }}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3">
          {links.map(l => <a key={l.k} href={`#${l.k}`} style={{ color: C.muted }} className="font-body text-sm">{l.label}</a>)}
          <Btn variant="outline" onClick={() => go("login")}>Log in</Btn>
          <Btn variant="gold" onClick={() => go("signup")}>Sign up</Btn>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-24 pt-14 pb-10 px-6" style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="max-w-xs">
          <Logo dark />
          <p className="font-body text-sm mt-3" style={{ color: C.muted }}>
            A contract farming platform giving Indian farmers price certainty and giving buyers a reliable, traceable supply.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-10">
          {[
            { h: "Platform", items: ["Features", "How it works", "Market prices", "Pricing"] },
            { h: "For", items: ["Farmers", "Buyers & mills", "FPOs", "Government schemes"] },
            { h: "Company", items: ["About", "Support", "Dispute resolution", "Contact"] },
          ].map(col => (
            <div key={col.h}>
              <div className="font-body text-sm font-semibold mb-3" style={{ color: C.cream }}>{col.h}</div>
              {col.items.map(i => <div key={i} className="font-body text-sm mb-2" style={{ color: C.muted }}>{i}</div>)}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 font-body text-xs" style={{ borderTop: `1px solid ${C.line}`, color: C.muted }}>
        Mini project — Assured Contract Farming System for Stable Market Access. Built for academic demonstration.
      </div>
    </div>
  );
}

/* ============================== LANDING ============================== */
function Landing({ go }) {
  return (
    <div>
      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-14 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="font-mono text-xs mb-5 inline-block px-3 py-1 rounded-full" style={{ color: C.gold, border: `1px solid ${C.goldDeep}` }}>
            KHARIF 2026 · TAMIL NADU MANDI NETWORK
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]" style={{ color: C.cream }}>
            Sell your harvest before you sow it.
          </h1>
          <p className="font-body text-lg mt-6 max-w-md" style={{ color: C.muted }}>
            AgriPact locks a fair price between farmer and buyer before the season starts —
            so a bad market day never decides a farmer's income again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Btn variant="gold" icon={ArrowRight} onClick={() => go("signup", "farmer")}>Join as a Farmer</Btn>
            <Btn variant="outline" icon={Handshake} onClick={() => go("signup", "buyer")}>Join as a Buyer</Btn>
          </div>
          <div className="flex gap-8 mt-10">
            {[["6,400+", "assured contracts"], ["₹38 Cr", "price protected"], ["21", "districts live"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl" style={{ color: C.gold }}>{n}</div>
                <div className="font-body text-xs" style={{ color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* contract card mock */}
        <div style={{ background: C.paper, borderRadius: 16, padding: 26, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", transform: "rotate(1.5deg)" }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-xs" style={{ color: C.rust }}>CF-2026-0142</div>
              <div className="font-display text-2xl mt-1" style={{ color: C.ink }}>Paddy · 40 quintal</div>
            </div>
            <Stamp size={78} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 font-body text-sm" style={{ color: C.ink }}>
            <div><div style={{ color: "rgba(28,27,21,0.55)" }}>Farmer</div><div className="font-semibold">K. Muthukumar</div></div>
            <div><div style={{ color: "rgba(28,27,21,0.55)" }}>Buyer</div><div className="font-semibold">SouthGrain Mills</div></div>
            <div><div style={{ color: "rgba(28,27,21,0.55)" }}>Locked price</div><div className="font-semibold font-mono">₹2,320/qtl</div></div>
            <div><div style={{ color: "rgba(28,27,21,0.55)" }}>Today's mandi price</div><div className="font-semibold font-mono">₹2,540/qtl</div></div>
          </div>
          <div className="mt-6 pt-5" style={{ borderTop: `1px dashed rgba(28,27,21,0.25)` }}>
            <StageDots stageIndex={4} compact />
          </div>
        </div>
      </div>

      <TickerStrip />

      {/* HOW IT WORKS — real sequence, numbering justified */}
      <div id="how" className="max-w-6xl mx-auto px-6 pt-24">
        <div className="font-mono text-xs mb-3" style={{ color: C.gold }}>THE CONTRACT LIFECYCLE</div>
        <h2 className="font-display text-3xl md:text-4xl mb-12" style={{ color: C.cream }}>Four steps from handshake to harvest.</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "01", t: "Propose & lock price", d: "Farmer lists a crop, buyer proposes quantity and a price tied to MSP + market bonus.", icon: FileSignature },
            { n: "02", t: "Sign the contract", d: "Both parties digitally sign. Terms, delivery window and price are locked and tamper-evident.", icon: ShieldCheck },
            { n: "03", t: "Grow, tracked", d: "The contract moves through sowing, growing and harvest stages, visible to both sides.", icon: Sprout },
            { n: "04", t: "Deliver & get paid", d: "Produce is delivered against the locked price — regardless of what the mandi did that week.", icon: IndianRupee },
          ].map(s => (
            <div key={s.n} style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22 }}>
              <div className="flex justify-between items-start mb-5">
                <s.icon size={22} color={C.gold} />
                <span className="font-mono text-xs" style={{ color: C.muted }}>{s.n}</span>
              </div>
              <div className="font-display text-lg mb-2" style={{ color: C.cream }}>{s.t}</div>
              <div className="font-body text-sm" style={{ color: C.muted }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="max-w-6xl mx-auto px-6 pt-24">
        <div className="font-mono text-xs mb-3" style={{ color: C.gold }}>EVERYTHING ON THE PLATFORM</div>
        <h2 className="font-display text-3xl md:text-4xl mb-12" style={{ color: C.cream }}>Built for both sides of the contract.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, t: "Verified sign-up", d: "Role-based sign-up for farmers and buyers with basic KYC fields, so every profile on the ledger is accountable." },
            { icon: FileSignature, t: "Price lock-in contracts", d: "Contracts reference MSP as a floor, with an optional market-linked bonus, agreed before sowing." },
            { icon: BarChart3, t: "Live mandi price board", d: "Track market price against your locked price across the season with a simple comparison chart." },
            { icon: Users, t: "Farmer & buyer directory", d: "Buyers browse verified farmer listings by crop, region and acreage; farmers browse buyer demand." },
            { icon: Clock, t: "Contract lifecycle tracker", d: "Every contract moves through eight visible stages from proposal to payment settlement." },
            { icon: AlertTriangle, t: "Dispute & admin console", d: "An admin view for verifying contracts, resolving disputes and monitoring price-index health." },
            { icon: Bell, t: "Notifications", d: "Stage changes, price alerts and delivery-window reminders land in one notification feed." },
            { icon: Handshake, t: "Negotiation trail", d: "Every price and quantity revision before signing is kept on record for both parties." },
            { icon: MapPin, t: "Region-aware listings", d: "Crop listings carry village and district tags so buyers can plan logistics realistically." },
          ].map(f => (
            <div key={f.t} className="p-6" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 14 }}>
              <f.icon size={22} color={C.gold} className="mb-4" />
              <div className="font-display text-lg mb-2" style={{ color: C.cream }}>{f.t}</div>
              <div className="font-body text-sm" style={{ color: C.muted }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICES preview */}
      <div id="prices" className="max-w-6xl mx-auto px-6 pt-24">
        <div className="font-mono text-xs mb-3" style={{ color: C.gold }}>STABLE MARKET ACCESS</div>
        <h2 className="font-display text-3xl md:text-4xl mb-3" style={{ color: C.cream }}>Locked price vs. mandi price, Paddy — 2026 season.</h2>
        <p className="font-body text-sm mb-8" style={{ color: C.muted }}>
          The locked price stays flat for the farmer's protection. The mandi price is what the open market paid that month.
        </p>
        <div style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={PRICE_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="month" stroke={C.muted} fontSize={12} />
              <YAxis stroke={C.muted} fontSize={12} />
              <Tooltip contentStyle={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 8, color: C.cream }} />
              <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
              <Line type="monotone" dataKey="locked" name="Locked price" stroke={C.gold} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="mandi" name="Mandi price" stroke="#7FBE8C" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="rounded-2xl px-10 py-14 text-center" style={{ background: `linear-gradient(135deg, ${C.greenDeep}, ${C.night})`, border: `1px solid ${C.line}` }}>
          <h2 className="font-display text-3xl md:text-4xl mb-4" style={{ color: C.cream }}>Ready to lock in a fair season?</h2>
          <p className="font-body mb-8" style={{ color: C.muted }}>Sign up in a few minutes — no fees to create your profile.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Btn variant="gold" icon={ArrowRight} onClick={() => go("signup")}>Create your account</Btn>
            <Btn variant="outline" onClick={() => go("login")}>I already have one</Btn>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ============================== AUTH ============================== */
function SignUp({ go, login, defaultRole, findUser, registerUser }) {
  const [role, setRole] = useState(defaultRole || "farmer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [sentOtp, setSentOtp] = useState("");
  const [formError, setFormError] = useState("");

  const dashboardFor = (r) => r === "farmer" ? "farmerDash" : r === "buyer" ? "buyerDash" : "admin";

  const startVerification = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setFormError("Fill in your name, email, mobile number and password to continue.");
      return;
    }
    if (findUser(email)) {
      setFormError("An account with this email already exists. Try logging in instead.");
      return;
    }
    setFormError("");
    setSentOtp(generateOtp());
    setStep("otp");
  };

  const completeSignup = () => {
    const newUser = { name, email, phone, password, role };
    registerUser(newUser);
    login(newUser);
    go(dashboardFor(role));
  };

  if (step === "otp") {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <OtpPanel
          phone={phone}
          sentOtp={sentOtp}
          headline="Verify your mobile number"
          subline="This confirms the number belongs to you before your account is created."
          onResend={() => setSentOtp(generateOtp())}
          onVerify={completeSignup}
          onCancel={() => setStep("form")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <button onClick={() => go("landing")} className="font-body text-sm flex items-center gap-1.5 mb-8" style={{ color: C.muted }}>
        <ArrowLeft size={15} /> Back home
      </button>
      <h1 className="font-display text-3xl mb-2" style={{ color: C.cream }}>Create your account</h1>
      <p className="font-body text-sm mb-8" style={{ color: C.muted }}>Choose how you'll use AgriPact — this decides your dashboard.</p>

      <div className="grid grid-cols-3 gap-2 mb-7">
        {[["farmer", "Farmer", Sprout], ["buyer", "Buyer", Handshake], ["admin", "Admin", ShieldCheck]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setRole(k)} type="button"
            className="rounded-lg py-3 flex flex-col items-center gap-1.5 font-body text-xs"
            style={{
              background: role === k ? C.gold : C.nightSoft,
              color: role === k ? C.night : C.cream,
              border: `1.5px solid ${role === k ? C.gold : C.line}`
            }}>
            <Icon size={18} /> {l}
          </button>
        ))}
      </div>

      <div>
        <Field label="Full name" placeholder="e.g. K. Muthukumar" value={name} onChange={e => setName(e.target.value)} />
        <Field label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Field label="Phone number" placeholder="9000000000" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
        {role === "farmer" && <Field label="Village / district" placeholder="e.g. Thanjavur, Tamil Nadu" />}
        {role === "buyer" && <Field label="Company / mill name" placeholder="e.g. SouthGrain Mills Pvt. Ltd." />}
        <Field label="Password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
        {formError && <div className="font-body text-sm mb-4" style={{ color: C.rust }}>{formError}</div>}
        <div className="mt-2 mb-6">
          <Btn variant="gold" full onClick={startVerification} icon={Smartphone}>Verify mobile & create account</Btn>
        </div>
      </div>
      <p className="font-body text-sm text-center" style={{ color: C.muted }}>
        Already have an account?{" "}
        <button onClick={() => go("login")} style={{ color: C.gold }}>Log in</button>
      </p>
    </div>
  );
}

function Login({ go, login, users, registerUser, findUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("credentials"); // "credentials" | "createDetails" | "otp"
  const [otpMode, setOtpMode] = useState(null); // "recover" | "create"
  const [pendingUser, setPendingUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState("farmer");
  const [sentOtp, setSentOtp] = useState("");

  const dashboardFor = (r) => r === "farmer" ? "farmerDash" : r === "buyer" ? "buyerDash" : "admin";

  const attemptLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    const user = findUser(email);
    if (user && user.password === password) {
      setError("");
      login(user);
      go(dashboardFor(user.role));
      return;
    }
    if (user && user.password !== password) {
      setError("Incorrect password. Verify your mobile number to continue.");
      setOtpMode("recover");
      setPendingUser(user);
      setPhone(user.phone);
      setSentOtp(generateOtp());
      setStep("otp");
      return;
    }
    // no account with this email
    setError("No account found with this email.");
    setOtpMode("create");
    setStep("createDetails");
  };

  const sendCreateOtp = () => {
    if (!phone.trim()) return;
    setSentOtp(generateOtp());
    setStep("otp");
  };

  const finishOtp = () => {
    if (otpMode === "recover") {
      login(pendingUser);
      go(dashboardFor(pendingUser.role));
    } else {
      const newUser = { name: createName || email.split("@")[0], email, phone, password, role: createRole };
      registerUser(newUser);
      login(newUser);
      go(dashboardFor(createRole));
    }
  };

  if (step === "otp") {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <OtpPanel
          phone={phone}
          sentOtp={sentOtp}
          headline={otpMode === "recover" ? "Verify it's you" : "Verify your mobile number"}
          subline={otpMode === "recover"
            ? "Your password didn't match, so we need to confirm your identity a different way."
            : "This confirms the number belongs to you before your account is created."}
          onResend={() => setSentOtp(generateOtp())}
          onVerify={finishOtp}
          onCancel={() => setStep(otpMode === "recover" ? "credentials" : "createDetails")}
        />
      </div>
    );
  }

  if (step === "createDetails") {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <button onClick={() => setStep("credentials")} className="font-body text-sm flex items-center gap-1.5 mb-8" style={{ color: C.muted }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 className="font-display text-3xl mb-2" style={{ color: C.cream }}>No account yet</h1>
        <p className="font-body text-sm mb-8" style={{ color: C.muted }}>
          We couldn't find an account for <span style={{ color: C.cream }}>{email}</span>. Verify your mobile number to create one.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[["farmer", "Farmer", Sprout], ["buyer", "Buyer", Handshake], ["admin", "Admin", ShieldCheck]].map(([k, l, Icon]) => (
            <button key={k} onClick={() => setCreateRole(k)} type="button"
              className="rounded-lg py-3 flex flex-col items-center gap-1.5 font-body text-xs"
              style={{
                background: createRole === k ? C.gold : C.nightSoft,
                color: createRole === k ? C.night : C.cream,
                border: `1.5px solid ${createRole === k ? C.gold : C.line}`
              }}>
              <Icon size={18} /> {l}
            </button>
          ))}
        </div>
        <Field label="Full name" placeholder="e.g. K. Muthukumar" value={createName} onChange={e => setCreateName(e.target.value)} />
        <Field label="Phone number" placeholder="9000000000" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
        <Btn variant="gold" full onClick={sendCreateOtp} icon={Smartphone}>Send OTP</Btn>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <button onClick={() => go("landing")} className="font-body text-sm flex items-center gap-1.5 mb-8" style={{ color: C.muted }}>
        <ArrowLeft size={15} /> Back home
      </button>
      <h1 className="font-display text-3xl mb-2" style={{ color: C.cream }}>Welcome back</h1>
      <p className="font-body text-sm mb-8" style={{ color: C.muted }}>Log in to your AgriPact dashboard.</p>
      <div>
        <Field label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Field label="Password" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && (
          <div className="font-body text-sm mb-4 flex items-center gap-1.5" style={{ color: C.rust }}>
            <Lock size={14} /> {error}
          </div>
        )}
        <Btn variant="gold" full onClick={attemptLogin} icon={ArrowRight}>Log in</Btn>
      </div>

      <div className="mt-8 p-4 rounded-lg" style={{ background: C.nightSoft, border: `1px solid ${C.line}` }}>
        <div className="font-body text-xs font-semibold mb-2" style={{ color: C.gold }}>Demo accounts for testing</div>
        {users.filter(u => DEMO_USERS.some(d => d.email === u.email)).map(u => (
          <div key={u.email} className="font-mono text-xs mb-1" style={{ color: C.muted }}>
            {u.role}: {u.email} / {u.password}
          </div>
        ))}
        <div className="font-body text-xs mt-3 pt-3" style={{ color: C.muted, borderTop: `1px solid ${C.line}` }}>
          Accounts you create are saved in this browser's local storage, so they'll still be here next time you open the app on this device — they won't sync to other browsers or devices without a real backend. Use a demo password, not a real one.
        </div>
      </div>

      <p className="font-body text-sm text-center mt-6" style={{ color: C.muted }}>
        New to AgriPact?{" "}
        <button onClick={() => go("signup")} style={{ color: C.gold }}>Create an account</button>
      </p>
    </div>
  );
}

/* ============================== DASHBOARD SHELL ============================== */
function DashShell({ title, subtitle, session, go, logout, tabs, active, setActive, children }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: C.gold }}>{subtitle}</div>
          <h1 className="font-display text-3xl" style={{ color: C.cream }}>{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-body text-sm font-semibold" style={{ background: C.gold, color: C.night }}>
            {session.name?.[0] || "U"}
          </div>
          <div className="font-body text-sm" style={{ color: C.cream }}>{session.name}</div>
          <button onClick={logout} title="Sign out" style={{ color: C.muted }}><LogOut size={18} /></button>
        </div>
      </div>
      {tabs && (
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setActive(t)} className="font-body text-sm px-4 py-2 rounded-full"
              style={{ background: active === t ? C.gold : C.nightSoft, color: active === t ? C.night : C.muted, border: `1px solid ${active === t ? C.gold : C.line}` }}>
              {t}
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
      <Icon size={18} color={C.gold} className="mb-3" />
      <div className="font-display text-2xl" style={{ color: C.cream }}>{value}</div>
      <div className="font-body text-xs mt-1" style={{ color: C.muted }}>{label}{sub ? ` · ${sub}` : ""}</div>
    </div>
  );
}

function ContractRow({ c, onOpen }) {
  return (
    <button onClick={() => onOpen(c.id)} className="w-full text-left p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
      style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
      <div className="flex-shrink-0">
        <div className="font-mono text-xs" style={{ color: C.rust }}>{c.id}</div>
        <div className="font-display text-lg" style={{ color: C.cream }}>{c.crop} · {c.quantity} {c.unit}</div>
      </div>
      <div className="flex-1 min-w-[160px]">
        <StageDots stageIndex={c.stageIndex} compact />
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-mono text-sm" style={{ color: C.gold }}>₹{c.lockedPrice.toLocaleString("en-IN")}/{c.unit}</div>
        <div className="font-body text-xs" style={{ color: C.muted }}>{STAGES[c.stageIndex]}</div>
      </div>
      <ChevronRight size={18} color={C.muted} className="flex-shrink-0" />
    </button>
  );
}

/* ============================== FARMER DASHBOARD ============================== */
function FarmerDashboard({ session, go, logout, contracts, openContract }) {
  const [tab, setTab] = useState("Overview");
  const mine = contracts;

  // "List a crop" form state
  const [cropName, setCropName] = useState(CROPS[0].name);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [sowMonth, setSowMonth] = useState("");
  const [listings, setListings] = useState([]);
  const [formError, setFormError] = useState("");

  const publishListing = () => {
    if (!quantity || !price || !sowMonth) {
      setFormError("Fill in quantity, price and sowing month before publishing.");
      return;
    }
    setFormError("");
    setListings(ls => [
      { id: Date.now(), crop: cropName, quantity, price, sowMonth },
      ...ls,
    ]);
    setQuantity("");
    setPrice("");
    setSowMonth("");
  };

  return (
    <DashShell title="Farmer dashboard" subtitle="AGRIPACT · FARMER" session={session} go={go} logout={logout}
      tabs={["Overview", "My contracts", "List a crop", "Market prices"]} active={tab} setActive={setTab}>

      {tab === "Overview" && (
        <div>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <StatCard icon={FileSignature} value={mine.length} label="active contracts" />
            <StatCard icon={IndianRupee} value="₹1.9L" label="value locked in, this season" />
            <StatCard icon={TrendingUp} value="+9.4%" label="avg. price vs. MSP" />
          </div>
          <div className="font-display text-xl mb-4" style={{ color: C.cream }}>Your contracts</div>
          <div className="flex flex-col gap-3">
            {mine.map(c => <ContractRow key={c.id} c={c} onOpen={openContract} />)}
          </div>
        </div>
      )}

      {tab === "My contracts" && (
        <div className="flex flex-col gap-3">
          {mine.map(c => <ContractRow key={c.id} c={c} onOpen={openContract} />)}
        </div>
      )}

      {tab === "List a crop" && (
        <div className="max-w-lg">
          <p className="font-body text-sm mb-6" style={{ color: C.muted }}>
            List a crop for buyers to discover. You'll be notified when a buyer proposes a contract.
          </p>
          <div>
            <label className="block mb-4">
              <span className="font-body text-sm mb-1.5 block" style={{ color: C.muted }}>Crop</span>
              <select value={cropName} onChange={e => setCropName(e.target.value)}
                className="w-full font-body rounded-lg px-3.5 py-2.5" style={{ background: C.nightSoft, border: `1.5px solid ${C.line}`, color: C.cream }}>
                {CROPS.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </label>
            <Field label="Estimated quantity (quintal)" placeholder="e.g. 40" value={quantity} onChange={e => setQuantity(e.target.value)} />
            <Field label="Expected price per unit (₹)" placeholder="e.g. 2380" value={price} onChange={e => setPrice(e.target.value)} />
            <Field label="Sowing month" placeholder="e.g. June 2026" value={sowMonth} onChange={e => setSowMonth(e.target.value)} />
            {formError && (
              <div className="font-body text-sm mb-4" style={{ color: C.rust }}>{formError}</div>
            )}
            <Btn variant="gold" icon={Plus} onClick={publishListing}>Publish listing</Btn>
          </div>

          {listings.length > 0 && (
            <div className="mt-10">
              <div className="font-display text-lg mb-4" style={{ color: C.cream }}>Your published listings</div>
              <div className="flex flex-col gap-3">
                {listings.map(l => (
                  <div key={l.id} className="p-4" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
                    <div className="font-display text-base" style={{ color: C.cream }}>{l.crop} · {l.quantity} quintal</div>
                    <div className="font-body text-xs mt-1" style={{ color: C.muted }}>
                      ₹{l.price}/unit expected · sowing {l.sowMonth}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Market prices" && <MarketPrices />}
    </DashShell>
  );
}

/* ============================== BUYER DASHBOARD ============================== */
function BuyerDashboard({ session, go, logout, contracts, openContract, proposeContract }) {
  const [tab, setTab] = useState("Browse farmers");
  const [query, setQuery] = useState("");
  const [proposedIds, setProposedIds] = useState([]);
  const filtered = FARMER_LISTINGS.filter(f => f.crop.toLowerCase().includes(query.toLowerCase()) || f.village.toLowerCase().includes(query.toLowerCase()));

  const handlePropose = (f) => {
    proposeContract(f, session);
    setProposedIds(ids => [...ids, f.id]);
  };

  return (
    <DashShell title="Buyer dashboard" subtitle="AGRIPACT · BUYER" session={session} go={go} logout={logout}
      tabs={["Browse farmers", "My contracts", "Market prices"]} active={tab} setActive={setTab}>

      {tab === "Browse farmers" && (
        <div>
          <div className="flex items-center gap-2 mb-6 rounded-lg px-3.5 py-2.5" style={{ background: C.nightSoft, border: `1.5px solid ${C.line}` }}>
            <Search size={16} color={C.muted} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by crop or village…"
              className="font-body bg-transparent outline-none w-full text-sm" style={{ color: C.cream }} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(f => {
              const proposed = proposedIds.includes(f.id);
              return (
                <div key={f.id} className="p-5" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-display text-lg" style={{ color: C.cream }}>{f.name}</div>
                      <div className="font-body text-xs flex items-center gap-1 mt-1" style={{ color: C.muted }}>
                        <MapPin size={12} /> {f.village}
                      </div>
                    </div>
                    <div className="font-body text-xs flex items-center gap-1" style={{ color: C.gold }}>
                      <Star size={12} fill={C.gold} /> {f.rating}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-5">
                    <div>
                      <div className="font-body text-xs" style={{ color: C.muted }}>{f.crop} · {f.acreage} acres</div>
                      <div className="font-mono text-sm mt-0.5" style={{ color: C.cream }}>₹{f.expected.toLocaleString("en-IN")} expected</div>
                    </div>
                    {proposed ? (
                      <div className="font-body text-xs px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ color: C.green }}>
                        <CheckCircle2 size={15} /> Proposal sent
                      </div>
                    ) : (
                      <Btn variant="outline" icon={FileSignature} onClick={() => handlePropose(f)}>Propose contract</Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "My contracts" && (
        <div className="flex flex-col gap-3">
          {contracts.map(c => <ContractRow key={c.id} c={c} onOpen={openContract} />)}
        </div>
      )}

      {tab === "Market prices" && <MarketPrices />}
    </DashShell>
  );
}

/* ============================== MARKET PRICES (shared tab) ============================== */
function MarketPrices() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CROPS.map(c => (
          <div key={c.name} className="p-5" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
            <div className="font-display text-lg mb-3" style={{ color: C.cream }}>{c.name}</div>
            <div className="flex justify-between font-body text-sm mb-1">
              <span style={{ color: C.muted }}>MSP floor</span>
              <span className="font-mono" style={{ color: C.cream }}>₹{c.msp.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span style={{ color: C.muted }}>Today's mandi price</span>
              <span className="font-mono" style={{ color: C.gold }}>₹{c.market.toLocaleString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
        <div className="font-display text-lg mb-4" style={{ color: C.cream }}>Paddy — locked vs. mandi price</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={PRICE_HISTORY}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="month" stroke={C.muted} fontSize={12} />
            <YAxis stroke={C.muted} fontSize={12} />
            <Tooltip contentStyle={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 8, color: C.cream }} />
            <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
            <Line type="monotone" dataKey="locked" name="Locked price" stroke={C.gold} strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="mandi" name="Mandi price" stroke="#7FBE8C" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ============================== CONTRACT DETAIL ============================== */
function ContractDetail({ contract, go, back, advanceStage }) {
  if (!contract) return null;
  const c = contract;
  const diff = c.marketPrice - c.lockedPrice;
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={back} className="font-body text-sm flex items-center gap-1.5 mb-8" style={{ color: C.muted }}>
        <ArrowLeft size={15} /> Back to dashboard
      </button>

      <div style={{ background: C.paper, borderRadius: 18, padding: 32 }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="font-mono text-xs" style={{ color: C.rust }}>{c.id}</div>
            <div className="font-display text-3xl mt-1" style={{ color: C.ink }}>{c.crop} · {c.quantity} {c.unit}</div>
            <div className="font-body text-sm mt-1" style={{ color: "rgba(28,27,21,0.6)" }}>Signed {c.signedDate} · Delivery {c.deliveryWindow}</div>
          </div>
          <Stamp size={90} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div className="p-4 rounded-lg" style={{ background: C.paperDim }}>
            <div className="font-body text-xs" style={{ color: "rgba(28,27,21,0.55)" }}>Farmer</div>
            <div className="font-display text-lg" style={{ color: C.ink }}>{c.farmer}</div>
            <div className="font-body text-xs" style={{ color: "rgba(28,27,21,0.55)" }}>{c.village}</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: C.paperDim }}>
            <div className="font-body text-xs" style={{ color: "rgba(28,27,21,0.55)" }}>Buyer</div>
            <div className="font-display text-lg" style={{ color: C.ink }}>{c.buyer}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          <div>
            <div className="font-body text-xs" style={{ color: "rgba(28,27,21,0.55)" }}>Locked price</div>
            <div className="font-mono text-xl" style={{ color: C.ink }}>₹{c.lockedPrice.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="font-body text-xs" style={{ color: "rgba(28,27,21,0.55)" }}>Today's mandi price</div>
            <div className="font-mono text-xl" style={{ color: C.ink }}>₹{c.marketPrice.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="font-body text-xs" style={{ color: "rgba(28,27,21,0.55)" }}>Protection this season</div>
            <div className="font-mono text-xl" style={{ color: diff >= 0 ? C.green : C.rust }}>
              {diff >= 0 ? "+" : ""}₹{diff.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="pt-6" style={{ borderTop: `1px dashed rgba(28,27,21,0.25)` }}>
          <div className="font-display text-lg mb-5" style={{ color: C.ink }}>Contract lifecycle</div>
          <StageDots stageIndex={c.stageIndex} />
        </div>
      </div>

      {c.stageIndex < STAGES.length - 1 && (
        <div className="mt-6 flex justify-end">
          <Btn variant="gold" icon={ArrowRight} onClick={() => advanceStage(c.id)}>
            Advance to "{STAGES[c.stageIndex + 1]}"
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ============================== ADMIN ============================== */
function Admin({ session, go, logout, contracts }) {
  const [tab, setTab] = useState("Overview");
  const [queue, setQueue] = useState([
    { name: "S. Rajendran — Trichy, TN", status: "pending" },
    { name: "Nilgiris Tea Collective — Buyer", status: "pending" },
    { name: "V. Chitra — Namakkal, TN", status: "pending" },
  ]);
  const decide = (name, status) => setQueue(q => q.map(item => item.name === name ? { ...item, status } : item));

  return (
    <DashShell title="Admin console" subtitle="AGRIPACT · ADMIN" session={session} go={go} logout={logout}
      tabs={["Overview", "Verification queue", "Disputes"]} active={tab} setActive={setTab}>

      {tab === "Overview" && (
        <div>
          <div className="grid sm:grid-cols-4 gap-4 mb-10">
            <StatCard icon={FileSignature} value={contracts.length} label="live contracts" />
            <StatCard icon={Users} value="1,204" label="verified farmers" />
            <StatCard icon={Handshake} value="318" label="verified buyers" />
            <StatCard icon={AlertTriangle} value="3" label="open disputes" />
          </div>
          <div className="font-display text-xl mb-4" style={{ color: C.cream }}>All contracts</div>
          <div className="flex flex-col gap-3">
            {contracts.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
                <div>
                  <div className="font-mono text-xs" style={{ color: C.rust }}>{c.id}</div>
                  <div className="font-body text-sm" style={{ color: C.cream }}>{c.farmer} → {c.buyer}</div>
                </div>
                <div className="font-body text-xs px-3 py-1 rounded-full" style={{ background: C.night, color: C.gold, border: `1px solid ${C.line}` }}>
                  {STAGES[c.stageIndex]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Verification queue" && (
        <div className="flex flex-col gap-3">
          {queue.map(item => (
            <div key={item.name} className="p-4 flex items-center justify-between" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
              <div className="font-body text-sm" style={{ color: C.cream }}>{item.name}</div>
              {item.status === "pending" ? (
                <div className="flex gap-2">
                  <Btn variant="gold" onClick={() => decide(item.name, "approved")}>Approve</Btn>
                  <Btn variant="outline" onClick={() => decide(item.name, "rejected")}>Reject</Btn>
                </div>
              ) : (
                <div className="font-body text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: C.night, color: item.status === "approved" ? C.green : C.rust, border: `1px solid ${C.line}` }}>
                  {item.status === "approved" ? <CheckCircle2 size={13} /> : <X size={13} />}
                  {item.status === "approved" ? "Approved" : "Rejected"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "Disputes" && (
        <div className="flex flex-col gap-3">
          {[
            { id: "CF-2026-0092", note: "Delivery quantity mismatch reported by buyer." },
            { id: "CF-2026-0071", note: "Farmer disputes market-linked bonus calculation." },
            { id: "CF-2026-0055", note: "Delayed payment beyond settlement window." },
          ].map(d => (
            <div key={d.id} className="p-4" style={{ background: C.nightSoft, border: `1px solid ${C.line}`, borderRadius: 12 }}>
              <div className="font-mono text-xs mb-1" style={{ color: C.rust }}>{d.id}</div>
              <div className="font-body text-sm" style={{ color: C.cream }}>{d.note}</div>
            </div>
          ))}
        </div>
      )}
    </DashShell>
  );
}

/* ============================== APP ============================== */
export default function App() {
  const [page, setPage] = useState("landing");
  const [session, setSession] = useState(null);
  const [defaultRole, setDefaultRole] = useState("farmer");
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [selectedId, setSelectedId] = useState(null);
  const [users, setUsers] = useState(DEMO_USERS);
  const [usersLoaded, setUsersLoaded] = useState(false);

  // Load any previously-created accounts from this browser's local storage on first load.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("agripact-users");
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length) {
          // Merge saved accounts with the demo accounts, saved ones win on email conflicts.
          const merged = [...DEMO_USERS.filter(d => !saved.some(s => s.email === d.email)), ...saved];
          setUsers(merged);
        }
      }
    } catch (e) {
      // No accounts saved yet, or storage unavailable — fall back to demo accounts only.
    } finally {
      setUsersLoaded(true);
    }
  }, []);

  const persistUsers = (list) => {
    try {
      localStorage.setItem("agripact-users", JSON.stringify(list));
    } catch (e) {
      // Storage save failed — the account still works for this session, just won't persist.
    }
  };
  const go = (p, role) => {
    if (role) setDefaultRole(role);
    setPage(p);
    window.scrollTo(0, 0);
  };
  const login = (s) => setSession(s);
  const logout = () => { setSession(null); setPage("landing"); };
  const openContract = (id) => { setSelectedId(id); setPage("contract"); window.scrollTo(0, 0); };
  const advanceStage = (id) => setContracts(cs => cs.map(c => c.id === id ? { ...c, stageIndex: Math.min(c.stageIndex + 1, STAGES.length - 1) } : c));
  const findUser = (email) => users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  const registerUser = (u) => {
    setUsers(us => {
      const next = [...us, u];
      persistUsers(next);
      return next;
    });
  };

  const proposeContract = (farmerListing, buyerSession) => {
    const crop = CROPS.find(c => c.name === farmerListing.crop) || CROPS[0];
    const newContract = {
      id: `CF-2026-0${Math.floor(200 + Math.random() * 700)}`,
      crop: farmerListing.crop,
      farmer: farmerListing.name,
      village: farmerListing.village,
      buyer: buyerSession?.name || "Buyer",
      quantity: 10,
      unit: crop.unit,
      lockedPrice: farmerListing.expected,
      marketPrice: crop.market,
      stageIndex: 0,
      signedDate: "Not yet signed",
      deliveryWindow: "To be agreed",
    };
    setContracts(cs => [newContract, ...cs]);
  };

  const selected = useMemo(() => contracts.find(c => c.id === selectedId), [contracts, selectedId]);

  return (
    <div className="font-body min-h-screen" style={{ background: C.night }}>
      <style>{FONTS}</style>
      {page !== "signup" && page !== "login" && <Nav go={go} session={session} logout={logout} />}

      {page === "landing" && <Landing go={go} />}
      {page === "signup" && <SignUp go={go} login={login} defaultRole={defaultRole} findUser={findUser} registerUser={registerUser} />}
      {page === "login" && <Login go={go} login={login} users={users} registerUser={registerUser} findUser={findUser} />}
      {page === "farmerDash" && session && (
        <FarmerDashboard session={session} go={go} logout={logout} contracts={contracts} openContract={openContract} />
      )}
      {page === "buyerDash" && session && (
        <BuyerDashboard session={session} go={go} logout={logout} contracts={contracts} openContract={openContract} proposeContract={proposeContract} />
      )}
      {page === "admin" && session && (
        <Admin session={session} go={go} logout={logout} contracts={contracts} />
      )}
      {page === "contract" && (
        <ContractDetail contract={selected} go={go} back={() => setPage(session ? (session.role === "farmer" ? "farmerDash" : session.role === "buyer" ? "buyerDash" : "admin") : "landing")} advanceStage={advanceStage} />
      )}
    </div>
  );
}
