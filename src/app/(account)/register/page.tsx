"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { RegisterSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/server/actions/auth";
import { AccountShell } from "@/components/site/account-shell";
import { cn } from "@/lib/utils";

// ─── Pasos ────────────────────────────────────────────────────────────────────
//
// 0 = bienvenida, 1..3 = datos, 4 = cuenta creada. Cada paso de datos agrupa
// un solo tema y valida solo sus campos antes de avanzar.

type Step = 0 | 1 | 2 | 3 | 4;

const DATA_STEPS: { title: string; lead: string; fields: (keyof RegisterInput)[] }[] = [
  {
    title: "Sobre ti",
    lead: "Escribe tu nombre tal como aparece en tu documento de identidad.",
    fields: ["firstName", "lastName", "documentId", "birthDate"],
  },
  {
    title: "Cómo contactarte",
    lead: "Te escribiremos a este correo cada vez que tu solicitud cambie de estado.",
    fields: ["email", "phone", "address", "city", "province"],
  },
  {
    title: "Protege tu cuenta",
    lead: "Elige una contraseña que no uses en otros sitios.",
    fields: ["password", "confirmPassword", "acceptedTerms"],
  },
];

// ─── Piezas de formulario ─────────────────────────────────────────────────────

// Texto de 16 px o más: por debajo, Safari en iPhone amplía la página al
// enfocar el campo y el usuario tiene que alejar el zoom a mano.
const inputClass =
  "block h-12 w-full rounded-md border border-line bg-white px-3.5 text-base text-ink placeholder:text-ink-muted/60 transition-colors focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20 aria-[invalid=true]:border-red-500";

function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-bold text-navy">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-muted">(opcional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-[15px] leading-snug text-ink-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[15px] text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint: boolean, error: boolean) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    getValues,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { acceptedTerms: false },
    mode: "onTouched",
  });

  const password = watch("password", "");
  const checks = [
    { ok: password.length >= 8, label: "Al menos 8 caracteres" },
    { ok: /[A-Z]/.test(password), label: "Una letra mayúscula" },
    { ok: /[0-9]/.test(password), label: "Un número" },
  ];

  // Al cambiar de paso: vuelve arriba y lleva el foco al título, para que el
  // lector de pantalla anuncie el paso nuevo y el teclado empiece desde ahí.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step]);

  const next = async () => {
    if (step === 0) return setStep(1);
    if (step >= 1 && step <= 2) {
      const ok = await trigger(DATA_STEPS[step - 1].fields, { shouldFocus: true });
      if (ok) setStep((step + 1) as Step);
    }
  };

  const back = () => {
    setFormError(null);
    if (step > 0 && step < 4) setStep((step - 1) as Step);
  };

  const onSubmit = (data: RegisterInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await registerUser(data);

      if (result.error) {
        // Los datos duplicados se detectan en el servidor: se lleva al usuario
        // de vuelta al paso donde está el campo, con el error junto a él.
        const msg = result.error.toLowerCase();
        if (msg.includes("documento")) {
          setStep(1);
          setError("documentId", { message: result.error });
        } else if (msg.includes("correo")) {
          setStep(2);
          setError("email", { message: result.error });
        } else {
          setFormError(result.error);
        }
        return;
      }

      setStep(4);

      // Entra a la cuenta directamente, sin pedir la contraseña otra vez.
      try {
        const login = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        setSignedIn(Boolean(login?.ok && !login.error));
      } catch {
        setSignedIn(false);
      }
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    if (step === 3) return handleSubmit(onSubmit)(e);
    e.preventDefault();
    void next();
  };

  const err = (k: keyof RegisterInput) => errors[k]?.message as string | undefined;
  const current = step >= 1 && step <= 3 ? DATA_STEPS[step - 1] : null;

  return (
    <AccountShell
      asideTitle="Lo que pasa después"
      numbered
      asideItems={[
        { title: "Envías tu primera solicitud", body: "Justo al terminar el registro. Te toma unos minutos." },
        { title: "Revisamos tu caso", body: "Una persona del equipo lo lee y, si falta algo, te lo pide." },
        { title: "Sigues cada paso", body: "Cada cambio te llega por correo y queda en tu cuenta." },
      ]}
      image={{
        src: "/images/foundation/programa-alimentacion.webp",
        alt: "Voluntarios entregan una caja con alimentos a una mujer en la puerta de su casa",
      }}
      switchPrompt="¿Ya tienes cuenta?"
      switchHref="/login"
      switchLabel="Entrar"
    >

        <form
          onSubmit={onFormSubmit}
          noValidate
          className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-8 pt-8 sm:px-8 lg:max-w-2xl lg:px-16 lg:pt-14"
        >
          {/* Progreso: tres tramos, uno por paso de datos */}
          {current && (
            <div className="mb-8">
              <p className="text-[15px] font-bold text-leaf" aria-live="polite">
                Paso {step} de 3
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1.5 rounded-full transition-colors duration-300 motion-reduce:transition-none",
                      n <= step ? "bg-leaf" : "bg-line"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <div key={step} className="onboarding-step flex-1 sm:flex-none">
            {/* ─── 0 · Bienvenida ─── */}
            {step === 0 && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="font-serif text-[34px] font-semibold leading-tight text-navy outline-none sm:text-5xl">
                  Vamos a crear tu cuenta
                </h1>
                <p className="mt-4 text-[17px] leading-relaxed text-ink-muted sm:text-lg">
                  Con ella podrás pedir ayuda a la fundación y ver en todo momento en
                  qué va tu solicitud. Son tres pasos cortos.
                </p>
                <div className="mt-8 rounded-lg bg-mist p-5 sm:p-6">
                  <p className="font-bold text-navy">Ten a mano</p>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      "Tu documento de identidad",
                      "Un correo al que tengas acceso",
                      "Tu dirección",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[17px] text-ink">
                        <Check className="h-5 w-5 shrink-0 text-leaf" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* ─── 1..3 · Datos ─── */}
            {current && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="font-serif text-[30px] font-semibold leading-tight text-navy outline-none sm:text-4xl">
                  {current.title}
                </h1>
                <p className="mt-2 text-[17px] leading-relaxed text-ink-muted">{current.lead}</p>
              </>
            )}

            {step === 1 && (
              <div className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="firstName" label="Nombres" error={err("firstName")}>
                    <input id="firstName" autoComplete="given-name" className={inputClass}
                      aria-invalid={!!errors.firstName} aria-describedby={describedBy("firstName", false, !!errors.firstName)}
                      {...register("firstName")} />
                  </Field>
                  <Field id="lastName" label="Apellidos" error={err("lastName")}>
                    <input id="lastName" autoComplete="family-name" className={inputClass}
                      aria-invalid={!!errors.lastName} aria-describedby={describedBy("lastName", false, !!errors.lastName)}
                      {...register("lastName")} />
                  </Field>
                </div>
                <Field
                  id="documentId"
                  label="Documento de identidad"
                  hint="Cédula, DNI o el documento que uses en tu país. Evita que una misma persona tenga dos cuentas."
                  error={err("documentId")}
                >
                  <input id="documentId" autoComplete="off" className={inputClass}
                    aria-invalid={!!errors.documentId} aria-describedby={describedBy("documentId", true, !!errors.documentId)}
                    {...register("documentId")} />
                </Field>
                <Field id="birthDate" label="Fecha de nacimiento" optional error={err("birthDate")}>
                  <input id="birthDate" type="date" autoComplete="bday" className={inputClass}
                    {...register("birthDate")} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8 space-y-6">
                <Field id="email" label="Correo electrónico" error={err("email")}>
                  <input id="email" type="email" inputMode="email" autoComplete="email" className={inputClass}
                    aria-invalid={!!errors.email} aria-describedby={describedBy("email", false, !!errors.email)}
                    {...register("email")} />
                </Field>
                <Field id="phone" label="Teléfono" optional hint="Por si necesitamos coordinar la entrega contigo." error={err("phone")}>
                  <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass}
                    aria-invalid={!!errors.phone} aria-describedby={describedBy("phone", true, !!errors.phone)}
                    {...register("phone")} />
                </Field>
                <Field id="address" label="Dirección" hint="Calle, número y barrio o sector." error={err("address")}>
                  <input id="address" autoComplete="street-address" className={inputClass}
                    aria-invalid={!!errors.address} aria-describedby={describedBy("address", true, !!errors.address)}
                    {...register("address")} />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="city" label="Ciudad o municipio" error={err("city")}>
                    <input id="city" autoComplete="address-level2" className={inputClass}
                      aria-invalid={!!errors.city} aria-describedby={describedBy("city", false, !!errors.city)}
                      {...register("city")} />
                  </Field>
                  <Field id="province" label="Provincia o estado" error={err("province")}>
                    <input id="province" autoComplete="address-level1" className={inputClass}
                      aria-invalid={!!errors.province} aria-describedby={describedBy("province", false, !!errors.province)}
                      {...register("province")} />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-8 space-y-6">
                <Field id="password" label="Contraseña" error={err("password")}>
                  <div className="relative">
                    <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                      className={cn(inputClass, "pr-14")}
                      aria-invalid={!!errors.password} aria-describedby={cn("password-checks", errors.password && "password-error")}
                      {...register("password")} />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ink-muted hover:text-navy"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <ul id="password-checks" className="mt-3 space-y-1.5">
                    {checks.map((c) => (
                      <li key={c.label} className={cn("flex items-center gap-2 text-[15px]", c.ok ? "text-leaf-dark" : "text-ink-muted")}>
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", c.ok ? "border-leaf bg-leaf text-white" : "border-line")}>
                          {c.ok && <Check className="h-3.5 w-3.5" aria-hidden />}
                        </span>
                        {c.label}
                        <span className="sr-only">{c.ok ? "(cumplido)" : "(pendiente)"}</span>
                      </li>
                    ))}
                  </ul>
                </Field>
                <Field id="confirmPassword" label="Repite la contraseña" error={err("confirmPassword")}>
                  <input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" className={inputClass}
                    aria-invalid={!!errors.confirmPassword} aria-describedby={describedBy("confirmPassword", false, !!errors.confirmPassword)}
                    {...register("confirmPassword")} />
                </Field>

                <div>
                  <label htmlFor="acceptedTerms" className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4 has-[:checked]:border-leaf has-[:checked]:bg-leaf-soft/60">
                    <input id="acceptedTerms" type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-leaf"
                      aria-invalid={!!errors.acceptedTerms} aria-describedby={errors.acceptedTerms ? "acceptedTerms-error" : undefined}
                      {...register("acceptedTerms")} />
                    <span className="text-base leading-relaxed text-ink">
                      Leí y acepto los{" "}
                      <Link href="/terminos" target="_blank" className="font-bold text-navy underline underline-offset-2">términos y condiciones</Link>{" "}
                      y la{" "}
                      <Link href="/privacidad" target="_blank" className="font-bold text-navy underline underline-offset-2">política de privacidad</Link>.
                    </span>
                  </label>
                  {errors.acceptedTerms && (
                    <p id="acceptedTerms-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[15px] text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                      {err("acceptedTerms")}
                    </p>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-[15px] text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {formError}
                  </p>
                )}
              </div>
            )}

            {/* ─── 4 · Cuenta creada ─── */}
            {step === 4 && (
              <div className="text-center sm:text-left">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf-soft sm:mx-0">
                  <Check className="h-7 w-7 text-leaf" aria-hidden />
                </span>
                <h1 ref={headingRef} tabIndex={-1} className="mt-6 font-serif text-[34px] font-semibold leading-tight text-navy outline-none sm:text-5xl">
                  Tu cuenta está lista, {getValues("firstName")}
                </h1>
                <p className="mt-4 text-[17px] leading-relaxed text-ink-muted sm:text-lg">
                  Te enviamos un correo de bienvenida a{" "}
                  <span className="font-bold text-ink">{getValues("email")}</span>. El
                  siguiente paso es contarnos qué necesitas.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {signedIn === null && (
                    <p className="flex h-14 items-center justify-center gap-2 text-ink-muted">
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Entrando a tu cuenta…
                    </p>
                  )}
                  {signedIn === true && (
                    <>
                      <Link href="/solicitudes/nueva" className="flex h-14 items-center justify-center rounded-md bg-leaf px-8 text-lg font-bold text-white transition-colors hover:bg-leaf-dark">
                        Crear mi primera solicitud
                      </Link>
                      <Link href="/dashboard" className="flex h-14 items-center justify-center rounded-md border-2 border-navy/20 px-7 text-lg font-bold text-navy transition-colors hover:border-navy/40 hover:bg-mist">
                        Ir a mi panel
                      </Link>
                    </>
                  )}
                  {signedIn === false && (
                    <Link href="/login" className="flex h-14 items-center justify-center rounded-md bg-leaf px-8 text-lg font-bold text-white transition-colors hover:bg-leaf-dark">
                      Entrar a mi cuenta
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Navegación entre pasos ───
              En móvil queda fija abajo, al alcance del pulgar y sobre el teclado. */}
          {step < 4 && (
            <div className="sticky bottom-0 -mx-4 mt-10 border-t border-line bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 sm:static sm:mx-0 sm:border-0 sm:px-0 sm:pb-0 sm:pt-0">
              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    disabled={isPending}
                    className="flex h-14 items-center justify-center rounded-md border-2 border-navy/20 px-5 text-lg font-bold text-navy transition-colors hover:border-navy/40 hover:bg-mist disabled:opacity-50 sm:px-7"
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-md bg-leaf px-8 text-lg font-bold text-white transition-colors hover:bg-leaf-dark disabled:opacity-70 sm:flex-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Creando tu cuenta…
                    </>
                  ) : step === 0 ? (
                    "Empezar"
                  ) : step === 3 ? (
                    "Crear mi cuenta"
                  ) : (
                    "Continuar"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
    </AccountShell>
  );
}
