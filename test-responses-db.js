const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testResponses() {
  try {
    console.log("🔍 Testing responses in database...");
    
    // Count all responses
    const responseCount = await db.response.count();
    console.log("📊 Total responses in database:", responseCount);
    
    // Get all responses
    const allResponses = await db.response.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        call_id: true,
        interview_id: true,
        name: true,
        email: true,
        is_analysed: true,
        analytics: true,
        createdAt: true
      }
    });
    
    console.log("📋 Responses found:", allResponses.length);
    allResponses.forEach((response, index) => {
      console.log(`   ${index + 1}. Call ID: ${response.call_id}`);
      console.log(`      Interview ID: ${response.interview_id}`);
      console.log(`      Name: ${response.name}`);
      console.log(`      Email: ${response.email}`);
      console.log(`      Is Analysed: ${response.is_analysed}`);
      console.log(`      Has Analytics: ${!!response.analytics}`);
      console.log(`      Created: ${response.createdAt}`);
      console.log("");
    });
    
    // Check specific interview
    const interviewResponses = await db.response.findMany({
      where: { interview_id: '-XuHR_yj5nA0K496qdWcm' },
      select: {
        id: true,
        call_id: true,
        name: true,
        is_analysed: true,
        analytics: true
      }
    });
    
    console.log("📋 Responses for interview -XuHR_yj5nA0K496qdWcm:", interviewResponses.length);
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await db.$disconnect();
  }
}

testResponses();