import { AIHordeConfig, Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export async function createUser(user: Prisma.UsersCreateInput, database: PrismaClient) {
  return await database.users.upsert({
    where: {
      id: user.id,
    },
    include: {
        horde_config: {
            include: {
                loras: true,
            },
        }
    },
    update: user,
    create: user,
  });
}

export async function createOrUpdateUserWithConfig(userId: string, config: Prisma.AIHordeConfigCreateInput, database: PrismaClient) {
    let user = await getUser(userId, database);
    // let's add the config
    if(!user.horde_config) return await database.aIHordeConfig.create({
        data: {
            ...config,
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
    let horde_config = await database.aIHordeConfig.upsert({
        where: {
            id: user.horde_config.id,
        },
        update: config,
        create: {
            ...config,
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
    // let's update the user
    return horde_config;
}

export async function getUser(id: string, database: PrismaClient) {
    let user = await createUser({
        id,
    }, database);
    return user;
}


export async function removeToken(id: string, database: PrismaClient) {
    let user = await database.users.findFirst({
        where: {
            id,
        },
    });
    if (!user) return false;
    return await database.users.update({
        where: {
            id,
        },
        data: {
            horde_token: null,
        },
    });
}

export async function removeLoras(id: string, database: PrismaClient) {
    return await database.loras.deleteMany({
        where: {
            aiHordeConfigId: id,
        },
    });
}

export async function addLoras(id: string, loras: string, database: PrismaClient) {
    return await database.loras.upsert({
        create: {
            loras_id: loras,
            aiHordeConfigId: id,
        },
        update: {
            loras_id: loras,
            aiHordeConfigId: id,
        },
        where: {
            loras_id: loras,
            aiHordeConfigId: id,
        },
    });
}