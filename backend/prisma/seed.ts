import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const criteres = [
  { nom: "Émotions", description: "Intensité émotionnelle ressentie à la lecture" },
  { nom: "Spicy", description: "Intensité des scènes romantiques/sensuelles" },
  { nom: "Action", description: "Rythme et intensité de l'action" },
  { nom: "World building", description: "Richesse et cohérence de l'univers" },
  { nom: "Romance", description: "Qualité de l'intrigue romantique" },
];

async function main() {
  for (const critere of criteres) {
    await prisma.critere.upsert({
      where: { nom: critere.nom },
      update: {},
      create: critere,
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });