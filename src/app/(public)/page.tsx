import Link from "next/link";
import {
  Heart,
  ArrowRight,
  CheckCircle2,
  Users,
  FileText,
  Award,
  Utensils,
  Stethoscope,
  GraduationCap,
  Home,
  Zap,
  DollarSign,
  ChevronRight,
  Star,
} from "lucide-react";

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { label: "Familias ayudadas", value: "4,283", icon: Users },
  { label: "Solicitudes atendidas", value: "12,640", icon: FileText },
  { label: "Voluntarios activos", value: "347", icon: Heart },
  { label: "Proyectos realizados", value: "89", icon: Award },
];

// ─── Programs ─────────────────────────────────────────────────────────────────
const programs = [
  {
    icon: Utensils,
    title: "Alimentación",
    description:
      "Entregamos canastas básicas y apoyo nutricional a familias en situación de vulnerabilidad.",
    color: "from-orange-400 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: Stethoscope,
    title: "Salud",
    description:
      "Facilitamos acceso a medicamentos, consultas y servicios médicos esenciales.",
    color: "from-red-400 to-rose-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: GraduationCap,
    title: "Educación",
    description:
      "Apoyamos útiles, uniformes, becas y materiales de estudio para niños y jóvenes.",
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Home,
    title: "Vivienda",
    description:
      "Brindamos asistencia para reparaciones de emergencia, alquiler y mejoras del hogar.",
    color: "from-teal-400 to-emerald-500",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: Zap,
    title: "Emergencias",
    description:
      "Respuesta inmediata ante situaciones críticas: desastres naturales, accidentes o crisis.",
    color: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    icon: DollarSign,
    title: "Ayuda Económica",
    description:
      "Apoyo monetario directo para gastos urgentes y situaciones de extrema necesidad.",
    color: "from-purple-400 to-violet-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description: "Regístrate gratuitamente con tu información básica en pocos minutos.",
  },
  {
    number: "02",
    title: "Completa tu solicitud",
    description: "Describe tu situación y el tipo de ayuda que necesitas.",
  },
  {
    number: "03",
    title: "Evaluamos tu caso",
    description: "Nuestro equipo revisa cada solicitud con atención y confidencialidad.",
  },
  {
    number: "04",
    title: "Consulta el progreso",
    description: "Sigue el avance de tu solicitud en tiempo real desde tu cuenta.",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote:
      "Gracias a HopeRise Foundation pude conseguir los medicamentos para mi madre. El proceso fue muy transparente y rápido.",
    name: "María González",
    location: "Santo Domingo",
  },
  {
    quote:
      "Recibí apoyo para los útiles escolares de mis hijos. Fue una bendición en un momento muy difícil para mi familia.",
    name: "Carlos Rodríguez",
    location: "Santiago de los Caballeros",
  },
  {
    quote:
      "El sistema de seguimiento me permitió ver exactamente en qué etapa estaba mi solicitud. Muy profesional.",
    name: "Ana Martínez",
    location: "La Romana",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 brand-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                Más de 4,000 familias beneficiadas
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Juntos podemos{" "}
              <span className="text-yellow-300">cambiar vidas</span>
            </h1>
            <p className="text-xl text-white/85 leading-relaxed mb-10 max-w-2xl">
              HopeRise Foundation conecta a personas en situación de
              vulnerabilidad con los recursos y apoyos que necesitan.
              Transparente, eficiente y humana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors shadow-xl group"
              >
                Solicitar ayuda
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#nosotros"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
              >
                Conoce nuestra labor
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                "Sin costo para beneficiarios",
                "Proceso transparente",
                "Respuesta en 48 horas",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-white/85 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 800 0 400 40C200 60 0 20 0 20V80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover text-center"
                >
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold brand-gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Nosotros ─── */}
      <section id="nosotros" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
                <Heart className="w-4 h-4 fill-blue-500" />
                Quiénes somos
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Una fundación comprometida con el{" "}
                <span className="brand-gradient-text">bienestar humano</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                HopeRise Foundation nació con el propósito de ser un puente
                entre quienes más necesitan ayuda y quienes tienen la voluntad
                de brindarla. Trabajamos con transparencia, eficiencia y un
                profundo respeto por la dignidad de cada persona.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                Nuestros programas abarcan alimentación, salud, educación,
                vivienda y respuesta a emergencias. Cada solicitud es revisada
                por nuestro equipo con dedicación y confidencialidad.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Transparencia", "Solidaridad", "Dignidad", "Eficiencia"].map(
                  (value) => (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {value}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl brand-gradient p-1 shadow-2xl">
                <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <img
                      src="/logo.png"
                      alt="HopeRise Foundation"
                      className="w-32 h-auto object-contain mx-auto mb-6 bg-white rounded-2xl p-2 shadow-xl border border-slate-100"
                    />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Nuestra misión
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      Transformar vidas a través de un sistema de ayuda
                      transparente, accesible y orientado a las personas que
                      más lo necesitan. Rising Hope, Changing Lives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Programs ─── */}
      <section id="programas" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              Programas de ayuda
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              ¿En qué podemos{" "}
              <span className="brand-gradient-text">ayudarte?</span>
            </h2>
            <p className="text-lg text-slate-500">
              Contamos con programas especializados para diferentes tipos de
              necesidades.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <div
                  key={program.title}
                  className={`${program.bg} ${program.border} border rounded-2xl p-6 card-hover`}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${program.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {program.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {program.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              Proceso simple
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Cómo solicitar{" "}
              <span className="brand-gradient-text">ayuda</span>
            </h2>
            <p className="text-lg text-slate-500">
              En cuatro pasos sencillos puedes iniciar el proceso de solicitud.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-black text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-[18px] -right-4 translate-x-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm">
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 brand-gradient text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 transition-opacity"
            >
              Crear mi cuenta ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Lo que dicen{" "}
              <span className="brand-gradient-text">nuestros beneficiarios</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 brand-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Necesitas ayuda? Estamos aquí para ti
          </h2>
          <p className="text-xl text-white/85 mb-10 leading-relaxed">
            Crea tu cuenta gratuitamente y presenta tu solicitud. Nuestro equipo
            te acompañará en cada paso del proceso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors shadow-xl"
            >
              Comenzar ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
