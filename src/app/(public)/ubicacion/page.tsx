"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Phone, Mail, Clock, ArrowLeft } from "lucide-react";

// Dynamic import to avoid SSR issues with Leaflet
const MapLocation = dynamic(
  () => import("@/components/public/MapLocation").then((m) => m.MapLocation),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl bg-gray-100 border border-gray-100">
        <div className="text-center">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-sm text-gray-400">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

export default function UbicacionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-primary-600 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="mb-10 text-center">
          <span className="text-5xl">📍</span>
          <h1 className="mt-4 font-playfair text-4xl font-bold text-gray-900">
            Nuestra Ubicación
          </h1>
          <p className="mt-2 text-gray-500">
            Visítanos y descubre nuestra colección en persona
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Map */}
          <div className="lg:col-span-3">
            <MapLocation
              center={[19.4326, -99.1332]}
              zoom={16}
              address="Centro, Ciudad de México"
            />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-lg font-semibold text-gray-900 mb-6">
                Información
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dirección</p>
                    <p className="text-sm text-gray-500">
                      Centro, Ciudad de México
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                    <a
                      href="tel:+525551234567"
                      className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      +52 555 123 4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a
                      href="mailto:info@bordadosrocio.com"
                      className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      info@bordadosrocio.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Horario</p>
                    <p className="text-sm text-gray-500">
                      Lunes a Sábado: 9:00 - 19:00
                    </p>
                    <p className="text-sm text-gray-400">Domingo: Cerrado</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-6 text-white">
              <h3 className="font-playfair text-lg font-semibold">
                ¿Quieres cotizar?
              </h3>
              <p className="mt-2 text-sm text-primary-100">
                También puedes solicitar una cotización en línea desde la
                comodidad de tu casa
              </p>
              <Link
                href="/cotizar"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Cotizar ahora →
              </Link>
            </div>
          </div>
        </div>

        {/* How to get there */}
        <div className="mt-12 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
            ¿Cómo llegar?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <span className="text-2xl">🚗</span>
              <h3 className="font-semibold text-gray-900">En auto</h3>
              <p className="text-sm text-gray-500">
                Fácil acceso desde el centro de la ciudad. Estacionamiento
                disponible cerca del local.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-2xl">🚇</span>
              <h3 className="font-semibold text-gray-900">Transporte público</h3>
              <p className="text-sm text-gray-500">
                Varias rutas de metro y autobús pasan cerca de nuestra
                ubicación.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-2xl">🚶</span>
              <h3 className="font-semibold text-gray-900">A pie</h3>
              <p className="text-sm text-gray-500">
                Estamos en una zona céntrica y transitada, fácil de localizar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
