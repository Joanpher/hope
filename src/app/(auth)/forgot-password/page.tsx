"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPassword } from "@/server/actions/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setError(null);
    startTransition(async () => {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Revisa tu correo</h2>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
          El enlace expirará en 1 hora.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">¿Olvidaste tu contraseña?</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Ingresa tu correo y te enviaremos un enlace de recuperación.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            className="mt-1.5"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isPending} id="btn-forgot">
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            "Enviar enlace de recuperación"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
