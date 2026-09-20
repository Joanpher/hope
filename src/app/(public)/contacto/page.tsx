"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ContactSchema, type ContactInput } from "@/lib/validations";
import { submitContactMessage } from "@/server/actions/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Metadata } from "next";

const contactInfo = [
  { icon: Phone, label: "Teléfono", value: "+1 (809) 555-0123", href: "tel:+18095550123" },
  { icon: Mail, label: "Correo", value: "info@hoperisefoundation.org", href: "mailto:info@hoperisefoundation.org" },
  { icon: MapPin, label: "Dirección", value: "Av. Principal 123, Santo Domingo, RD", href: "#" },
  { icon: Clock, label: "Horario", value: "Lun-Vie: 8:00 AM - 5:00 PM", href: "#" },
];

function ContactForm() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
  });

  const onSubmit = (data: ContactInput) => {
    setError(null);
    startTransition(async () => {
      const result = await submitContactMessage(data);
      if (result.success) {
        setSuccess(result.success as string);
        reset();
      }
    });
  };

  if (success) {
    return (
      <div className="text-center py-12 animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">¡Mensaje enviado!</h3>
        <p className="text-slate-500">{success}</p>
        <button onClick={() => setSuccess(null)} className="mt-4 text-blue-600 text-sm font-medium hover:underline">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre completo *</Label>
          <Input id="name" placeholder="Tu nombre" className="mt-1.5" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input id="email" type="email" placeholder="tu@correo.com" className="mt-1.5" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" placeholder="809-000-0000" className="mt-1.5" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="subject">Asunto *</Label>
          <Input id="subject" placeholder="¿En qué podemos ayudarte?" className="mt-1.5" {...register("subject")} />
          {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="message">Mensaje *</Label>
        <Textarea
          id="message"
          placeholder="Escribe tu mensaje aquí..."
          className="mt-1.5 min-h-[140px]"
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isPending} id="btn-contact">
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar mensaje</>
        )}
      </Button>
    </form>
  );
}

export default function ContactoPage() {
  return (
    <>
      <div className="brand-gradient py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Contáctanos</h1>
          <p className="text-xl text-white/85">Estamos aquí para ayudarte. Escríbenos o llámanos.</p>
        </div>
      </div>

      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Información de contacto</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-slate-700">{item.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Envíanos un mensaje</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
