import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicateEmails() {
  try {
    const emailCounts = await prisma.user.groupBy({
      by: ['email'],
      _count: {
        email: true,
      },
      having: {
        email: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (emailCounts.length > 0) {
      console.log('Duplicate emails found:', emailCounts);
      for(let emailObject of emailCounts){
        const duplicateUsers = await prisma.user.findMany({
          where:{
            email: emailObject.email
          },
          orderBy:{
            createdAt: 'asc'
          }
        })
        console.log("Users with the email: " + emailObject.email)
        console.log(duplicateUsers)
      }

    } else {
      console.log('No duplicate emails found.');
    }
  } catch (error) {
    console.error('Error finding duplicate emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findDuplicateEmails();