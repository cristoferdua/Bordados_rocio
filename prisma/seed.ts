import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const users = [
    {
      name: "Administrador",
      email: "admin@bordadosrocio.com",
      password: bcrypt.hashSync("admin123", 10),
      role: "admin",
    },
    {
      name: "Editor",
      email: "editor@bordadosrocio.com",
      password: bcrypt.hashSync("editor123", 10),
      role: "editor",
    },
    {
      name: "Visualizador",
      email: "viewer@bordadosrocio.com",
      password: bcrypt.hashSync("viewer123", 10),
      role: "viewer",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
    console.log(`  ✓ ${user.email} (${user.role})`);
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
