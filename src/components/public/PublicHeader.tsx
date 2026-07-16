"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/cotizar", label: "Cotizar" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/50 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-2xl">💎</span>
          <div className="flex flex-col">
            <span className="font-playfair text-xl font-bold tracking-tight text-primary-700">
              Bordados Rocio
            </span>
            <span className="-mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-400">
              Alquiler de Vestimentas
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-500 after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/catalogo"
            className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:shadow-xl hover:shadow-primary-300 hover:scale-105 active:scale-95"
          >
            Ver Catálogo
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 md:hidden"
          aria-label="Menú"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-primary-100/50 bg-white md:hidden">
          <nav className="flex flex-col space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/catalogo"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Ver Catálogo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
