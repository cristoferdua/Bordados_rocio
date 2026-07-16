import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Shirt,
  Tags,
  CalendarCheck,
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalProducts, totalCategories, totalRentals, totalCustomers] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.rental.count(),
      prisma.customer.count(),
    ]);

  const activeRentals = await prisma.rental.count({
    where: { status: "activo" },
  });

  const pendingQuotes = await prisma.rental.count({
    where: { status: "cotizacion" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general de Bordados Rocio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Productos",
            value: totalProducts,
            icon: Shirt,
            color: "bg-blue-50 text-blue-600",
            href: "/admin/productos",
          },
          {
            label: "Categorías",
            value: totalCategories,
            icon: Tags,
            color: "bg-purple-50 text-purple-600",
            href: "/admin/categorias",
          },
          {
            label: "Alquileres Activos",
            value: activeRentals,
            icon: CalendarCheck,
            color: "bg-green-50 text-green-600",
            href: "/admin/alquileres",
          },
          {
            label: "Clientes",
            value: totalCustomers,
            icon: Users,
            color: "bg-amber-50 text-amber-600",
            href: "/admin/clientes",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <TrendingUp className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
            </div>
            <p className="mt-4 font-playfair text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-playfair text-2xl font-bold text-gray-900">
                {totalRentals}
              </p>
              <p className="text-sm text-gray-500">Total Alquileres</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-playfair text-2xl font-bold text-gray-900">
                {pendingQuotes}
              </p>
              <p className="text-sm text-gray-500">Cotizaciones Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          >
            <Shirt className="h-5 w-5 text-primary-500" />
            Nuevo Producto
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-secondary-200 hover:bg-secondary-50 hover:text-secondary-700"
          >
            <Tags className="h-5 w-5 text-secondary-500" />
            Gestionar Categorías
          </Link>
          <Link
            href="/admin/alquileres"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            <CalendarCheck className="h-5 w-5 text-green-500" />
            Ver Alquileres
          </Link>
          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
          >
            <Users className="h-5 w-5 text-amber-500" />
            Ver Clientes
          </Link>
        </div>
      </div>
    </div>
  );
}
