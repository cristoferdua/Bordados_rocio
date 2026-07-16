import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      overdueReturns,
      dueSoonReturns,
      pendingQuotes,
      activeRentalsCount,
    ] = await Promise.all([
      // Overdue: active rentals past their end date
      prisma.rental.findMany({
        where: {
          status: "activo",
          endDate: { lt: now },
        },
        include: { customer: true },
        orderBy: { endDate: "asc" },
        take: 5,
      }),

      // Due soon: active rentals ending in the next 3 days
      prisma.rental.findMany({
        where: {
          status: "activo",
          endDate: { gte: now, lte: in3Days },
        },
        include: { customer: true },
        orderBy: { endDate: "asc" },
        take: 10,
      }),

      // Pending quotes count
      prisma.rental.count({
        where: { status: "cotizacion" },
      }),

      // Active rentals total
      prisma.rental.count({
        where: { status: "activo" },
      }),
    ]);

    // Also count all rentals that end within the next 7 days (for badge)
    const endingIn7Days = await prisma.rental.count({
      where: {
        status: "activo",
        endDate: { gte: now, lte: in7Days },
      },
    });

    // Deduplicate overdue from dueSoon
    const overdueIds = new Set(overdueReturns.map((r) => r.id));
    const uniqueDueSoon = dueSoonReturns.filter(
      (r) => !overdueIds.has(r.id)
    );

    const alerts = [];

    // Overdue alerts
    if (overdueReturns.length > 0) {
      alerts.push({
        id: "overdue",
        type: "error" as const,
        title: "Alquileres vencidos",
        message: `${overdueReturns.length} alquiler${overdueReturns.length === 1 ? "" : "es"} debieron devolverse.`,
        details: overdueReturns.map((r) => ({
          id: r.id,
          customer: r.customer.name,
          days: Math.ceil((now.getTime() - r.endDate.getTime()) / (1000 * 60 * 60 * 24)),
          endDate: r.endDate.toISOString(),
        })),
        count: overdueReturns.length,
      });
    }

    // Due soon alerts
    if (uniqueDueSoon.length > 0) {
      alerts.push({
        id: "due-soon",
        type: "warning" as const,
        title: "Próximas devoluciones",
        message: `${uniqueDueSoon.length} alquiler${uniqueDueSoon.length === 1 ? "" : "es"} vencen en los próximos 3 días.`,
        details: uniqueDueSoon.map((r) => ({
          id: r.id,
          customer: r.customer.name,
          days: Math.ceil((r.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          endDate: r.endDate.toISOString(),
        })),
        count: uniqueDueSoon.length,
      });
    }

    // Pending quotes
    if (pendingQuotes > 0) {
      alerts.push({
        id: "pending-quotes",
        type: "info" as const,
        title: "Cotizaciones pendientes",
        message: `Tienes ${pendingQuotes} cotización${pendingQuotes === 1 ? "" : "es"} sin responder.`,
        details: [],
        count: pendingQuotes,
      });
    }

    return NextResponse.json({
      alerts,
      totalAlerts: alerts.length,
      badgeCount: endingIn7Days + pendingQuotes,
      activeRentals: activeRentalsCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}
