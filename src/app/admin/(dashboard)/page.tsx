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
  XCircle,
  Clock,
  Award,
  ArrowUpRight,
  Package,
  Eye,
  Star,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    totalCategories,
    totalRentals,
    totalCustomers,
    activeRentals,
    pendingQuotes,
    lowStockProducts,
    completedRentals,
    rentalsThisMonth,
    statusCounts,
    topProducts,
    recentRentals,
    upcomingReturns,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.rental.count(),
    prisma.customer.count(),

    prisma.rental.count({ where: { status: "activo" } }),

    prisma.rental.count({ where: { status: "cotizacion" } }),

    prisma.product.count({ where: { stock: { lte: 3 }, isAvailable: true } }),

    prisma.rental.findMany({
      where: { status: "completado" },
      select: { totalPrice: true },
    }),

    prisma.rental.count({
      where: { createdAt: { gte: startOfMonth } },
    }),

    // Status distribution
    Promise.all(
      ["cotizacion", "pendiente", "activo", "completado", "cancelado"].map(
        (status) =>
          prisma.rental.count({ where: { status } }).then((count) => ({
            status,
            count,
          }))
      )
    ),

    // Top 5 most rented products
    prisma.product.findMany({
      include: {
        _count: { select: { rentalItems: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { rentalItems: { _count: "desc" } },
      take: 5,
    }),

    // Recent 5 rentals
    prisma.rental.findMany({
      include: {
        customer: true,
        items: { include: { product: true }, take: 2 },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Upcoming returns (next 7 days, active rentals)
    prisma.rental.findMany({
      where: {
        status: "activo",
        endDate: { lte: nextWeek, gte: now },
      },
      include: { customer: true },
      orderBy: { endDate: "asc" },
      take: 5,
    }),
  ]);

  const totalRevenue = completedRentals.reduce(
    (sum, r) => sum + (r.totalPrice || 0),
    0
  );

  const activeOrCompleted =
    (statusCounts.find((s) => s.status === "activo")?.count || 0) +
    (statusCounts.find((s) => s.status === "completado")?.count || 0);
  const cancellations =
    statusCounts.find((s) => s.status === "cancelado")?.count || 0;
  const qualifiedRentals = totalRentals - cancellations;
  const conversionRate =
    qualifiedRentals > 0
      ? Math.round((activeOrCompleted / qualifiedRentals) * 100)
      : 0;

  return {
    totalProducts,
    totalCategories,
    totalRentals,
    totalCustomers,
    activeRentals,
    pendingQuotes,
    lowStockProducts,
    totalRevenue,
    rentalsThisMonth,
    statusCounts,
    topProducts,
    recentRentals,
    upcomingReturns,
    conversionRate,
  };
}

const statusConfig = {
  cotizacion: {
    label: "Cotización",
    color: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Clock,
  },
  pendiente: {
    label: "Pendiente",
    color: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: AlertCircle,
  },
  activo: {
    label: "Activo",
    color: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
    icon: CheckCircle2,
  },
  completado: {
    label: "Completado",
    color: "bg-gray-500",
    bg: "bg-gray-50",
    text: "text-gray-700",
    icon: Award,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: XCircle,
  },
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Panel de control general de Bordados Rocio
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm text-primary-700">
          <CalendarCheck className="h-4 w-4" />
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* === MAIN STATS GRID (6 cards) === */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Total Productos",
            value: data.totalProducts,
            icon: Shirt,
            color: "bg-blue-50 text-blue-600",
            ring: "ring-blue-200",
            href: "/admin/productos",
            trend: `${data.lowStockProducts} con stock bajo`,
            trendUp: false,
          },
          {
            label: "Categorías",
            value: data.totalCategories,
            icon: Tags,
            color: "bg-purple-50 text-purple-600",
            ring: "ring-purple-200",
            href: "/admin/categorias",
            trend: null,
            trendUp: false,
          },
          {
            label: "Alquileres Activos",
            value: data.activeRentals,
            icon: CalendarCheck,
            color: "bg-green-50 text-green-600",
            ring: "ring-green-200",
            href: "/admin/alquileres",
            trend: `${data.upcomingReturns.length} próximos a vencer`,
            trendUp: false,
          },
          {
            label: "Clientes",
            value: data.totalCustomers,
            icon: Users,
            color: "bg-amber-50 text-amber-600",
            ring: "ring-amber-200",
            href: "/admin/clientes",
            trend: null,
            trendUp: false,
          },
          {
            label: "Stock Bajo",
            value: data.lowStockProducts,
            icon: Package,
            color: data.lowStockProducts > 0
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600",
            ring: "ring-red-200",
            href: "/admin/productos",
            trend: "productos con ≤3 unidades",
            trendUp: false,
          },
          {
            label: "Alquileres del Mes",
            value: data.rentalsThisMonth,
            icon: TrendingUp,
            color: "bg-indigo-50 text-indigo-600",
            ring: "ring-indigo-200",
            href: "/admin/alquileres",
            trend: `${((data.rentalsThisMonth / (data.totalRentals || 1)) * 100).toFixed(0)}% del total`,
            trendUp: true,
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Hover gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-2.5 ${stat.color} ring-1 ring-inset ${stat.ring.replace("ring-", "ring-").replace("-200", "-100")}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 transition-all group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="mt-3 font-playfair text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              {stat.trend && (
                <p className={`mt-1.5 text-[11px] font-medium ${
                  stat.label === "Stock Bajo" && data.lowStockProducts > 0
                    ? "text-red-500"
                    : "text-gray-400"
                }`}>
                  {stat.trend}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* === SECONDARY STATS ROW (4 cards) === */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ingresos Totales */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-3 ring-1 ring-green-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-playfair text-xl font-bold text-gray-900">
                ${data.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Ingresos Totales</p>
            </div>
          </div>
        </div>

        {/* Cotizaciones Pendientes */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 p-3 ring-1 ring-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-playfair text-xl font-bold text-gray-900">
                {data.pendingQuotes}
              </p>
              <p className="text-xs text-gray-500">Cotizaciones Pendientes</p>
            </div>
          </div>
        </div>

        {/* Próximas Devoluciones */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-3 ring-1 ring-orange-100">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-playfair text-xl font-bold text-gray-900">
                {data.upcomingReturns.length}
              </p>
              <p className="text-xs text-gray-500">Próximas Devoluciones</p>
            </div>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-3 ring-1 ring-violet-100">
              <Star className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-playfair text-xl font-bold text-gray-900">
                {data.conversionRate}%
              </p>
              <p className="text-xs text-gray-500">Tasa de Conversión</p>
            </div>
          </div>
        </div>
      </div>

      {/* === MIDDLE ROW: Status Distribution + Top Products === */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-1">
            Distribución de Estados
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Estado actual de los {data.totalRentals} alquileres registrados
          </p>

          {data.totalRentals === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">Sin alquileres aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                {data.statusCounts.map((item) => {
                  const width =
                    data.totalRentals > 0
                      ? (item.count / data.totalRentals) * 100
                      : 0;
                  if (width === 0) return null;
                  const config = statusConfig[item.status as keyof typeof statusConfig];
                  return (
                    <div
                      key={item.status}
                      className={`${config.color} transition-all duration-500`}
                      style={{ width: `${width}%` }}
                      title={`${config.label}: ${item.count}`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.statusCounts.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig];
                  const percentage =
                    data.totalRentals > 0
                      ? ((item.count / data.totalRentals) * 100).toFixed(0)
                      : "0";
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.status}
                      className={`flex items-center gap-3 rounded-xl p-3 ${config.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${config.text}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${config.text}`}>
                          {item.count}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {config.label} · {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Productos más Alquilados */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-playfair text-lg font-semibold text-gray-900">
              Productos Más Alquilados
            </h2>
            <Link
              href="/admin/productos"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Top 5 prendas más solicitadas
          </p>

          {data.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Shirt className="h-8 w-8 mb-2" />
              <p className="text-sm">Sin productos alquilados aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product, index) => {
                const maxCount = data.topProducts[0]?._count.rentalItems || 1;
                const barWidth =
                  (product._count.rentalItems / maxCount) * 100;

                return (
                  <Link
                    key={product.id}
                    href={`/admin/productos/${product.id}/editar`}
                    className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50"
                  >
                    {/* Rank */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-700"
                          : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 text-sm">
                      👗
                    </div>

                    {/* Info + Bar */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 shrink-0">
                          {product._count.rentalItems} alq.
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* === BOTTOM ROW: Recent Rentals + Upcoming Returns === */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Rentals */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-playfair text-lg font-semibold text-gray-900">
              Alquileres Recientes
            </h2>
            <Link
              href="/admin/alquileres"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Últimos 5 movimientos registrados
          </p>

          {data.recentRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CalendarCheck className="h-8 w-8 mb-2" />
              <p className="text-sm">Sin alquileres recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentRentals.map((rental) => {
                const config =
                  statusConfig[rental.status as keyof typeof statusConfig] ||
                  statusConfig.pendiente;
                const StatusIcon = config.icon;
                const itemCount = rental.items.length;
                const itemNames = rental.items
                  .slice(0, 2)
                  .map((i) => i.product.name);

                return (
                  <Link
                    key={rental.id}
                    href={`/admin/alquileres/${rental.id}`}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
                  >
                    {/* Status icon */}
                    <div className={`rounded-lg p-2 ${config.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${config.text}`} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {rental.customer.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {itemNames.join(", ")}
                        {itemCount > 2
                          ? ` y ${itemCount - 2} más`
                          : ""}
                      </p>
                    </div>

                    {/* Date + Status */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">
                        {new Date(rental.createdAt).toLocaleDateString(
                          "es-ES",
                          { day: "numeric", month: "short" }
                        )}
                      </p>
                      <span
                        className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.text}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Returns */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-playfair text-lg font-semibold text-gray-900">
              Próximas Devoluciones
            </h2>
            <Link
              href="/admin/alquileres"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Alquileres activos que vencen en los próximos 7 días
          </p>

          {data.upcomingReturns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle2 className="h-8 w-8 mb-2" />
              <p className="text-sm">Sin devoluciones próximas</p>
              <p className="text-xs text-gray-300 mt-1">
                Todos los alquileres activos están al día
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingReturns.map((rental) => {
                const daysLeft = Math.ceil(
                  (rental.endDate.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <Link
                    key={rental.id}
                    href={`/admin/alquileres/${rental.id}`}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
                  >
                    {/* Urgency indicator */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                        daysLeft <= 1
                          ? "bg-red-100 text-red-600 ring-1 ring-red-200"
                          : daysLeft <= 3
                            ? "bg-amber-100 text-amber-600 ring-1 ring-amber-200"
                            : "bg-green-100 text-green-600 ring-1 ring-green-200"
                      }`}
                    >
                      {daysLeft}d
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {rental.customer.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Vence:{" "}
                        {rental.endDate.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>

                    {/* Days text */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-semibold ${
                          daysLeft <= 1
                            ? "text-red-600"
                            : daysLeft <= 3
                              ? "text-amber-600"
                              : "text-green-600"
                        }`}
                      >
                        {daysLeft === 0
                          ? "Hoy"
                          : daysLeft === 1
                            ? "Mañana"
                            : `${daysLeft} días`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm"
          >
            <div className="rounded-lg bg-primary-100 p-2">
              <Shirt className="h-4 w-4 text-primary-600" />
            </div>
            Nuevo Producto
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-secondary-200 hover:bg-secondary-50 hover:text-secondary-700 hover:shadow-sm"
          >
            <div className="rounded-lg bg-secondary-100 p-2">
              <Tags className="h-4 w-4 text-secondary-600" />
            </div>
            Gestionar Categorías
          </Link>
          <Link
            href="/admin/alquileres"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
          >
            <div className="rounded-lg bg-green-100 p-2">
              <CalendarCheck className="h-4 w-4 text-green-600" />
            </div>
            Ver Alquileres
          </Link>
          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:shadow-sm"
          >
            <div className="rounded-lg bg-amber-100 p-2">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            Ver Clientes
          </Link>
        </div>
      </div>
    </div>
  );
}
