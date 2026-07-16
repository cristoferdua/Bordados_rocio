import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const rentals = await prisma.rental.findMany({
      where: {
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
          take: 3,
        },
      },
      orderBy: { startDate: "asc" },
    });

    const events = rentals.map((rental) => ({
      id: rental.id,
      title: rental.customer.name,
      startDate: rental.startDate.toISOString(),
      endDate: rental.endDate.toISOString(),
      status: rental.status,
      totalPrice: rental.totalPrice,
      products: rental.items.map((i) => i.product.name),
      productCount: rental.items.length,
    }));

    // Get month summary
    const monthRentals = rentals.filter(
      (r) =>
        r.startDate >= startDate && r.startDate <= endDate
    );

    const summary = {
      total: monthRentals.length,
      activos: monthRentals.filter((r) => r.status === "activo").length,
      completados: monthRentals.filter((r) => r.status === "completado").length,
      cotizaciones: monthRentals.filter((r) => r.status === "cotizacion").length,
      ingresos: monthRentals
        .filter((r) => r.status === "completado")
        .reduce((s, r) => s + (r.totalPrice || 0), 0),
    };

    return NextResponse.json({
      events,
      summary,
      month,
      year,
    });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Error al cargar calendario" },
      { status: 500 }
    );
  }
}
