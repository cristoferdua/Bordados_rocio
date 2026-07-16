import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: { select: { rentals: true } },
      rentals: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-900">
          Clientes
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tus clientes ({customers.length} registros)
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl">👥</span>
            <p className="mt-4 font-playfair text-lg font-semibold text-gray-900">
              No hay clientes registrados
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
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Alquileres
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Último Alquiler
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Registro
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 text-sm font-semibold text-primary-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {customer.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {customer.phone || "—"}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-gray-400">
                          {customer.email}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                        {customer._count.rentals}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.rentals[0] ? (
                        <p className="text-sm text-gray-700">
                          {new Date(
                            customer.rentals[0].createdAt
                          ).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/clientes/${customer.id}`}
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
