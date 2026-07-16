import Link from "next/link";
import { FeaturedProducts } from "@/components/public/FeaturedProducts";
import { Testimonials } from "@/components/public/Testimonials";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="absolute -left-40 bottom-20 h-80 w-80 rounded-full bg-secondary-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                Colección 2026
              </div>

              <h1 className="font-playfair text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Elegancia que
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {" "}
                  transforma{" "}
                </span>
                tu evento especial
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-gray-600">
                En Bordados Rocio encontrarás la vestimenta perfecta para ese
                momento único. Novias, damas de honor, caballeros y más.
                Alquilamos elegancia.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/catalogo"
                  className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary-200 transition-all hover:shadow-2xl hover:shadow-primary-300 hover:scale-105 active:scale-95"
                >
                  Explorar Catálogo
                </Link>
                <Link
                  href="/cotizar"
                  className="rounded-full border-2 border-primary-200 bg-white px-8 py-3.5 text-sm font-semibold text-primary-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:scale-105 active:scale-95"
                >
                  Cotizar Ahora
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 border-t border-primary-100/50 pt-8">
                {[
                  { number: "200+", label: "Prendas" },
                  { number: "500+", label: "Clientes Felices" },
                  { number: "15+", label: "Años de Experiencia" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-playfair text-2xl font-bold text-primary-600">
                      {stat.number}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 shadow-2xl">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <span className="text-8xl">💎</span>
                    <p className="mt-4 font-playfair text-xl font-semibold text-primary-700">
                      Bordados Rocio
                    </p>
                    <p className="text-sm text-primary-500">
                      Elegancia y Distinción
                    </p>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -right-4 top-10 animate-float rounded-lg bg-white/80 p-3 shadow-lg backdrop-blur-sm">
                  <span className="text-2xl">👗</span>
                </div>
                <div className="absolute -left-4 bottom-20 animate-float rounded-lg bg-white/80 p-3 shadow-lg backdrop-blur-sm" style={{ animationDelay: "1s" }}>
                  <span className="text-2xl">🤵</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl">
              Nuestras Categorías
            </h2>
            <p className="mt-4 text-gray-500">
              Encuentra el estilo perfecto para cada ocasión
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "👰",
                title: "Vestidos de Novia",
                desc: "El vestido de tus sueños para el día más especial",
              },
              {
                icon: "🌙",
                title: "Vestidos de Noche",
                desc: "Elegancia y glamour para eventos nocturnos",
              },
              {
                icon: "👗",
                title: "Trajes para Dama",
                desc: "Trajes de dama de honor y madrina",
              },
              {
                icon: "🤵",
                title: "Trajes de Caballero",
                desc: "Trajes formales para todo tipo de evento",
              },
              {
                icon: "💍",
                title: "Accesorios",
                desc: "Complementos que marcan la diferencia",
              },
              {
                icon: "✨",
                title: "Paquetes Especiales",
                desc: "Bodas y eventos con descuentos especiales",
              },
            ].map((cat) => (
              <Link
                key={cat.title}
                href="/catalogo"
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 transition-all hover:border-primary-100 hover:shadow-xl hover:shadow-primary-100/20 hover:-translate-y-1"
              >
                <span className="text-4xl">{cat.icon}</span>
                <h3 className="mt-4 font-playfair text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {cat.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{cat.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-500 opacity-0 transition-all group-hover:opacity-100">
                  <span>Ver más</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Why Choose Us */}
      <section className="bg-gradient-to-b from-white to-primary-50/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl">
              ¿Por qué elegirnos?
            </h2>
            <p className="mt-4 text-gray-500">
              La mejor experiencia en alquiler de vestimentas
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "✨",
                title: "Calidad Superior",
                desc: "Prendas impecables, limpias y bien cuidadas",
              },
              {
                icon: "👗",
                title: "Amplia Variedad",
                desc: "Más de 200 prendas para todas las ocasiones",
              },
              {
                icon: "💰",
                title: "Mejor Precio",
                desc: "Precios accesibles con la mejor calidad",
              },
              {
                icon: "🤝",
                title: "Atención Personalizada",
                desc: "Te ayudamos a encontrar el look perfecto",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <span className="text-4xl">{item.icon}</span>
                <h3 className="mt-4 font-playfair text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-white sm:text-4xl">
            ¿Listo para encontrar tu look perfecto?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Visítanos y descubre nuestra colección. Te esperamos con los brazos
            abiertos para ayudarte a lucir espectacular en tu próximo evento.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogo"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary-600 shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-full border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
