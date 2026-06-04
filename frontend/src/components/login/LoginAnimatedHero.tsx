import { motion } from "motion/react"
import { MapPin, Activity, Shield, Users } from "lucide-react"
import LoginMapAnimation from "./LoginMapAnimation"

const FEATURES = [
  {
    icon: MapPin,
    color: "bg-blue-500",
    title: "Geo-Tagged Cases",
    desc: "Location-based monitoring",
  },
  {
    icon: Activity,
    color: "bg-green-500",
    title: "Real-time Analytics",
    desc: "Data-driven insights",
  },
  {
    icon: Shield,
    color: "bg-purple-500",
    title: "Risk Assessment",
    desc: "Identify high-risk areas",
  },
  {
    icon: Users,
    color: "bg-orange-500",
    title: "Better Governance",
    desc: "Transparent & accountable",
  },
] as const

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 17 + 7) % 100,
  y: (i * 23 + 11) % 100,
  delay: (i % 5) * 0.4,
  duration: 3 + (i % 4),
}))

export default function LoginAnimatedHero() {
  return (
    <div className="relative w-full h-full min-h-[480px] overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="relative z-20 pt-6 px-6 md:px-8 pb-2">
        <h2 className="text-center mb-2">
          <span className="text-2xl md:text-3xl font-bold text-gray-900">Monitor. </span>
          <span className="text-2xl md:text-3xl font-bold text-blue-600">Analyze. </span>
          <span className="text-2xl md:text-3xl font-bold text-emerald-600">Act.</span>
        </h2>
        <p className="text-center text-xs md:text-sm text-gray-600 mb-5 max-w-md mx-auto leading-relaxed">
          Track vigilance cases, identify risk areas,
          <br className="hidden sm:block" />
          and strengthen governance at the grassroots.
        </p>

        <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="text-center w-[72px] md:w-[88px]">
              <div
                className={`w-10 h-10 md:w-11 md:h-11 ${color} rounded-lg flex items-center justify-center mb-1.5 mx-auto shadow-md`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-[9px] md:text-[10px] text-gray-700 font-semibold leading-tight">{title}</p>
              <p className="text-[8px] md:text-[9px] text-gray-500 leading-tight mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Animated map area */}
      <div className="flex-1 relative min-h-[280px]">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.35, 1, 0.35],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="absolute inset-0 flex items-center justify-center px-4 pb-4"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-full max-w-[520px]">
            <LoginMapAnimation />
          </div>
        </motion.div>

        {/* Ambient glow — Figma style */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-200/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-100/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-8 right-8 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-6 w-44 h-44 bg-cyan-300/15 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  )
}
