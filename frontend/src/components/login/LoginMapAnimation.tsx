/** Animated 3D Kerala map hero — matches loginvigilance.png map section */
export default function LoginMapAnimation() {
  const pins: Array<{ x: string; y: string; color: PinColor; delay: string }> = [
    { x: "28%", y: "15%", color: "red", delay: "0s" },
    { x: "30%", y: "36%", color: "orange", delay: "0.35s" },
    { x: "48%", y: "42%", color: "green", delay: "0.7s" },
    { x: "45%", y: "58%", color: "orange", delay: "1.05s" },
    { x: "58%", y: "65%", color: "cyan", delay: "1.4s" },
    { x: "50%", y: "74%", color: "green", delay: "1.75s" },
    { x: "65%", y: "82%", color: "purple", delay: "2.1s" },
  ]

  return (
    <div className="login-map-stage w-full relative min-h-[260px] md:min-h-[300px] flex items-center justify-center p-2 select-none overflow-visible">
      {/* Ambient glow */}
      <div className="absolute w-[420px] h-[300px] rounded-full bg-blue-500/15 blur-[90px] pointer-events-none login-map-glow-pulse" />

      {/* Digital floor grid */}
      <div
        className="absolute w-[520px] h-[280px] pointer-events-none login-map-floor"
        style={{ transform: "rotateX(72deg) translateY(80px)" }}
      />

      {/* Radar rings */}
      <div
        className="absolute w-[480px] h-[480px] border border-blue-400/[0.06] rounded-full pointer-events-none"
        style={{ transform: "rotateX(66deg)" }}
      />
      <div
        className="absolute w-[380px] h-[380px] border border-dashed border-blue-400/10 rounded-full pointer-events-none login-radar-spin"
        style={{ transform: "rotateX(66deg)" }}
      />
      <div
        className="absolute w-[260px] h-[260px] border border-cyan-400/[0.08] rounded-full pointer-events-none login-radar-spin-reverse"
        style={{ transform: "rotateX(66deg)" }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="login-particle absolute w-1 h-1 rounded-full bg-cyan-200/80 pointer-events-none"
          style={{
            left: `${12 + (i * 7) % 75}%`,
            top: `${20 + (i * 11) % 60}%`,
            animationDelay: `${i * 0.55}s`,
            animationDuration: `${4 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Isometric map container */}
      <div
        className="relative w-[320px] h-[340px] login-map-float"
        style={{
          transformStyle: "preserve-3d",
          transform: "perspective(1000px) rotateX(46deg) rotateY(0deg) rotateZ(-24deg)",
        }}
      >
        {/* Scanning laser beam */}
        <div className="login-scan-beam absolute w-[200%] h-5 -translate-x-[25%] pointer-events-none" style={{ top: "52%" }} />

        <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl relative z-10">
          <defs>
            <linearGradient id="loginMapFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5cbd" />
              <stop offset="40%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
            <linearGradient id="loginMapGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="40%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
            <pattern id="loginMapGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="16" y2="0" stroke="#60a5fa" strokeWidth="0.4" strokeOpacity="0.22" />
              <line x1="0" y1="0" x2="0" y2="16" stroke="#60a5fa" strokeWidth="0.4" strokeOpacity="0.22" />
            </pattern>
          </defs>

          {/* 3D extrusion sides */}
          {[14, 12, 9, 6, 3].map((dy, i) => (
            <path
              key={dy}
              d="M 60 20 Q 50 60 60 120 T 75 180 T 90 240 T 110 310 T 125 360 Q 135 380 140 390 L 140 392 L 138 392 Q 128 340 115 290 T 98 190 T 75 100 T 75 50 Z"
              fill={i < 2 ? "#0f172a" : "#1e3a8a"}
              opacity={0.4 + i * 0.12}
              transform={`translate(0, ${dy})`}
            />
          ))}

          <path
            d="M 60 20 Q 50 60 60 120 T 75 180 T 90 240 T 110 310 T 125 360 Q 135 380 140 390 L 140 392 L 138 392 Q 128 340 115 290 T 98 190 T 75 100 T 75 50 Z"
            fill="url(#loginMapFace)"
            stroke="#3b82f6"
            strokeWidth="2"
            className="login-map-surface-pulse"
          />
          <path
            d="M 75 180 T 90 240 T 110 310 L 114 290 Q 104 235 98 190 Z"
            fill="url(#loginMapGreen)"
            fillOpacity="0.9"
            stroke="#10b981"
            strokeWidth="1.5"
          />
          <path
            d="M 60 20 Q 50 60 60 120 T 75 180 T 90 240 T 110 310 T 125 360 Q 135 380 140 390 L 140 392 L 138 392 Q 128 340 115 290 T 98 190 T 75 100 T 75 50 Z"
            fill="url(#loginMapGrid)"
          />
        </svg>

        {pins.map((pin) => (
          <MapPin3D key={`${pin.x}-${pin.y}`} {...pin} />
        ))}
      </div>
    </div>
  )
}

type PinColor = "red" | "orange" | "green" | "cyan" | "purple"

const PIN_STYLES: Record<
  PinColor,
  { bg: string; shadow: string; ring: string; ripple: string }
> = {
  red: { bg: "bg-rose-500", shadow: "shadow-rose-500/50", ring: "border-rose-400", ripple: "bg-rose-400" },
  orange: { bg: "bg-amber-500", shadow: "shadow-amber-500/50", ring: "border-amber-400", ripple: "bg-amber-400" },
  green: { bg: "bg-emerald-500", shadow: "shadow-emerald-500/50", ring: "border-emerald-400", ripple: "bg-emerald-400" },
  cyan: { bg: "bg-cyan-500", shadow: "shadow-cyan-500/50", ring: "border-cyan-400", ripple: "bg-cyan-400" },
  purple: { bg: "bg-violet-500", shadow: "shadow-violet-500/50", ring: "border-violet-400", ripple: "bg-violet-400" },
}

function MapPin3D({
  x,
  y,
  color,
  delay,
}: {
  x: string
  y: string
  color: PinColor
  delay: string
}) {
  const c = PIN_STYLES[color]

  return (
    <div
      className="absolute login-pin-drop"
      style={{
        left: x,
        top: y,
        transformStyle: "preserve-3d",
        animationDelay: delay,
      }}
    >
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 ${c.ring}/40 login-pin-ripple pointer-events-none`}
        style={{ animationDelay: delay }}
      />
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${c.ripple}/30 blur-sm pointer-events-none`}
      />

      <div
        className="absolute flex flex-col items-center origin-bottom login-pin-bob"
        style={{
          transform: "rotateZ(24deg) rotateX(-46deg)",
          transformOrigin: "bottom center",
          bottom: 0,
          left: -8,
          width: 16,
          height: 36,
          animationDelay: delay,
        }}
      >
        <div className="w-[1.2px] h-5 bg-gradient-to-t from-white to-white/70 shadow-md" />
        <div
          className={`w-3.5 h-3.5 rounded-full ${c.bg} ${c.shadow} shadow-lg border border-white/95 flex items-center justify-center -mt-px`}
        >
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </div>
    </div>
  )
}
