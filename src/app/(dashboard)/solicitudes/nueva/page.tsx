"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Loader2, CheckCircle2, FileText, Heart, Home, Stethoscope,
  GraduationCap, Utensils, Zap, DollarSign, AlertCircle, ArrowLeft
} from "lucide-react";
import { AidRequestSchema, type AidRequestInput } from "@/lib/validations";
import { createAidRequest } from "@/server/actions/index";
import type { AidType, EmploymentStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AID_TYPE_LABELS, EMPLOYMENT_STATUS_LABELS } from "@/lib/constants";
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

export default function NuevaSolicitudPage() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<string>("");
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AidRequestInput>({
    resolver: zodResolver(AidRequestSchema),
  });

  const onSubmit = (data: AidRequestInput) => {
    setError(null);
    startTransition(async () => {
      const result = await createAidRequest(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.code as string);
      }
    });
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center animate-scale-in">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">¡Solicitud enviada!</h2>
          <p className="text-slate-500 mb-4">
            Tu solicitud ha sido registrada exitosamente. Recibirás un correo de confirmación.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-600 mb-1">Código de solicitud</p>
            <p className="text-2xl font-mono font-bold text-blue-800">{success}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/solicitudes" className="flex-1">
              <Button variant="outline" className="w-full">Ver mis solicitudes</Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">Ir al dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/solicitudes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva Solicitud de Ayuda</h1>
          <p className="text-slate-500 text-sm mt-1">Completa el formulario con tu información.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Section: Tipo de ayuda */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
            Tipo de ayuda solicitada
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(AID_TYPE_LABELS).map(([key, label]) => {
              const Icon = AID_ICONS[key] || FileText;
              const isSelected = selectedType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedType(key);
                    setValue("aidType", key as AidType);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
          {errors.aidType && (
            <p className="text-xs text-red-500 mt-2">{errors.aidType.message}</p>
          )}
        </div>

        {/* Section: Descripción */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
            Descripción de la situación
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Describe tu situación actual *</Label>
              <Textarea
                id="description"
                placeholder="Explica detalladamente tu situación actual y por qué necesitas ayuda..."
                className="mt-1.5 min-h-[120px]"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="reason">Motivo de la solicitud *</Label>
              <Textarea
                id="reason"
                placeholder="¿Por qué necesitas este tipo de ayuda específicamente?"
                className="mt-1.5"
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Información adicional */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
            Información del hogar
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="householdSize">Número de personas en el hogar</Label>
              <Input id="householdSize" type="number" min="1" max="20" placeholder="Ej: 4" className="mt-1.5" {...register("householdSize")} />
              {errors.householdSize && <p className="text-xs text-red-500 mt-1">{errors.householdSize.message}</p>}
            </div>
            <div>
              <Label htmlFor="requestedAmount">Monto solicitado (DOP)</Label>
              <Input id="requestedAmount" type="number" min="0" placeholder="Ej: 5000" className="mt-1.5" {...register("requestedAmount")} />
            </div>
            <div>
              <Label htmlFor="employmentStatus">Situación laboral</Label>
              <Select onValueChange={(v) => setValue("employmentStatus", v as EmploymentStatus)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthlyIncome">Ingresos mensuales aprox. (DOP)</Label>
              <Input id="monthlyIncome" type="number" min="0" placeholder="Ej: 15000" className="mt-1.5" {...register("monthlyIncome")} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Teléfono de contacto</Label>
              <Input id="contactPhone" type="tel" placeholder="809-000-0000" className="mt-1.5" {...register("contactPhone")} />
              {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactAddress">Dirección de residencia</Label>
              <Input id="contactAddress" placeholder="Calle, sector, municipio" className="mt-1.5" {...register("contactAddress")} />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="observations">Observaciones adicionales</Label>
            <Textarea
              id="observations"
              placeholder="Cualquier información adicional que desees agregar..."
              className="mt-1.5"
              {...register("observations")}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/solicitudes" className="flex-none">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isPending} id="btn-submit-request">
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando solicitud...</>
            ) : (
              "Enviar solicitud de ayuda"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
