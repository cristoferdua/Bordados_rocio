"use client";

import { useState } from "react";
import { Send, Check, Loader2, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactoPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    mensaje: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-white to-primary-50/30">
        <div className="text-center max-w-lg px-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 font-playfair text-3xl font-bold text-gray-900">
            ¡Mensaje Enviado!
          </h1>
          <p className="mt-4 text-gray-500">
            Gracias por contactarnos. Te responderemos a la brevedad posible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-4xl font-bold text-gray-900">
            Contáctanos
          </h1>
          <p className="mt-2 text-gray-500">
            Estamos aquí para ayudarte a encontrar el look perfecto
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-8">
                Información de Contacto
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    label: "Dirección",
                    value: "Centro, Tu Ciudad",
                  },
                  {
                    icon: Phone,
                    label: "Teléfono",
                    value: "+52 555 123 4567",
                    href: "tel:+525551234567",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "info@bordadosrocio.com",
                    href: "mailto:info@bordadosrocio.com",
                  },
                  {
                    icon: Clock,
                    label: "Horario",
                    value: "Lunes a Sábado: 9:00 - 19:00",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                      <item.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-8 text-white">
              <h3 className="font-playfair text-xl font-semibold">
                ¿Prefieres visitarnos?
              </h3>
              <p className="mt-2 text-primary-100">
                Te esperamos en nuestro local para que puedas ver y probar
                nuestras prendas personalmente.
              </p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <MapPin className="h-4 w-4" />
                Cómo llegar
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-6">
              Envíanos un Mensaje
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Tu nombre"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
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
                    placeholder="Tu teléfono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Tu email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.mensaje}
                  onChange={(e) =>
                    setFormData({ ...formData, mensaje: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
