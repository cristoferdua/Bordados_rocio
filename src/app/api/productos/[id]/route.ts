import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true, category: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el producto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, rentalPrice, depositPrice, stock, categoryId, isAvailable, images } = body;

    // Delete existing images and create new ones
    await prisma.productImage.deleteMany({
      where: { productId: parseInt(id) },
    });

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        rentalPrice,
        depositPrice: depositPrice || null,
        stock,
        categoryId,
        isAvailable,
        images: {
          create:
            images?.length > 0
              ? images.map((url: string, index: number) => ({
                  url,
                  alt: name,
                  isPrimary: index === 0,
                }))
              : [
                  {
                    url: "/images/placeholder-1.svg",
                    alt: name,
                    isPrimary: true,
                  },
                ],
        },
      },
      include: { images: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Delete related records first
    await prisma.productImage.deleteMany({
      where: { productId: parseInt(id) },
    });
    await prisma.rentalItem.deleteMany({
      where: { productId: parseInt(id) },
    });
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
