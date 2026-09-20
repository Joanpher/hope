"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/lib/validations";
import { changePassword } from "@/server/actions/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordInput) => {
    setSuccess(null);
    setError(null);
    startTransition(async () => {
      const result = await changePassword(data);
      if (result.error) setError(result.error);
      else {
        setSuccess(result.success as string);
        reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div>
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <div className="relative mt-1.5">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            className="pr-11"
            {...register("currentPassword")}
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
      </div>

      <div>
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <div className="relative mt-1.5">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            className="pr-11"
            {...register("newPassword")}
          />
          <button type="button" onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          className="mt-1.5"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} id="btn-change-password">
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</> : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
