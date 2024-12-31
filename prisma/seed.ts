import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { Role } from '@prisma/client';
import { Bcrypt } from '../src/utils/Bcrypt';

const prisma = new PrismaClient();

export async function main() {
  const name = process.env.SUPER_NAME ?? 'super';
  const username = process.env.SUPER_USERNAME ?? 'super';
  const email = process.env.SUPER_EMAIL ?? 'super@gmail.com';
  const password = process.env.SUPER_PASSWORD ?? '12345678';
  const hashedPassword = await new Bcrypt().hash(password);

  // insert super user
  await prisma.user.create({
    data: {
      id: uuid(),
      name,
      username,
      email,
      password: hashedPassword,
      role: Role.SUPER,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
