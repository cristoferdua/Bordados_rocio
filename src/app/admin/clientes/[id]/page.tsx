import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(id) },
    include: {
      rentals: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: true } },
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    cotizacion: "bg-amber-100 text-amber-700",
    pendiente: "bg-blue-100 text-blue-700",
    activo: "bg-green-100 text-green-700",
    completado: "bg-gray-100 text-gray-700",
    cancelado: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    cotizacion: "Cotización",
    pendiente: "Pendiente",
    activo: "Activo",
    completado: "Completado",
    cancelado: "Cancelado",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          ← Volver
        </Link>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900">
            {customer.name}
          </h1>
          <p className="text-sm text-gray-500">
            Cliente desde{" "}
            {new Date(customer.createdAt).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
            Información de Contacto
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Teléfono</p>
              <p className="text-sm font-medium text-gray-900">
                {customer.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">
                {customer.email || "—"}
              </p>
            </div>
            {customer.notes && (
              <div>
                <p className="text-xs text-gray-400">Notas</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {customer.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
            Resumen
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Total Alquileres</p>
              <p className="font-playfair text-3xl font-bold text-primary-600">
                {customer.rentals.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Alquileres Activos</p>
              <p className="font-playfair text-2xl font-bold text-green-600">
                {customer.rentals.filter((r) => r.status === "activo").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental History */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
          Historial de Alquileres
        </h2>
        {customer.rentals.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Este cliente no tiene alquileres registrados
          </p>
        ) : (
          <div className="space-y-4">
            {customer.rentals.map((rental) => (
              <Link
                key={rental.id}
                href={`/admin/alquileres/${rental.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-primary-100 hover:shadow-sm"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Alquiler #{rental.id}
                  </p>
                  <p className="text-xs text-gray-400">
                    {rental.items.map((item) => item.product.name).join(", ") ||
                      "Sin productos"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(rental.startDate).toLocaleDateString()} →{" "}
                    {new Date(rental.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      statusColors[rental.status] || "bg-gray-100"
                    }`}
                  >
                    {statusLabels[rental.status] || rental.status}
                  </span>
                  {rental.totalPrice && (
                    <p className="text-sm font-semibold text-gray-900">
                      ${rental.totalPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
