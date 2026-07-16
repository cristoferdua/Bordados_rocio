import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

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
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-playfair text-4xl font-bold text-gray-900">
            Catálogo
          </h1>
          <p className="mt-2 text-gray-500">
            Explora nuestra colección de vestimentas elegantes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-playfair text-lg font-semibold text-gray-900">
                  Categorías
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link
                      href="/catalogo"
                      className="text-sm text-primary-600 font-medium"
                    >
                      Todas las categorías
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/catalogo?categoria=${cat.slug}`}
                        className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-6 text-white">
                <h3 className="font-playfair text-lg font-semibold">
                  ¿Necesitas ayuda?
                </h3>
                <p className="mt-2 text-sm text-primary-100">
                  Contáctanos y te ayudaremos a encontrar el look perfecto
                </p>
                <Link
                  href="/contacto"
                  className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  Contactar →
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center">
                <span className="text-6xl">👗</span>
                <h2 className="mt-4 font-playfair text-xl font-semibold text-gray-900">
                  Próximamente
                </h2>
                <p className="mt-2 text-gray-500">
                  Estamos actualizando nuestro catálogo. ¡Vuelve pronto!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const primaryImage = product.images[0];

                  return (
                    <Link
                      key={product.id}
                      href={`/catalogo/${product.slug}`}
                      className="group"
                    >
                      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.alt || product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-6xl transition-transform duration-500 group-hover:scale-110">
                                👗
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                            <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-600 backdrop-blur-sm">
                              Ver detalle →
                            </span>
                          </div>
                          {!product.isAvailable && (
                            <div className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                              No disponible
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-4">
                          <span className="text-xs font-medium uppercase tracking-wider text-primary-500">
                            {product.category.name}
                          </span>
                          <h3 className="font-playfair text-base font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              ${product.rentalPrice.toFixed(2)}
                            </p>
                            <span className="text-xs text-gray-400">
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
