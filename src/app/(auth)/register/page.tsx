"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle2, Check
} from "lucide-react";
import { RegisterSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { acceptedTerms: false },
  });

  const password = watch("password", "");
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = (data: RegisterInput) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await registerUser(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.success as string);
      }
    });
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Cuenta creada!</h2>
        <p className="text-slate-500 mb-6">{success}</p>
        <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="text-slate-500 mt-1.5 text-sm">
          Regístrate para solicitar ayuda de la fundación
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              placeholder="María"
              className="mt-1.5"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              placeholder="González"
              className="mt-1.5"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Correo electrónico *</Label>
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

        {/* Document and Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="documentId">Documento / Cédula *</Label>
            <Input
              id="documentId"
              placeholder="001-0000000-0"
              className="mt-1.5"
              {...register("documentId")}
            />
            {errors.documentId && (
              <p className="text-xs text-red-500 mt-1">{errors.documentId.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="809-000-0000"
              className="mt-1.5"
              {...register("phone")}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            placeholder="Calle, número, sector"
            className="mt-1.5"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* City and Province */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">Ciudad / Municipio *</Label>
            <Input id="city" placeholder="Santo Domingo" className="mt-1.5" {...register("city")} />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="province">Provincia *</Label>
            <Input id="province" placeholder="Distrito Nacional" className="mt-1.5" {...register("province")} />
            {errors.province && (
              <p className="text-xs text-red-500 mt-1">{errors.province.message}</p>
            )}
          </div>
        </div>

        {/* Birth date */}
        <div>
          <Label htmlFor="birthDate">Fecha de nacimiento (opcional)</Label>
          <Input id="birthDate" type="date" className="mt-1.5" {...register("birthDate")} />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password">Contraseña *</Label>
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
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              {[
                { check: passwordChecks.length, label: "Mínimo 8 caracteres" },
                { check: passwordChecks.upper, label: "Una letra mayúscula" },
                { check: passwordChecks.number, label: "Un número" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 text-xs ${item.check ? "text-green-600" : "text-slate-400"}`}
                >
                  <Check className={`w-3 h-3 ${item.check ? "text-green-500" : "text-slate-300"}`} />
                  {item.label}
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
          <div className="relative mt-1.5">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repite tu contraseña"
              className="pr-11"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="acceptedTerms"
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            {...register("acceptedTerms")}
          />
          <label htmlFor="acceptedTerms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
            He leído y acepto los{" "}
            <Link href="/terminos" target="_blank" className="text-blue-600 font-medium hover:underline">
              términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" target="_blank" className="text-blue-600 font-medium hover:underline">
              política de privacidad
            </Link>
          </label>
        </div>
        {errors.acceptedTerms && (
          <p className="text-xs text-red-500">{errors.acceptedTerms.message}</p>
        )}

        <Button type="submit" className="w-full mt-2" size="lg" disabled={isPending} id="btn-register">
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Crear cuenta</>
          )}
        </Button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-slate-500">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
