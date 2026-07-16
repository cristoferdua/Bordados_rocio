const testimonials = [
  {
    name: "Ana Martínez",
    role: "Novia - Julio 2025",
    content:
      "Encontré el vestido de mis sueños en Bordados Rocio. Me ayudaron a elegir el perfecto y todo el proceso fue maravilloso. ¡Altamente recomendados!",
    rating: 5,
  },
  {
    name: "Carlos Hernández",
    role: "Caballero - Boda",
    content:
      "Excelente servicio y calidad. El traje estaba impecable y me quedó perfecto. Sin duda los volveré a visitar para futuros eventos.",
    rating: 5,
  },
  {
    name: "María García",
    role: "Dama de Honor - Marzo 2026",
    content:
      "Todas las damas de honor alquilamos nuestros vestidos aquí. Quedaron hermosos, iguales a la muestra. Muy profesionales y amables.",
    rating: 5,
  },
  {
    name: "Laura Sánchez",
    role: "Invitada - Evento de Gala",
    content:
      "El vestido de noche que alquilé fue espectacular. Me sentí como una reina en el evento. Precios muy accesibles para la calidad que ofrecen.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-gray-500">
            La satisfacción de nuestros clientes es nuestra mejor carta de
            presentación
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-gray-100 bg-white p-8 transition-all hover:border-primary-100 hover:shadow-xl hover:shadow-primary-100/20"
            >
              <div className="absolute -top-3 -right-3 text-4xl opacity-0 transition-opacity group-hover:opacity-100">
                💎
              </div>
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-xs text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
