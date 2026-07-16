"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, TrendingUp } from "lucide-react";

interface ProductImage {
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  rentalPrice: number;
  stock: number;
  isAvailable: boolean;
  category: { id: number; name: string; slug: string };
  images: ProductImage[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
}

export function CatalogClient({
  initialProducts,
  categories,
  initialCategorySlug,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategorySlug || ""
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter products by search and category
  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Autocomplete suggestions (top 5 matches)
  const suggestions = searchQuery.trim()
    ? initialProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedCategory || p.category.slug === selectedCategory)
        )
        .slice(0, 5)
    : [];

  const hasResults = filteredProducts.length > 0;

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter" && searchQuery.trim()) {
          setShowSuggestions(false);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            const product = suggestions[activeIndex];
            window.location.href = `/catalogo/${product.slug}`;
          } else {
            setShowSuggestions(false);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setActiveIndex(-1);
          break;
      }
    },
    [showSuggestions, suggestions, activeIndex, searchQuery]
  );

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div ref={searchRef} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
              }}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar vestidos, trajes, accesorios..."
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 pl-12 pr-12 text-base shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50">
                Sugerencias
              </div>
              {suggestions.map((product, idx) => (
                <Link
                  key={product.id}
                  href={`/catalogo/${product.slug}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                    idx === activeIndex
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50">
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">👗</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {product.category.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary-600 flex-shrink-0">
                    ${product.rentalPrice.toFixed(2)}
                  </p>
                </Link>
              ))}
              <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 bg-gray-50">
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px]">↑↓</kbd> Navegar{" "}
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px]">Enter</kbd> Seleccionar{" "}
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px]">Esc</kbd> Cerrar
              </div>
            </div>
          )}

          {/* Search meta info */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>
                {searchQuery
                  ? `${filteredProducts.length} resultado${
                      filteredProducts.length !== 1 ? "s" : ""
                    }`
                  : `${initialProducts.length} prendas disponibles`}
              </span>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <X className="h-3 w-3" />
                <span className="text-xs font-medium">Limpiar filtro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-playfair text-lg font-semibold text-gray-900">
                Categorías
              </h3>
              <ul className="mt-4 space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      !selectedCategory
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    Todas las categorías
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        ({cat._count.products})
                      </span>
                    </button>
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
          {!hasResults ? (
            <div className="rounded-2xl bg-white p-12 text-center">
              <span className="text-6xl">🔍</span>
              <h2 className="mt-4 font-playfair text-xl font-semibold text-gray-900">
                {searchQuery
                  ? "No encontramos lo que buscas"
                  : "Próximamente"}
              </h2>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? `No hay resultados para "${searchQuery}". Intenta con otros términos.`
                  : "Estamos actualizando nuestro catálogo. ¡Vuelve pronto!"}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  <X className="h-4 w-4" />
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Category chips (mobile) */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 lg:hidden">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    !selectedCategory
                      ? "bg-primary-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-primary-500 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Results count */}
              <p className="mb-4 text-sm text-gray-400 lg:hidden">
                {filteredProducts.length} prenda
                {filteredProducts.length !== 1 ? "s" : ""}
                {selectedCategory
                  ? ` en ${categories.find((c) => c.slug === selectedCategory)?.name}`
                  : ""}
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
