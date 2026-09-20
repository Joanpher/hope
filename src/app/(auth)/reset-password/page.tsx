"use client";

import { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPassword } from "@/server/actions/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(data.token, data.password);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Enlace inválido</h2>
        <p className="text-slate-500 mb-6 text-sm">El enlace de recuperación no es válido o ha expirado.</p>
        <Link href="/forgot-password" className="text-blue-600 font-semibold hover:underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Contraseña actualizada!</h2>
        <p className="text-slate-500 mb-6 text-sm">Tu contraseña fue restablecida exitosamente.</p>
        <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
        <p className="text-slate-500 mt-2 text-sm">Crea una contraseña segura para tu cuenta.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <input type="hidden" {...register("token")} />

        <div>
          <Label htmlFor="password">Nueva contraseña</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            className="mt-1.5"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isPending} id="btn-reset">
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</>
          ) : (
            "Restablecer contraseña"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
