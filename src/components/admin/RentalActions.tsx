"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  rentalId: number;
  currentStatus: string;
}

export function RentalActions({ rentalId, currentStatus }: Props) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/alquileres/${rentalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          returnDate: newStatus === "completado" ? new Date().toISOString() : null,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const availableActions: { status: string; label: string; color: string }[] = [];

  if (currentStatus === "cotizacion" || currentStatus === "pendiente") {
    availableActions.push({
      status: "activo",
      label: "Confirmar Alquiler",
      color: "bg-green-600 hover:bg-green-700",
    });
    availableActions.push({
      status: "cancelado",
      label: "Cancelar",
      color: "bg-red-500 hover:bg-red-600",
    });
  }

  if (currentStatus === "activo") {
    availableActions.push({
      status: "completado",
      label: "Marcar como Devuelto",
      color: "bg-blue-600 hover:bg-blue-700",
    });
  }

  if (currentStatus === "cotizacion") {
    availableActions.push({
      status: "pendiente",
      label: "Pendiente de Pago",
      color: "bg-amber-500 hover:bg-amber-600",
    });
  }

  if (availableActions.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
        Acciones
      </h2>
      <div className="flex flex-wrap gap-3">
        {availableActions.map((action) => (
          <button
            key={action.status}
            onClick={() => updateStatus(action.status)}
            disabled={isUpdating}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 ${action.color}`}
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
