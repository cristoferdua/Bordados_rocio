import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, returnDate } = body;

    const data: any = { status };
    if (returnDate) {
      data.returnDate = new Date(returnDate);
    }

    const rental = await prisma.rental.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(rental);
  } catch (error) {
    console.error("Error updating rental:", error);
    return NextResponse.json(
      { error: "Error al actualizar el alquiler" },
      { status: 500 }
    );
  }
}
