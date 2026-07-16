"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import Image from "next/image";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const images = product.images.length > 0
    ? product.images
    : [{ id: 0, url: "", alt: "Imagen no disponible", isPrimary: true }];

  const currentImg = images[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo("prev");
      if (e.key === "ArrowRight") goTo("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbnailRef.current && images.length > 1) {
      const thumb = thumbnailRef.current.children[currentIndex] as HTMLElement;
      if (thumb) {
        thumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex, images.length]);

  const goTo = useCallback(
    (dir: "prev" | "next") => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex((prev) => {
        if (dir === "prev") return prev === 0 ? images.length - 1 : prev - 1;
        return prev === images.length - 1 ? 0 : prev + 1;
      });
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [images.length, isTransitioning]
  );

  const goToIndex = useCallback((idx: number) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(idx);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [currentIndex]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? "next" : "prev");
    }
    setTouchStart(null);
  };

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
          <Link href="/" className="hover:text-primary-600">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-primary-600">Catálogo</Link>
          <span>/</span>
          <Link href={`/catalogo?categoria=${product.category.slug}`} className="hover:text-primary-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* IMAGE CAROUSEL */}
          <div className="space-y-4">
            {/* Main image container */}
            <div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image counter badge */}
              {images.length > 1 && (
                <div className="absolute top-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2.5 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-90"
                aria-label="Compartir"
              >
                <Share2 size={18} />
              </button>

              {/* Image area */}
              <div className="relative flex h-[450px] sm:h-[500px] items-center justify-center overflow-hidden">
                {currentImg?.url ? (
                  <div className="absolute inset-0">
                    <Image
                      key={currentImg.id}
                      src={currentImg.url}
                      alt={currentImg.alt || product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`object-cover transition-all duration-500 ease-out ${
                        isTransitioning ? "scale-105 opacity-0" : "scale-100 opacity-100"
                      }`}
                      priority={currentIndex === 0}
                    />
                  </div>
                ) : (
                  <span className="text-8xl">👗</span>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => goTo("prev")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-2.5 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 hover:shadow-xl active:scale-90 opacity-0 group-hover:opacity-100 sm:opacity-100"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => goTo("next")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-2.5 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 hover:shadow-xl active:scale-90 opacity-0 group-hover:opacity-100 sm:opacity-100"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Dots indicator (mobile) */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 sm:hidden">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-primary-500"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Imagen ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div
                ref={thumbnailRef}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                style={{ scrollbarWidth: "thin", msOverflowStyle: "auto" }}
              >
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => goToIndex(idx)}
                    className={`relative flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      idx === currentIndex
                        ? "border-primary-500 ring-2 ring-primary-200 shadow-md"
                        : "border-gray-200 hover:border-primary-300 hover:shadow-sm opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-primary-50 to-secondary-50">
                      {img.url ? (
                        <Image
                          src={img.url}
                          alt={img.alt || product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xl">👗</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
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
                * Depósito de garantía: ${product.depositPrice.toFixed(2)} (reembolsable)
              </p>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-playfair text-lg font-semibold text-gray-900">Descripción</h3>
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

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">
              También te puede gustar
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rp) => {
                const rpImage = rp.images[0];
                return (
                  <Link key={rp.id} href={`/catalogo/${rp.slug}`} className="group">
                    <div className="overflow-hidden rounded-xl bg-gray-50">
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-50 to-secondary-50">
                        {rpImage?.url ? (
                          <Image
                            src={rpImage.url}
                            alt={rpImage.alt || rp.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-5xl transition-transform duration-500 group-hover:scale-110">👗</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-3 font-playfair text-base font-semibold text-gray-900 group-hover:text-primary-600">
                      {rp.name}
                    </h3>
                    <p className="text-sm text-gray-500">${rp.rentalPrice.toFixed(2)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Share toast */}
        {showShareToast && (
          <div className="fixed bottom-8 right-8 rounded-xl bg-gray-900 px-6 py-3 text-sm text-white shadow-2xl animate-bounce">
            ¡Enlace copiado!
          </div>
        )}
      </div>
    </div>
  );
}
