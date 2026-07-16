"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";

interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  rentalPrice: number;
  depositPrice: number | null;
  stock: number;
  isAvailable: boolean;
  category: Category;
  images: ProductImage[];
}

interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  rentalPrice: number;
  images: ProductImage[];
}

interface Props {
  product: Product;
  relatedProducts: RelatedProduct[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);

  const images = product.images.length > 0 
    ? product.images 
    : [{ id: 0, url: "", alt: "Imagen no disponible", isPrimary: true }];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-primary-600">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-primary-600">
            Catálogo
          </Link>
          <span>/</span>
          <Link
            href={`/catalogo?categoria=${product.category.slug}`}
            className="hover:text-primary-600"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50">
              <div className="flex h-[500px] items-center justify-center">
                <span className="text-8xl">👗</span>
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(idx)}
                    className={`overflow-hidden rounded-xl border-2 transition-all ${
                      idx === currentImage
                        ? "border-primary-500 ring-2 ring-primary-200"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                      <span className="text-2xl">👗</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-primary-500">
                {product.category.name}
              </span>
              <h1 className="mt-2 font-playfair text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <p className="font-playfair text-4xl font-bold text-primary-600">
                ${product.rentalPrice.toFixed(2)}
              </p>
              <span className="text-sm text-gray-400">/ por evento</span>
            </div>

            {product.depositPrice && (
              <p className="text-sm text-gray-500">
                * Depósito de garantía: ${product.depositPrice.toFixed(2)}
                (reembolsable)
              </p>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-playfair text-lg font-semibold text-gray-900">
                Descripción
              </h3>
              <p className="mt-2 leading-relaxed text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.isAvailable
                  ? `Disponible (Stock: ${product.stock})`
                  : "No disponible"}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-6">
              <Link
                href={`/cotizar?producto=${product.slug}`}
                className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary-200 transition-all hover:shadow-2xl hover:shadow-primary-300 hover:scale-105 active:scale-95"
              >
                Solicitar Cotización
              </Link>
              <Link
                href="/contacto"
                className="rounded-full border-2 border-primary-200 px-8 py-3.5 text-sm font-semibold text-primary-600 transition-all hover:border-primary-300 hover:bg-primary-50"
              >
                Consultar Disponibilidad
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">
              También te puede gustar
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/catalogo/${rp.slug}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-xl bg-gray-50">
                    <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                      <span className="text-5xl transition-transform duration-500 group-hover:scale-110">
                        👗
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-3 font-playfair text-base font-semibold text-gray-900 group-hover:text-primary-600">
                    {rp.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ${rp.rentalPrice.toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Share Toast */}
        {showShareToast && (
          <div className="fixed bottom-8 right-8 rounded-xl bg-gray-900 px-6 py-3 text-sm text-white shadow-2xl animate-bounce">
            ¡Enlace copiado!
          </div>
        )}
      </div>
    </div>
  );
}
