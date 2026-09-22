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
  { icon: MapPin, label: "Dirección", value: "Av. Principal 123, Santo Domingo, RD", href: null },
  { icon: Clock, label: "Horario", value: "Lunes a viernes, de 8:00 a. m. a 5:00 p. m.", href: null },
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
      } else if (result.error) {
        setError(result.error);
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
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" autoComplete="tel" className="mt-1.5" {...register("phone")} />
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
    <section className="bg-white py-12 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <h1 className="font-serif text-[34px] font-semibold leading-tight text-navy sm:text-5xl">
            Contáctanos
          </h1>
          <p className="mt-4 max-w-[42ch] text-[17px] leading-relaxed text-ink-muted sm:text-lg">
            Si tienes dudas antes de crear tu solicitud, o quieres colaborar con la
            fundación, escríbenos o llámanos.
          </p>

          <dl className="mt-10 divide-y divide-line border-y border-line">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex gap-4 py-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-leaf" aria-hidden />
                  <div>
                    <dt className="text-sm text-ink-muted">{item.label}</dt>
                    <dd className="mt-0.5 text-base font-bold text-navy">
                      {item.href ? (
                        <a href={item.href} className="break-all underline decoration-navy/25 underline-offset-4 hover:decoration-navy">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-lg border border-line bg-white p-5 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-navy">Envíanos un mensaje</h2>
            <p className="mt-1 text-base text-ink-muted">Te respondemos por correo.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
