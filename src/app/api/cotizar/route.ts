import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, email, evento, fecha, notas, productId } = body;

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
          email ? { email } : { id: -1 },
        ].filter(Boolean) as any,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: nombre,
          phone: telefono,
          email: email || null,
          notes: `Cotización - ${evento || "No especificado"}${fecha ? ` - Fecha: ${fecha}` : ""}${notas ? ` - ${notas}` : ""}`,
        },
      });
    }

    // Create a rental with "cotizacion" status
    const rentalData: any = {
      customerId: customer.id,
      startDate: fecha ? new Date(fecha) : new Date(),
      endDate: fecha ? new Date(new Date(fecha).getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "cotizacion",
      notes: `Cotización - Evento: ${evento || "No especificado"}. ${notas || ""}`,
    };

    const rental = await prisma.rental.create({
      data: rentalData,
    });

    // Add product if selected
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (product) {
        await prisma.rentalItem.create({
          data: {
            rentalId: rental.id,
            productId: product.id,
            quantity: 1,
            unitPrice: product.rentalPrice,
          },
        });

        await prisma.rental.update({
          where: { id: rental.id },
          data: { totalPrice: product.rentalPrice },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cotización recibida exitosamente",
    });
  } catch (error) {
    console.error("Error en cotización:", error);
    return NextResponse.json(
      { error: "Error al procesar la cotización" },
      { status: 500 }
    );
  }
}
