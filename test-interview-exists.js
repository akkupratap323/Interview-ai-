const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function testInterviewExists() {
  try {
    console.log("🔍 Checking if interview exists...");

    const interview = await db.interview.findUnique({
      where: { id: "-XuHR_yj5nA0K496qdWcm" },
      select: {
        id: true,
        name: true,
      },
    });

    console.log("Interview exists:", !!interview);
    if (interview) {
      console.log("Interview name:", interview.name);
      console.log("Interview ID:", interview.id);
    } else {
      console.log("❌ Interview not found!");

      // Let's see what interviews do exist
      const allInterviews = await db.interview.findMany({
        select: { id: true, name: true },
        take: 5,
      });
      console.log("Available interviews:", allInterviews);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await db.$disconnect();
  }
}

testInterviewExists();
