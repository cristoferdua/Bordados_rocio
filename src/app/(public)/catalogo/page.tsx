import { prisma } from "@/lib/prisma";
import { CatalogClient } from "./CatalogClient";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const params = await searchParams;
  const categoriaSlug = params.categoria;

  const where: any = { isAvailable: true };
  if (categoriaSlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categoriaSlug },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="font-playfair text-4xl font-bold text-gray-900">
            Catálogo
          </h1>
          <p className="mt-2 text-gray-500">
            Explora nuestra colección de vestimentas elegantes
          </p>
        </div>

        <CatalogClient
          initialProducts={products}
          categories={categories}
          initialCategorySlug={categoriaSlug}
        />
      </div>
    </div>
  );
}
