import Link from "next/link";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-primary-100/50 bg-gradient-to-b from-white to-primary-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div>
                <p className="font-playfair text-lg font-bold text-primary-700">
                  Bordados Rocio
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary-400">
                  Alquiler de Vestimentas
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Vestimentas elegantes para tus eventos especiales. Calidad y estilo
              para hacer de cada ocasión un momento inolvidable.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="font-playfair text-sm font-semibold uppercase tracking-wider text-primary-700">
              Enlaces
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Inicio" },
                { href: "/catalogo", label: "Catálogo" },
                { href: "/cotizar", label: "Cotizar" },
                { href: "/ubicacion", label: "Ubicación" },
                { href: "/contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-playfair text-sm font-semibold uppercase tracking-wider text-primary-700">
              Categorías
            </h3>
            <ul className="space-y-2">
              {[
                "Vestidos de Novia",
                "Vestidos de Noche",
                "Trajes para Dama",
                "Trajes de Caballero",
                "Accesorios",
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href="/catalogo"
                    className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-playfair text-sm font-semibold uppercase tracking-wider text-primary-700">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <Link href="/ubicacion" className="hover:text-primary-600">
                  Dirección: Centro, Tu Ciudad
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+525551234567" className="hover:text-primary-600">
                  +52 555 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a
                  href="mailto:info@bordadosrocio.com"
                  className="hover:text-primary-600"
                >
                  info@bordadosrocio.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span>
                <span>Lun-Sáb: 9:00 - 19:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-100/50 pt-6">
          <p className="text-center text-xs text-gray-400">
            &copy; {currentYear} Bordados Rocio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
