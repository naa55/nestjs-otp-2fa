/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

const prisma = new PrismaClient();

const fakerUser = (): any => ({
    id: faker.number.int(),
    name: faker.person.firstName(),
    email: faker.internet.email()
});

async function main() {
    const fakerRounds = 10;
    dotenv.config();
    console.log('Seeding...');
    /// --------- Users ---------------
    for (let i = 0; i < fakerRounds; i++) {
        await prisma.user.create({ data: fakerUser() });
    }
};

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });