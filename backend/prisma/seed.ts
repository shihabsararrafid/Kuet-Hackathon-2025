import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  //   const password = await hash("rafid123", 12);
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash("rafid123", salt);
  await prisma.user.deleteMany({
    where: {
      role: "ADMIN",
    },
  });
  const user = await prisma.user.upsert({
    where: { email: "admin@rafid.com" },
    update: {},
    create: {
      email: "admin@rafid.com",
      password: hashed,
      salt,
      role: "ADMIN",
    },
  });

  console.log({ user });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
