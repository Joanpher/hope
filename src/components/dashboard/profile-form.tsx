"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { UpdateProfileSchema, type UpdateProfileInput } from "@/lib/validations";
import { updateProfile } from "@/server/actions/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES, type CountryCode } from "@/lib/countries";

interface ProfileFormProps {
  // `country` puede venir sin valor: una cuenta antigua pudo guardar un país
  // que ya no está en la lista. En ese caso el selector arranca en el
  // marcador de posición y Zod exige elegir uno antes de guardar.
  initialData: Omit<UpdateProfileInput, "country"> & { country?: CountryCode };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: UpdateProfileInput) => {
    setSuccess(null);
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) setError(result.error);
      else setSuccess(result.success as string);
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Nombres *</Label>
          <Input id="firstName" className="mt-1.5" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Apellidos *</Label>
          <Input id="lastName" className="mt-1.5" {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" type="tel" className="mt-1.5" {...register("phone")} />
      </div>
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" className="mt-1.5" {...register("address")} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" className="mt-1.5" {...register("city")} />
        </div>
        <div>
          <Label htmlFor="province">Provincia</Label>
          <Input id="province" className="mt-1.5" {...register("province")} />
        </div>
      </div>
      <div>
        <Label htmlFor="country">País *</Label>
        <select
          id="country"
          className="mt-1.5 flex h-10 w-full rounded-lg border border-line bg-white px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-leaf/20 focus:border-leaf transition-all duration-200"
          defaultValue={initialData.country ?? ""}
          {...register("country")}
        >
          {!initialData.country && (
            <option value="" disabled>
              Selecciona tu país
            </option>
          )}
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} id="btn-save-profile">
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
      </Button>
    </form>
  );
}
