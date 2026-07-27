import { PrismaClient, RoleType } from "@prisma/client";

const prisma = new PrismaClient();

const roles = [
  {
    name: RoleType.SUPER_ADMIN,
    description: "System Super Administrator",
  },
  {
    name: RoleType.STATE_ADMIN,
    description: "State Administrator",
  },
  {
    name: RoleType.DISTRICT_ADMIN,
    description: "District Administrator",
  },
  {
    name: RoleType.MUNICIPAL_ADMIN,
    description: "Municipal Administrator",
  },
  {
    name: RoleType.DEPARTMENT_HEAD,
    description: "Department Head",
  },
  {
    name: RoleType.OFFICER,
    description: "Officer",
  },
  {
    name: RoleType.CITIZEN,
    description: "Citizen",
  },
];

async function main(): Promise<void> {
  console.log("🌱 Seeding roles...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
