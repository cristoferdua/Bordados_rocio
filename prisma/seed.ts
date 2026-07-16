import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear categorías
  const categorias = await Promise.all([
    prisma.category.create({
      data: {
        name: "Trajes para Dama",
        slug: "trajes-dama",
        description: "Elegantes trajes para dama de honor, madrina y ocasiones especiales",
      },
    }),
    prisma.category.create({
      data: {
        name: "Vestidos de Noche",
        slug: "vestidos-noche",
        description: "Vestidos largos y cortos para eventos nocturnos",
      },
    }),
    prisma.category.create({
      data: {
        name: "Vestidos de Novia",
        slug: "vestidos-novia",
        description: "Hermosos vestidos de novia para el gran día",
      },
    }),
    prisma.category.create({
      data: {
        name: "Trajes de Caballero",
        slug: "trajes-caballero",
        description: "Trajes formales para caballeros",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accesorios",
        slug: "accesorios",
        description: "Complementos para completar tu look",
      },
    }),
  ]);

  // Crear productos de ejemplo
  const productosData = [
    {
      name: "Vestido de Noche Elegante",
      slug: "vestido-noche-elegante",
      description:
        "Hermoso vestido de noche en tono azul marino con detalles de pedrería en el escote. Cuenta con cierre trasero y falda tipo princesa. Perfecto para eventos de gala, bodas o graduaciones.",
      rentalPrice: 450,
      depositPrice: 200,
      stock: 3,
      categoryId: categorias[1].id,
      images: [
        { url: "/images/placeholder-1.svg", alt: "Vestido de noche elegante frente", isPrimary: true },
        { url: "/images/placeholder-2.svg", alt: "Vestido de noche elegante espalda" },
      ],
    },
    {
      name: "Traje de Dama de Honor Rosa",
      slug: "traje-dama-honor-rosa",
      description:
        "Elegante traje en tono rosa palo con escote en V y falda hasta la rodilla. Incluye cinturón del mismo color. Ideal para damas de honor en bodas civiles e iglesia.",
      rentalPrice: 380,
      depositPrice: 150,
      stock: 5,
      categoryId: categorias[0].id,
      images: [
        { url: "/images/placeholder-3.svg", alt: "Traje dama de honor rosa frente", isPrimary: true },
      ],
    },
    {
      name: "Vestido de Novia Clásico",
      slug: "vestido-novia-clasico",
      description:
        "Espectacular vestido de novia blanco con encaje francés y cola de 2 metros. Escote corazón, mangas largas de encaje y falda tipo princesa con múltiples capas de tul.",
      rentalPrice: 3500,
      depositPrice: 2000,
      stock: 1,
      categoryId: categorias[2].id,
      images: [
        { url: "/images/placeholder-4.svg", alt: "Vestido de novia clásico frente", isPrimary: true },
        { url: "/images/placeholder-5.svg", alt: "Vestido de novia clásico detalle" },
        { url: "/images/placeholder-6.svg", alt: "Vestido de novia clásico espalda" },
      ],
    },
    {
      name: "Traje Formal Caballero Negro",
      slug: "traje-formal-caballero-negro",
      description:
        "Traje clásico de tres piezas en color negro. Incluye saco, pantalón y chaleco. Tela de alta calidad, perfecto para bodas, graduaciones y eventos formales.",
      rentalPrice: 600,
      depositPrice: 300,
      stock: 4,
      categoryId: categorias[3].id,
      images: [
        { url: "/images/placeholder-7.svg", alt: "Traje caballero negro frente", isPrimary: true },
      ],
    },
    {
      name: "Corbata Seda Borgoña",
      slug: "corbata-seda-borgona",
      description:
        "Elegante corbata de seda natural en tono vino tinto. Ancho clásico de 8cm. Complemento perfecto para cualquier traje formal.",
      rentalPrice: 50,
      depositPrice: 25,
      stock: 10,
      categoryId: categorias[4].id,
      images: [
        { url: "/images/placeholder-8.svg", alt: "Corbata seda borgoña", isPrimary: true },
      ],
    },
    {
      name: "Vestido de Noche Rojo",
      slug: "vestido-noche-rojo",
      description:
        "Deslumbrante vestido de noche color rojo pasión con escote profundo y abertura lateral. Confeccionado en satén de alta calidad con respaldo forrado.",
      rentalPrice: 520,
      depositPrice: 250,
      stock: 2,
      categoryId: categorias[1].id,
      images: [
        { url: "/images/placeholder-9.svg", alt: "Vestido noche rojo frente", isPrimary: true },
        { url: "/images/placeholder-10.svg", alt: "Vestido noche rojo espalda" },
      ],
    },
    {
      name: "Traje Dama Honor Champagne",
      slug: "traje-dama-honor-champagne",
      description:
        "Elegante traje en tono champagne con detalles brillantes en el busto. Falda larga con vuelo y cierre en la espalda. Ideal para bodas en la tarde/noche.",
      rentalPrice: 420,
      depositPrice: 200,
      stock: 3,
      categoryId: categorias[0].id,
      images: [
        { url: "/images/placeholder-11.svg", alt: "Traje dama honor champagne", isPrimary: true },
      ],
    },
    {
      name: "Saco Formal Gris Oxford",
      slug: "saco-formal-gris-oxford",
      description:
        "Saco formal en tono gris oxford de corte moderno. Botonadura sencilla, solapa con muesca y bolsillos con solapa. Ideal para eventos semi-formales.",
      rentalPrice: 350,
      depositPrice: 150,
      stock: 4,
      categoryId: categorias[3].id,
      images: [
        { url: "/images/placeholder-12.svg", alt: "Saco formal gris oxford", isPrimary: true },
      ],
    },
  ];

  for (const productData of productosData) {
    const { images, ...productInfo } = productData;
    await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images,
        },
      },
    });
  }

  // Cliente de ejemplo
  const cliente = await prisma.customer.create({
    data: {
      name: "María García López",
      phone: "+52 555 123 4567",
      email: "maria.garcia@email.com",
      notes: "Cliente recurrente, prefiere vestidos largos",
    },
  });

  // Alquiler de ejemplo
  const vestido = await prisma.product.findFirst();
  if (vestido) {
    await prisma.rental.create({
      data: {
        customerId: cliente.id,
        startDate: new Date("2026-07-20"),
        endDate: new Date("2026-07-27"),
        status: "activo",
        totalPrice: vestido.rentalPrice,
        notes: "Alquiler para boda de fin de semana",
        items: {
          create: {
            productId: vestido.id,
            quantity: 1,
            unitPrice: vestido.rentalPrice,
          },
        },
      },
    });
  }

  console.log("✅ Seed completado exitosamente");
  console.log(`  - ${categorias.length} categorías creadas`);
  console.log(`  - ${productosData.length} productos creados`);
  console.log(`  - 1 cliente de ejemplo creado`);
  console.log(`  - 1 alquiler de ejemplo creado`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
