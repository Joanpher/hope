"use client";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, FileText, Heart, Home, Stethoscope,
  GraduationCap, Utensils, Zap, DollarSign, AlertCircle, ArrowLeft,
  Check, Pencil,
} from "lucide-react";
import { AidRequestSchema, type AidRequestInput } from "@/lib/validations";
import { createAidRequest } from "@/server/actions/index";
import type { AidType, EmploymentStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { AID_TYPE_LABELS, EMPLOYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

const AID_ICONS: Record<string, React.ElementType> = {
  FOOD: Utensils,
  MEDICINE: Heart,
  HEALTH: Stethoscope,
  EDUCATION: GraduationCap,
  HOUSING: Home,
  EMERGENCY: Zap,
  ECONOMIC: DollarSign,
  OTHER: FileText,
};

// ─── Pasos ────────────────────────────────────────────────────────────────────
//
// 0 = bienvenida, 1..4 = datos, 5 = revisión, 6 = enviada. Cada paso de datos
// agrupa un solo tema y valida solo sus campos antes de avanzar, igual que el
// registro de cuenta.

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DATA_STEPS: { title: string; lead: string; fields: (keyof AidRequestInput)[] }[] = [
  {
    title: "¿Qué tipo de ayuda necesitas?",
    lead: "Elige la opción que mejor describe tu situación.",
    fields: ["aidType"],
  },
  {
    title: "Cuéntanos tu situación",
    lead: "Entre más detalle nos des, más rápido podemos evaluar tu caso.",
    fields: ["description", "reason"],
  },
  {
    title: "Tu hogar",
    lead: "Esta información nos ayuda a entender el contexto de tu solicitud.",
    fields: ["householdSize", "employmentStatus", "monthlyIncome", "requestedAmount"],
  },
  {
    title: "Para contactarte",
    lead: "Por si necesitamos coordinar algo contigo durante el proceso.",
    fields: ["contactPhone", "contactAddress", "observations"],
  },
];

const TOTAL_STEPS = DATA_STEPS.length + 1; // + revisión

// ─── Piezas de formulario ─────────────────────────────────────────────────────

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
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[15px] text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[17px] text-ink">{value || "—"}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-bold text-leaf-dark hover:bg-leaf-soft"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
      </button>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function NuevaSolicitudPage() {
  const [step, setStep] = useState<Step>(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AidRequestInput>({
    resolver: zodResolver(AidRequestSchema),
    mode: "onTouched",
  });

  const values = watch();

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
    if (step >= 1 && step <= DATA_STEPS.length) {
      const ok = await trigger(DATA_STEPS[step - 1].fields, { shouldFocus: true });
      if (ok) setStep((step + 1) as Step);
    }
  };

  const back = () => {
    setError(null);
    if (step > 0 && step < 6) setStep((step - 1) as Step);
  };

  const onSubmit = (data: AidRequestInput) => {
    setError(null);
    startTransition(async () => {
      const result = await createAidRequest(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.code as string);
        setStep(6);
      }
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    if (step === TOTAL_STEPS) return handleSubmit(onSubmit)(e);
    e.preventDefault();
    void next();
  };

  const err = (k: keyof AidRequestInput) => errors[k]?.message as string | undefined;
  const current = step >= 1 && step <= DATA_STEPS.length ? DATA_STEPS[step - 1] : null;

  if (step === 6 && success) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in text-center sm:text-left">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf-soft sm:mx-0">
          <Check className="h-7 w-7 text-leaf" aria-hidden />
        </span>
        <h1 className="mt-6 font-serif text-[34px] font-semibold leading-tight text-navy sm:text-4xl">
          ¡Solicitud enviada!
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">
          La registramos correctamente y te enviamos un correo de confirmación. Podrás
          seguir cada cambio de estado desde tu panel.
        </p>
        <div className="mt-6 rounded-lg bg-mist p-5">
          <p className="text-[15px] font-bold text-ink-muted">Código de solicitud</p>
          <p className="mt-1 font-mono text-2xl font-bold text-navy">{success}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/solicitudes" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">Ver mis solicitudes</Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button size="lg" className="w-full">Ir al panel</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in pb-24">
      {step === 0 && (
        <div className="mb-6 flex items-center gap-3">
          <Link href="/solicitudes">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink-muted hover:bg-mist"
              aria-label="Volver a mis solicitudes"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        </div>
      )}

      <form onSubmit={onFormSubmit} noValidate>
        {/* Progreso: un tramo por paso de datos + revisión */}
        {step >= 1 && step <= TOTAL_STEPS && (
          <div className="mb-8">
            <p className="text-[15px] font-bold text-leaf" aria-live="polite">
              Paso {step} de {TOTAL_STEPS}
            </p>
            <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${TOTAL_STEPS}, minmax(0,1fr))` }} aria-hidden>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
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

        <div key={step} className="onboarding-step">
          {/* ─── 0 · Bienvenida ─── */}
          {step === 0 && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="font-serif text-[34px] font-semibold leading-tight text-navy outline-none sm:text-5xl">
                Pidamos tu ayuda, paso a paso
              </h1>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-muted sm:text-lg">
                Son {DATA_STEPS.length} pasos cortos y una revisión final antes de enviar.
                Puedes guardar lo escrito volviendo atrás en cualquier momento.
              </p>
              <div className="mt-8 rounded-lg bg-mist p-5 sm:p-6">
                <p className="font-bold text-navy">Ten a mano</p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    "Una breve descripción de tu situación",
                    "Un número de teléfono donde podamos ubicarte",
                    "Una idea aproximada del monto que necesitas, en dólares",
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

          {/* ─── 1..4 · Datos ─── */}
          {current && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="font-serif text-[30px] font-semibold leading-tight text-navy outline-none sm:text-4xl">
                {current.title}
              </h1>
              <p className="mt-2 text-[17px] leading-relaxed text-ink-muted">{current.lead}</p>
            </>
          )}

          {step === 1 && (
            <div className="mt-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(AID_TYPE_LABELS).map(([key, label]) => {
                  const Icon = AID_ICONS[key] || FileText;
                  const isSelected = values.aidType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setValue("aidType", key as AidType, { shouldValidate: true })}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                        isSelected
                          ? "border-leaf bg-leaf-soft text-leaf-dark"
                          : "border-line text-ink-muted hover:border-leaf/40 hover:bg-mist"
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                      <span className="text-sm font-bold leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.aidType && (
                <p role="alert" className="mt-3 flex items-center gap-1.5 text-[15px] text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {errors.aidType.message}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-6">
              <Field id="description" label="Describe tu situación actual" error={err("description")}>
                <textarea id="description" rows={5}
                  placeholder="Explica detalladamente tu situación y por qué necesitas ayuda…"
                  className={cn(inputClass, "h-auto resize-none py-3")}
                  aria-invalid={!!errors.description}
                  {...register("description")} />
              </Field>
              <Field id="reason" label="Motivo de la solicitud" error={err("reason")}>
                <textarea id="reason" rows={3}
                  placeholder="¿Por qué necesitas este tipo de ayuda específicamente?"
                  className={cn(inputClass, "h-auto resize-none py-3")}
                  aria-invalid={!!errors.reason}
                  {...register("reason")} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="householdSize" label="Personas en el hogar" optional error={err("householdSize")}>
                  <input id="householdSize" type="number" inputMode="numeric" min={1} max={20} placeholder="Ej: 4"
                    className={inputClass} {...register("householdSize")} />
                </Field>
                <Field id="employmentStatus" label="Situación laboral" optional>
                  <select id="employmentStatus" defaultValue="" className={inputClass}
                    {...register("employmentStatus")}>
                    <option value="" disabled>Selecciona…</option>
                    {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="monthlyIncome" label="Ingresos mensuales aprox." hint="En dólares (USD)." optional error={err("monthlyIncome")}>
                  <input id="monthlyIncome" type="number" inputMode="numeric" min={0} placeholder="Ej: 400"
                    className={inputClass} {...register("monthlyIncome")} />
                </Field>
                <Field id="requestedAmount" label="Monto solicitado" hint="En dólares (USD)." optional error={err("requestedAmount")}>
                  <input id="requestedAmount" type="number" inputMode="numeric" min={0} placeholder="Ej: 150"
                    className={inputClass} {...register("requestedAmount")} />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-8 space-y-6">
              <Field id="contactPhone" label="Teléfono de contacto" optional error={err("contactPhone")}>
                <input id="contactPhone" type="tel" inputMode="tel" placeholder="809-000-0000"
                  className={inputClass} {...register("contactPhone")} />
              </Field>
              <Field id="contactAddress" label="Dirección de residencia" optional>
                <input id="contactAddress" placeholder="Calle, sector, municipio"
                  className={inputClass} {...register("contactAddress")} />
              </Field>
              <Field id="observations" label="Observaciones adicionales" optional error={err("observations")}>
                <textarea id="observations" rows={3}
                  placeholder="Cualquier información adicional que desees agregar…"
                  className={cn(inputClass, "h-auto resize-none py-3")}
                  {...register("observations")} />
              </Field>
            </div>
          )}

          {/* ─── 5 · Revisión ─── */}
          {step === 5 && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="font-serif text-[30px] font-semibold leading-tight text-navy outline-none sm:text-4xl">
                Revisa tu solicitud
              </h1>
              <p className="mt-2 text-[17px] leading-relaxed text-ink-muted">
                Confirma que todo esté correcto antes de enviarla.
              </p>
              <div className="mt-8 divide-y divide-line rounded-lg border border-line bg-white px-5">
                <SummaryRow label="Tipo de ayuda" value={values.aidType ? AID_TYPE_LABELS[values.aidType] : "—"} onEdit={() => setStep(1)} />
                <SummaryRow label="Situación" value={values.description} onEdit={() => setStep(2)} />
                <SummaryRow label="Motivo" value={values.reason} onEdit={() => setStep(2)} />
                <SummaryRow
                  label="Hogar"
                  value={[
                    values.householdSize && `${values.householdSize} persona(s)`,
                    values.employmentStatus && EMPLOYMENT_STATUS_LABELS[values.employmentStatus as EmploymentStatus],
                    values.monthlyIncome && `Ingresos: ${formatCurrency(Number(values.monthlyIncome))}`,
                  ].filter(Boolean).join(" · ")}
                  onEdit={() => setStep(3)}
                />
                <SummaryRow
                  label="Monto solicitado"
                  value={values.requestedAmount ? formatCurrency(Number(values.requestedAmount)) : "—"}
                  onEdit={() => setStep(3)}
                />
                <SummaryRow
                  label="Contacto"
                  value={[values.contactPhone, values.contactAddress].filter(Boolean).join(" · ")}
                  onEdit={() => setStep(4)}
                />
              </div>

              {error && (
                <p role="alert" className="mt-6 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-[15px] text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* ─── Navegación entre pasos ─── */}
        {step < 6 && (
          <div className="sticky bottom-0 -mx-4 mt-10 border-t border-line bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
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
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Enviando…
                  </>
                ) : step === 0 ? (
                  "Empezar"
                ) : step === TOTAL_STEPS ? (
                  "Enviar solicitud"
                ) : (
                  "Continuar"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
