const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testDatabase() {
  try {
    console.log("🔍 Testing direct database connection...");

    // Test basic connection
    console.log("1. Testing basic connection...");
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection successful:", result);

    // Count all interviews
    console.log("2. Counting all interviews...");
    const count = await db.interview.count();
    console.log("📊 Total interviews in database:", count);

    // Get all interviews
    console.log("3. Fetching all interviews...");
    const allInterviews = await db.interview.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        user_id: true,
        organization_id: true,
        createdAt: true,
      },
    });

    console.log("📋 Interviews found:", allInterviews.length);
    allInterviews.forEach((interview, index) => {
      console.log(`   ${index + 1}. ID: ${interview.id}`);
      console.log(`      Name: ${interview.name}`);
      console.log(`      User ID: ${interview.user_id}`);
      console.log(`      Org ID: ${interview.organization_id}`);
      console.log(`      Created: ${interview.createdAt}`);
      console.log("");
    });

    // Test the service function directly
    console.log("4. Testing InterviewService.getAllInterviews...");
    const {
      InterviewService,
    } = require("./src/services/interviews.service.ts");
    const serviceResult = await InterviewService.getAllInterviews(
      "test-user",
      "test-org",
    );
    console.log("🔧 Service result:", serviceResult.length, "interviews");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    console.error("Error details:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await db.$disconnect();
  }
}

testDatabase();
