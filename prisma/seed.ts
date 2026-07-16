import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users with posts
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Johnson",
      posts: {
        create: [
          {
            title: "Getting Started with Prisma",
            content:
              "Prisma makes database access easy with its intuitive API and type safety.",
            published: true,
          },
          {
            title: "Why TypeScript?",
            content:
              "TypeScript adds static typing to JavaScript, catching errors at compile time.",
            published: true,
          },
        ],
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob Smith",
      posts: {
        create: [
          {
            title: "Next.js App Router",
            content:
              "The App Router in Next.js provides a new way to build applications with React Server Components.",
            published: true,
          },
          {
            title: "Draft: Database Design Tips",
            content: "Work in progress...",
            published: false,
          },
        ],
      },
    },
  });

  console.log(`  Created user: ${alice.name} (${alice.email})`);
  console.log(`  Created user: ${bob.name} (${bob.email})`);
  console.log("✅ Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
