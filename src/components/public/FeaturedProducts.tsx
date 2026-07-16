import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl">
              Productos Destacados
            </h2>
            <p className="mt-2 text-gray-500">
              Las prendas más populares de nuestra colección
            </p>
          </div>
          <Link
            href="/catalogo"
            className="hidden items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 sm:flex"
          >
            Ver todos <span>→</span>
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const primaryImage = product.images[0];

            return (
              <Link
                key={product.id}
                href={`/catalogo/${product.slug}`}
                className="group"
              >
                <div className="overflow-hidden rounded-2xl bg-gray-50">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary-500">
                    {product.category.name}
                  </span>
                  <h3 className="font-playfair text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Desde ${product.rentalPrice.toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 rounded-full border-2 border-primary-200 px-6 py-3 text-sm font-semibold text-primary-600 transition-all hover:border-primary-300 hover:bg-primary-50"
          >
            Ver todos los productos <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
