import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-white to-primary-50/30">
      <div className="text-center max-w-lg px-4">
        <span className="text-8xl">👗</span>
        <h1 className="mt-6 font-playfair text-4xl font-bold text-gray-900">
          Página no encontrada
        </h1>
        <p className="mt-4 text-gray-500">
          La página que buscas no existe o ha sido movida. ¿Por qué no mejor
          echas un vistazo a nuestro catálogo?
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105"
          >
            Ir al Inicio
          </Link>
          <Link
            href="/catalogo"
            className="rounded-full border-2 border-primary-200 px-8 py-3.5 text-sm font-semibold text-primary-600 transition-all hover:border-primary-300 hover:bg-primary-50"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
