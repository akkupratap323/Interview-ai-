const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

const INTERVIEWERS = {
  LISA: {
    name: "Explorer Lisa",
    rapport: 7,
    exploration: 10,
    empathy: 7,
    speed: 5,
    image: "/interviewers/Lisa.png",
    description:
      "Hi! I'm Lisa, an enthusiastic and empathetic interviewer who loves to explore. With a perfect balance of empathy and rapport, I delve deep into conversations while maintaining a steady pace. Let's embark on this journey together and uncover meaningful insights!",
    audio: "Lisa.wav",
  },
  BOB: {
    name: "Empathetic Bob",
    rapport: 7,
    exploration: 7,
    empathy: 10,
    speed: 5,
    image: "/interviewers/Bob.png",
    description:
      "Hi! I'm Bob, your go-to empathetic interviewer. I excel at understanding and connecting with people on a deeper level, ensuring every conversation is insightful and meaningful. With a focus on empathy, I'm here to listen and learn from you. Let's create a genuine connection!",
    audio: "Bob.wav",
  },
};

async function initInterviewers() {
  try {
    console.log('Initializing default interviewers...');
    
    // Check if interviewers already exist
    const existingInterviewers = await db.interviewer.findMany({
      where: { user_id: null }
    });
    
    if (existingInterviewers.length > 0) {
      console.log(`Found ${existingInterviewers.length} existing default interviewers.`);
      return;
    }
    
    // Create Lisa
    const lisa = await db.interviewer.create({
      data: {
        agent_id: "temp_lisa_agent_id",
        user_id: null, // Global interviewer
        ...INTERVIEWERS.LISA,
      }
    });
    
    // Create Bob
    const bob = await db.interviewer.create({
      data: {
        agent_id: "temp_bob_agent_id",
        user_id: null, // Global interviewer
        ...INTERVIEWERS.BOB,
      }
    });
    
    console.log('Default interviewers created successfully:');
    console.log('- Lisa:', lisa.id);
    console.log('- Bob:', bob.id);
    
  } catch (error) {
    console.error('Error initializing interviewers:', error);
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  initInterviewers();
}

module.exports = { initInterviewers };