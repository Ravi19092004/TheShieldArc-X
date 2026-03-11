import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    async function deleteDuplicateEmails() {
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

        for(let emailObject of emailCounts){
          const duplicateUsers = await prisma.user.findMany({
            where:{
              email: emailObject.email
            },
            orderBy:{
              createdAt: 'asc'
            }
          })
          for(let i = 1; i < duplicateUsers.length; i++){
            await prisma.user.delete({
              where:{
                id: duplicateUsers[i].id
              }
            })
          }
        }
        console.log("Duplicates deleted");

      } catch (error) {
        console.error('Error deleting duplicates:', error);
      } finally {
        await prisma.$disconnect();
      }
    }

    deleteDuplicateEmails();