"use client";

import { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from "lucide-react";
import { LoginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error || result?.ok === false) {
          setError("Correo o contraseña incorrectos. Verifica tus datos.");
          return;
        }

        window.location.href = callbackUrl;
      } catch (err) {
        console.error("Login submit error:", err);
        setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Bienvenido/a de vuelta</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Ingresa tus datos para acceder a tu cuenta
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-700 text-sm animate-scale-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            className="mt-1.5"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              className="pr-11"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isPending}
          id="btn-login"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</>
          ) : (
            <><LogIn className="w-4 h-4" /> Iniciar sesión</>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
