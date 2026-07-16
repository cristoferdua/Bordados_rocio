import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RentalStatusBadge } from "@/components/admin/RentalStatusBadge";
import { RentalActions } from "@/components/admin/RentalActions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;

  const rental = await prisma.rental.findUnique({
    where: { id: parseInt(id) },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!rental) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/alquileres"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            ← Volver
          </Link>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-gray-900">
              Alquiler #{rental.id}
            </h1>
            <p className="text-sm text-gray-500">
              Creado el{" "}
              {new Date(rental.createdAt).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <RentalStatusBadge status={rental.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
            Cliente
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Nombre</p>
              <p className="text-sm font-medium text-gray-900">
                {rental.customer.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Teléfono</p>
              <p className="text-sm text-gray-700">
                {rental.customer.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-gray-700">
                {rental.customer.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Rental Info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
            Detalles del Alquiler
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Inicio</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(rental.startDate).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fin</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(rental.endDate).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {rental.returnDate && (
              <div>
                <p className="text-xs text-gray-400">Fecha de devolución</p>
                <p className="text-sm font-medium text-green-600">
                  {new Date(rental.returnDate).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-sm font-bold text-gray-900">
                ${rental.totalPrice?.toFixed(2) || "Por definir"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
          Productos
        </h2>
        <div className="divide-y divide-gray-100">
          {rental.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👗</span>
                <div>
                  <Link
                    href={`/admin/productos/${item.product.id}/editar`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    Cantidad: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {rental.notes && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-2">
            Notas
          </h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {rental.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <RentalActions
        rentalId={rental.id}
        currentStatus={rental.status}
      />
    </div>
  );
}
