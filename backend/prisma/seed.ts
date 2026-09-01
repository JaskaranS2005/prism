/// <reference types="node" />
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
  // ==========================================
  // 1. SEED ROLES
  // ==========================================

  console.log("🌱 Seeding roles...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully.");

  // ==========================================
  // 2. SEED STATE
  // ==========================================

  console.log("🌱 Seeding administrative hierarchy...");

  const state = await prisma.state.upsert({
    where: {
      code: "PB",
    },
    update: {
      name: "Punjab",
      isActive: true,
    },
    create: {
      name: "Punjab",
      code: "PB",
      isActive: true,
    },
  });

  console.log(`✅ State seeded: ${state.name}`);

  // ==========================================
  // 3. SEED DISTRICT
  // ==========================================

  const district = await prisma.district.upsert({
    where: {
      stateId_name: {
        stateId: state.id,
        name: "Ludhiana",
      },
    },
    update: {
      isActive: true,
    },
    create: {
      name: "Ludhiana",
      stateId: state.id,
      isActive: true,
    },
  });

  console.log(`✅ District seeded: ${district.name}`);

  // ==========================================
  // 4. SEED MUNICIPALITY
  // ==========================================

  const municipality = await prisma.municipality.upsert({
    where: {
      districtId_name: {
        districtId: district.id,
        name: "Ludhiana Municipal Corporation",
      },
    },
    update: {
      isActive: true,
    },
    create: {
      name: "Ludhiana Municipal Corporation",
      districtId: district.id,
      isActive: true,
    },
  });

  console.log(`✅ Municipality seeded: ${municipality.name}`);

  // ==========================================
  // 5. LINK EXISTING DEPARTMENT
  // ==========================================

  const updatedDepartments = await prisma.department.updateMany({
    where: {
      name: "Sanitation",
      municipalityId: null,
    },
    data: {
      municipalityId: municipality.id,
    },
  });

  console.log(
    `✅ Sanitation department linked to municipality. Updated: ${updatedDepartments.count}`
  );

  console.log("✅ Administrative hierarchy seeded successfully.");
}

// ==========================================
// RUN SEED
// ==========================================

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
