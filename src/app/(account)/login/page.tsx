"use client";

import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { LoginSchema, type LoginInput } from "@/lib/validations/auth";
import { AccountShell } from "@/components/site/account-shell";
import { cn } from "@/lib/utils";

// Texto de 16 px o más para que Safari en iPhone no amplíe al enfocar.
const inputClass =
  "block h-12 w-full rounded-md border border-line bg-white px-3.5 text-base text-ink transition-colors focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20 aria-[invalid=true]:border-red-500";

/**
 * Solo acepta destinos dentro de este sitio.
 *
 * Antes se redirigía a lo que viniera en ?callbackUrl= sin comprobarlo: un
 * enlace como /login?callbackUrl=https://sitio-falso.com mandaba a la persona,
 * recién autenticada, a una página ajena que podía imitar a la fundación.
 * "//host" y "/\host" también se descartan porque el navegador los trata como
 * direcciones de otro dominio.
 */
function safeCallback(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  return raw;
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const callbackUrl = safeCallback(useSearchParams().get("callbackUrl"));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema), mode: "onTouched" });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (!result || result.error || result.ok === false) {
          setError("El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.");
          return;
        }

        // Sin destino pedido, cada rol va a su panel. Antes todos iban a
        // /dashboard, así que un administrador aterrizaba en el panel de
        // beneficiario.
        let target = callbackUrl;
        if (!target) {
          const session = await getSession();
          target = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
        }
        // Recarga completa para que el servidor lea la nueva cookie de sesión.
        window.location.assign(target);
      } catch (err) {
        console.error("Login submit error:", err);
        setError("No pudimos iniciar la sesión. Inténtalo de nuevo en unos segundos.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-10 sm:px-8 lg:max-w-xl lg:justify-center lg:px-16 lg:pb-20"
    >
      <h1 className="font-serif text-[34px] font-semibold leading-tight text-navy sm:text-5xl">
        Entra a tu cuenta
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-ink-muted sm:text-lg">
        Para ver en qué va tu solicitud o enviar una nueva.
      </p>

      {error && (
        <p role="alert" className="mt-8 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-[15px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block font-bold text-navy">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={cn(inputClass, "mt-2")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[15px] text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block font-bold text-navy">
            Contraseña
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={cn(inputClass, "pr-14")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ink-muted hover:text-navy"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[15px] text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {errors.password.message}
            </p>
          )}
          <div className="mt-1 flex justify-end">
            <Link
              href="/forgot-password"
              className="inline-flex min-h-11 items-center text-[15px] font-bold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy"
            >
              Olvidé mi contraseña
            </Link>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-md bg-leaf text-lg font-bold text-white transition-colors hover:bg-leaf-dark disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>

      <div className="mt-10 border-t border-line pt-8">
        <p className="text-base text-ink-muted">¿Es tu primera vez aquí?</p>
        <Link
          href="/register"
          className="mt-3 flex h-14 w-full items-center justify-center rounded-md border-2 border-navy/20 text-lg font-bold text-navy transition-colors hover:border-navy/40 hover:bg-mist"
        >
          Crear mi cuenta
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AccountShell
      asideTitle="Tu solicitud, al día"
      asideItems={[
        { title: "Mira en qué etapa está", body: "Cada cambio de estado queda registrado, con su fecha." },
        { title: "Lee los mensajes del equipo", body: "Si necesitamos algo de ti, lo verás aquí y en tu correo." },
        { title: "Envía una nueva solicitud", body: "Cuando lo necesites, desde tu panel." },
      ]}
      image={{
        src: "/images/foundation/programa-salud.webp",
        alt: "Una enfermera toma la presión arterial a un hombre mayor en un consultorio",
      }}
      switchPrompt="¿No tienes cuenta?"
      switchHref="/register"
      switchLabel="Crear cuenta"
    >
      {/* useSearchParams exige un límite de Suspense en páginas prerenderizadas. */}
      <Suspense fallback={<div className="flex-1" />}>
        <LoginForm />
      </Suspense>
    </AccountShell>
  );
}
