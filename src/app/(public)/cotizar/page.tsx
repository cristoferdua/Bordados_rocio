"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Send, Check, Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  rentalPrice: number;
  category: { name: string };
}

export default function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>;
}) {
  const params = use(searchParams);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    evento: "",
    fecha: "",
    notas: "",
  });

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        if (params.producto) {
          const found = data.find(
            (p: Product) => p.slug === params.producto
          );
          if (found) setSelectedProduct(String(found.id));
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productId: selectedProduct ? Number(selectedProduct) : null,
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
            Gracias por tu interés. Nos pondremos en contacto contigo muy pronto
            para darte un presupuesto personalizado.
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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-4xl font-bold text-gray-900">
            Solicitar Cotización
          </h1>
          <p className="mt-2 text-gray-500">
            Cuéntanos qué necesitas y te enviaremos un presupuesto sin compromiso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-6">
              Producto de Interés
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona una prenda (opcional)
              </label>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando productos...
                </div>
              ) : (
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">— Selecciona una prenda —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.rentalPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

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
                rows={4}
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                placeholder="Cuéntanos más detalles: colores, tallas, accesorios que necesitas..."
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-10 py-4 text-sm font-semibold text-white shadow-xl shadow-primary-200 transition-all hover:shadow-2xl hover:shadow-primary-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar Cotización
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
