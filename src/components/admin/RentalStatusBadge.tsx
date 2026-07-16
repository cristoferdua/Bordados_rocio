const statusConfig: Record<string, { color: string; label: string }> = {
  cotizacion: { color: "bg-amber-100 text-amber-700", label: "Cotización" },
  pendiente: { color: "bg-blue-100 text-blue-700", label: "Pendiente" },
  activo: { color: "bg-green-100 text-green-700", label: "Activo" },
  completado: { color: "bg-gray-100 text-gray-700", label: "Completado" },
  cancelado: { color: "bg-red-100 text-red-700", label: "Cancelado" },
};

export function RentalStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-700",
    label: status,
  };

  return (
    <span
      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${config.color}`}
    >
      {config.label}
    </span>
  );
}
