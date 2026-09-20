import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/server/queries/user";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { User, Lock, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi Perfil" };

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getUserById(session.user.id);

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-500 mt-1">Gestiona tu información personal y seguridad de cuenta.</p>
      </div>

      {/* Avatar card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">
                  {user.role === "ADMIN" ? "Administrador" : "Beneficiario"}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">
                  Miembro desde {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Non-editable info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Información de identificación
          </CardTitle>
          <CardDescription>Estos datos no pueden modificarse directamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Documento / Cédula</p>
              <p className="text-sm font-medium text-slate-900 font-mono">{user.documentId}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Correo electrónico</p>
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
            </div>
            {user.birthDate && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Fecha de nacimiento</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(user.birthDate)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Para modificar estos datos, contacta a la fundación directamente.
          </p>
        </CardContent>
      </Card>

      {/* Editable info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Información personal editable</CardTitle>
          <CardDescription>Puedes actualizar estos datos en cualquier momento.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialData={{
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone ?? "",
              address: user.address ?? "",
              city: user.city ?? "",
              province: user.province ?? "",
            }}
          />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" /> Cambiar contraseña
          </CardTitle>
          <CardDescription>Usa una contraseña segura con al menos 8 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
