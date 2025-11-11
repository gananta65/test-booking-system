const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (existingAdmin) {
    console.log("Superuser sudah ada:", existingAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash("supersecret123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Super Admin",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Superuser berhasil dibuat:", admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
