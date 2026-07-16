import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1
    );

    // Get all completed rentals with totalPrice from the last 12 months
    const rentals = await prisma.rental.findMany({
      where: {
        status: "completado",
        totalPrice: { not: null },
        endDate: { gte: twelveMonthsAgo },
      },
      select: {
        totalPrice: true,
        endDate: true,
      },
      orderBy: { endDate: "asc" },
    });

    // Group by month
    const monthlyData: Record<string, number> = {};

    // Initialize all 12 months with 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = 0;
    }

    // Sum up rentals by month
    for (const rental of rentals) {
      if (!rental.endDate || !rental.totalPrice) continue;
      const key = `${rental.endDate.getFullYear()}-${String(rental.endDate.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += rental.totalPrice;
      }
    }

    // Format for the chart
    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];

    const chartData = Object.entries(monthlyData).map(([key, total]) => {
      const [, monthStr] = key.split("-");
      const monthIndex = parseInt(monthStr, 10) - 1;
      return {
        month: monthNames[monthIndex],
        key,
        ingresos: Math.round(total * 100) / 100,
      };
    });

    const totalRevenue = chartData.reduce((sum, d) => sum + d.ingresos, 0);
    const currentMonth = chartData[chartData.length - 1]?.ingresos || 0;
    const previousMonth = chartData[chartData.length - 2]?.ingresos || 0;
    const monthlyGrowth =
      previousMonth > 0
        ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
        : 0;

    // Find best month
    const bestMonth = [...chartData].sort((a, b) => b.ingresos - a.ingresos)[0];

    return NextResponse.json({
      chartData,
      totalRevenue,
      currentMonth,
      previousMonth,
      monthlyGrowth,
      bestMonth: bestMonth || null,
    });
  } catch (error) {
    console.error("Error fetching income data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de ingresos" },
      { status: 500 }
    );
  }
}
