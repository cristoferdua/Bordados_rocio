import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export default async function AdminAlquileresPage() {
  const rentals = await prisma.rental.findMany({
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-900">
          Alquileres
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona los alquileres ({rentals.length} registros)
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {rentals.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl">📅</span>
            <p className="mt-4 font-playfair text-lg font-semibold text-gray-900">
              No hay alquileres registrados
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Los alquileres aparecerán aquí cuando los clientes soliciten
              cotizaciones
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Productos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Fechas
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rentals.map((rental) => (
                  <tr
                    key={rental.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {rental.customer.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {rental.customer.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {rental.items.map((item) => (
                          <p
                            key={item.id}
                            className="text-sm text-gray-700"
                          >
                            {item.product.name} x{item.quantity}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {new Date(rental.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        → {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                      {rental.returnDate && (
                        <p className="text-xs text-green-600">
                          Devuelto:{" "}
                          {new Date(rental.returnDate).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        ${rental.totalPrice?.toFixed(2) || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[rental.status] || "bg-gray-100"
                        }`}
                      >
                        {statusLabels[rental.status] || rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/alquileres/${rental.id}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
