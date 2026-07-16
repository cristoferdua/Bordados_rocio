import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "inventario";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter =
      from || to
        ? {
            gte: from ? new Date(from) : new Date("2000-01-01"),
            lte: to ? new Date(to) : new Date(),
          }
        : undefined;

    switch (type) {
      case "inventario": {
        const products = await prisma.product.findMany({
          include: {
            category: true,
            _count: { select: { rentalItems: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
          orderBy: { name: "asc" },
        });

        const summary = {
          totalProductos: products.length,
          totalStock: products.reduce((s, p) => s + p.stock, 0),
          disponibles: products.filter((p) => p.isAvailable).length,
          noDisponibles: products.filter((p) => !p.isAvailable).length,
          stockBajo: products.filter((p) => p.stock <= 3 && p.isAvailable)
            .length,
          valorInventario: products.reduce(
            (s, p) => s + p.rentalPrice * p.stock,
            0
          ),
        };

        const data = products.map((p) => ({
          id: p.id,
          nombre: p.name,
          categoria: p.category.name,
          precioAlquiler: p.rentalPrice,
          deposito: p.depositPrice || 0,
          stock: p.stock,
          disponible: p.isAvailable,
          vecesAlquilado: p._count.rentalItems,
          createdAt: p.createdAt.toISOString(),
        }));

        return NextResponse.json({ summary, data, type: "inventario" });
      }

      case "alquileres": {
        const rentals = await prisma.rental.findMany({
          include: {
            customer: true,
            items: { include: { product: true } },
          },
          where: dateFilter
            ? { createdAt: dateFilter }
            : undefined,
          orderBy: { createdAt: "desc" },
        });

        const summary = {
          total: rentals.length,
          cotizacion: rentals.filter((r) => r.status === "cotizacion").length,
          pendiente: rentals.filter((r) => r.status === "pendiente").length,
          activo: rentals.filter((r) => r.status === "activo").length,
          completado: rentals.filter((r) => r.status === "completado").length,
          cancelado: rentals.filter((r) => r.status === "cancelado").length,
          ingresos: rentals
            .filter((r) => r.status === "completado")
            .reduce((s, r) => s + (r.totalPrice || 0), 0),
        };

        const data = rentals.map((r) => ({
          id: r.id,
          cliente: r.customer.name,
          telefono: r.customer.phone || "",
          productos: r.items.map((i) => i.product.name).join(", "),
          totalProductos: r.items.length,
          fechaInicio: r.startDate.toISOString(),
          fechaFin: r.endDate.toISOString(),
          fechaDevolucion: r.returnDate?.toISOString() || "",
          estado: r.status,
          total: r.totalPrice || 0,
          notas: r.notes || "",
          createdAt: r.createdAt.toISOString(),
        }));

        return NextResponse.json({ summary, data, type: "alquileres" });
      }

      case "ingresos": {
        const rentals = await prisma.rental.findMany({
          where: {
            status: "completado",
            totalPrice: { not: null },
            ...(dateFilter ? { endDate: dateFilter } : {}),
          },
          include: { customer: true },
          orderBy: { endDate: "desc" },
        });

        const summary = {
          totalIngresos: rentals.reduce((s, r) => s + (r.totalPrice || 0), 0),
          totalAlquileres: rentals.length,
          promedioPorAlquiler:
            rentals.length > 0
              ? rentals.reduce((s, r) => s + (r.totalPrice || 0), 0) /
                rentals.length
              : 0,
        };

        const data = rentals.map((r) => ({
          id: r.id,
          cliente: r.customer.name,
          monto: r.totalPrice || 0,
          fecha: r.endDate?.toISOString() || "",
          estado: r.status,
        }));

        return NextResponse.json({ summary, data, type: "ingresos" });
      }

      case "clientes": {
        const customers = await prisma.customer.findMany({
          include: {
            _count: { select: { rentals: true } },
            rentals: {
              where: { status: "completado" },
              select: { totalPrice: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const summary = {
          total: customers.length,
          conTelefono: customers.filter((c) => c.phone).length,
          conEmail: customers.filter((c) => c.email).length,
          conAlquileres: customers.filter((c) => c._count.rentals > 0).length,
        };

        const data = customers.map((c) => ({
          id: c.id,
          nombre: c.name,
          telefono: c.phone || "",
          email: c.email || "",
          notas: c.notes || "",
          totalAlquileres: c._count.rentals,
          gastoTotal: c.rentals.reduce((s, r) => s + (r.totalPrice || 0), 0),
          createdAt: c.createdAt.toISOString(),
        }));

        return NextResponse.json({ summary, data, type: "clientes" });
      }

      default:
        return NextResponse.json(
          { error: "Tipo de reporte inválido" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
