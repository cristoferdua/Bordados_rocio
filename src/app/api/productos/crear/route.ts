import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, rentalPrice, depositPrice, stock, categoryId, isAvailable, images } = body;

    const product = await prisma.product.create({
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
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
