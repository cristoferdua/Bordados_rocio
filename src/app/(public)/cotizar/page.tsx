"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Send, Check, Loader2, Plus, Minus, ShoppingCart, Trash2, Search } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  rentalPrice: number;
  depositPrice: number | null;
  stock: number;
  category: { id: number; name: string; slug: string };
  images: { url: string; alt: string | null; isPrimary: boolean }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>;
}) {
  const params = use(searchParams);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    evento: "",
    fecha: "",
    notas: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/productos").then((res) => res.json()),
      fetch("/api/categorias").then((res) => res.json()),
    ]).then(([prods, cats]: [Product[], Category[]]) => {
      setProducts(prods);
      setCategories(cats);
      setIsLoading(false);

      // Pre-select product from URL param
      if (params.producto) {
        const found = prods.find((p) => p.slug === params.producto);
        if (found) {
          addToCart(found);
        }
      }
    });
  }, [params.producto]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.rentalPrice,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          products: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        setFormSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formSubmitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-white to-primary-50/30">
        <div className="text-center max-w-lg px-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 font-playfair text-3xl font-bold text-gray-900">
            ¡Cotización Enviada!
          </h1>
          <p className="mt-4 text-gray-500">
            Gracias por tu interés. Te hemos enviado un resumen con
            {totalItems > 0
              ? ` ${totalItems} prenda(s) por $${totalPrice.toFixed(2)}`
              : ""}
            . Nos pondremos en contacto contigo muy pronto.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105"
          >
            Seguir Viendo el Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-4xl font-bold text-gray-900">
            Solicitar Cotización
          </h1>
          <p className="mt-2 text-gray-500">
            Selecciona las prendas que necesitas y te enviaremos un presupuesto
            personalizado
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Left: Product Selector */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Browser */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-6">
                Selecciona las Prendas
              </h2>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar prendas..."
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-4xl">👗</span>
                  <p className="mt-4 text-gray-500">
                    No se encontraron productos
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find(
                      (item) => item.productId === product.id
                    );
                    return (
                      <div
                        key={product.id}
                        className={`group relative rounded-xl border-2 p-4 transition-all ${
                          inCart
                            ? "border-primary-400 bg-primary-50/50 shadow-md"
                            : "border-gray-100 hover:border-primary-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 flex-shrink-0">
                            <span className="text-2xl">👗</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium uppercase tracking-wider text-primary-500">
                              {product.category.name}
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-sm font-bold text-primary-600 mt-1">
                              ${product.rentalPrice.toFixed(2)}
                            </p>
                            {product.depositPrice && (
                              <p className="text-xs text-gray-400">
                                Depósito: ${product.depositPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              inCart
                                ? removeFromCart(product.id)
                                : addToCart(product)
                            }
                            className={`flex-shrink-0 rounded-lg p-2 transition-all ${
                              inCart
                                ? "bg-primary-500 text-white hover:bg-primary-600"
                                : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                            }`}
                          >
                            {inCart ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <Plus className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {inCart && (
                          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-primary-100">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    (inCart?.quantity || 1) - 1
                                  )
                                }
                                className="rounded-md p-1 text-gray-400 hover:bg-primary-100 hover:text-primary-600"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                {inCart?.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    (inCart?.quantity || 1) + 1
                                  )
                                }
                                className="rounded-md p-1 text-gray-400 hover:bg-primary-100 hover:text-primary-600"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-xs text-gray-400">
                              = ${(
                                product.rentalPrice * (inCart?.quantity || 1)
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Data */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-6">
                Tus Datos
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Ej: María García"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Ej: +52 555 123 4567"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Ej: maria@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-6">
                Detalles del Evento
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de evento <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.evento}
                    onChange={(e) =>
                      setFormData({ ...formData, evento: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">— Selecciona —</option>
                    <option value="boda">Boda</option>
                    <option value="graduacion">Graduación</option>
                    <option value="gala">Evento de Gala</option>
                    <option value="quinceanera">Quinceañera</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del evento
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  rows={3}
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                  placeholder="Colores, tallas, accesorios adicionales que necesitas..."
                />
              </div>
            </div>
          </div>

          {/* Right: Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-xl bg-primary-50 p-2.5">
                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-lg font-semibold text-gray-900">
                      Tu Cotización
                    </h2>
                    <p className="text-xs text-gray-400">
                      {totalItems} prenda{totalItems !== 1 ? "s" : ""}{" "}
                      seleccionada{totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <span className="text-4xl">🛒</span>
                    <p className="mt-3 text-sm text-gray-400">
                      No has seleccionado ninguna prenda aún
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Explora el catálogo de la izquierda y haz clic en +
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 flex-shrink-0">
                            <span className="text-lg">👗</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-primary-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-semibold text-gray-900">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Depósito de garantía
                        </span>
                        <span className="text-gray-400">Por definir</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="font-playfair text-base font-bold text-gray-900">
                          Total estimado
                        </span>
                        <span className="font-playfair text-xl font-bold text-primary-600">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-primary-200 transition-all hover:shadow-2xl hover:shadow-primary-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {cart.length === 0
                      ? "Selecciona prendas"
                      : `Enviar Cotización (${totalItems})`}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Te responderemos a la brevedad con un presupuesto detallado sin
                compromiso
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
