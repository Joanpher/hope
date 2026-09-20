"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAidRequestStatus } from "@/server/actions/index";
import { STATUS_LABELS } from "@/lib/constants";
import type { AidRequestStatus } from "@/types/database";

const STATUS_FLOW: AidRequestStatus[] = [
  "RECEIVED", "IN_REVIEW", "PENDING_DOCS", "EVALUATION",
  "APPROVED", "PREPARING", "DELIVERED", "REJECTED", "CANCELLED",
];

interface StatusChangeFormProps {
  requestId: string;
  currentStatus: AidRequestStatus;
  userEmail: string;
}

export function StatusChangeForm({ requestId, currentStatus, userEmail }: StatusChangeFormProps) {
  const [newStatus, setNewStatus] = useState<AidRequestStatus>(currentStatus);
  const [userComment, setUserComment] = useState("");
  const [internalComment, setInternalComment] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    if (newStatus === currentStatus) {
      setError("El estado seleccionado es el mismo que el actual.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateAidRequestStatus(requestId, {
        status: newStatus,
        userComment,
        internalComment,
        sendEmail,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-base">Cambiar estado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Estado actualizado correctamente
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div>
          <Label>Estado actual</Label>
          <div className="mt-1.5 px-3 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700">
            {STATUS_LABELS[currentStatus]}
          </div>
        </div>

        <div>
          <Label htmlFor="newStatus">Nuevo estado</Label>
          <select
            id="newStatus"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as AidRequestStatus)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="userComment">Comentario para el usuario</Label>
          <Textarea
            id="userComment"
            placeholder="Este mensaje será visible para el solicitante..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="internalComment">Nota interna (no visible al usuario)</Label>
          <Textarea
            id="internalComment"
            placeholder="Solo visible para administradores..."
            value={internalComment}
            onChange={(e) => setInternalComment(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <input
            id="sendEmail"
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600"
          />
          <div>
            <label htmlFor="sendEmail" className="text-sm font-medium text-slate-700 cursor-pointer">
              Notificar al usuario por correo
            </label>
            <p className="text-xs text-slate-400">{userEmail}</p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isPending || newStatus === currentStatus}
          id="btn-update-status"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</>
          ) : (
            "Confirmar cambio de estado"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
