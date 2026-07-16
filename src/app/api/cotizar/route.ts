import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, email, evento, fecha, notas, products } = body;

    // Validate required fields
    if (!nombre || !telefono) {
      return NextResponse.json(
        { error: "Nombre y teléfono son requeridos" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: telefono },
          ...(email ? [{ email }] : []),
        ] as any,
      },
    });

    const customerNotes = [
      `Cotización - ${evento || "No especificado"}`,
      fecha ? `Fecha: ${fecha}` : "",
      notas || "",
    ]
      .filter(Boolean)
      .join(". ");

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: nombre,
          phone: telefono,
          email: email || null,
          notes: customerNotes,
        },
      });
    }

    // Create a rental with "cotizacion" status
    const startDate = fecha ? new Date(fecha) : new Date();
    const endDate = fecha
      ? new Date(new Date(fecha).getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const rental = await prisma.rental.create({
      data: {
        customerId: customer.id,
        startDate,
        endDate,
        status: "cotizacion",
        notes: `Cotización - Evento: ${evento || "No especificado"}. ${notas || ""}`,
      },
    });

    // Add multiple products if selected
    let totalPrice = 0;

    if (products && Array.isArray(products) && products.length > 0) {
      for (const item of products) {
        const product = await prisma.product.findUnique({
          where: { id: Number(item.productId) },
        });

        if (product) {
          const quantity = Math.max(1, Number(item.quantity) || 1);
          await prisma.rentalItem.create({
            data: {
              rentalId: rental.id,
              productId: product.id,
              quantity,
              unitPrice: product.rentalPrice,
            },
          });
          totalPrice += product.rentalPrice * quantity;
        }
      }
    }

    if (totalPrice > 0) {
      await prisma.rental.update({
        where: { id: rental.id },
        data: { totalPrice },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cotización recibida exitosamente",
      total: totalPrice,
    });
  } catch (error) {
    console.error("Error en cotización:", error);
    return NextResponse.json(
      { error: "Error al procesar la cotización" },
      { status: 500 }
    );
  }
}
