import { PrismaClient } from "@prisma/client";
import assert from "assert";
import { createUser, getUser, removeToken } from "../bot/functions/database";
import test, { describe } from "node:test";

let database: PrismaClient = new PrismaClient();

test("Create user", async () => {

    let user = await createUser({
        id: "123",
        horde_token: "123",
    }, database)

    assert.strictEqual(user.id, "123");
    assert.strictEqual(user.horde_token, "123");
    assert.strictEqual(user.horde_config, null);
});


test("Remove token", async () => {
    let userToken = await removeToken("123", database)
    if (userToken) {
        assert.strictEqual(userToken.id, "123");
        assert.strictEqual(userToken.horde_token, null);
    }

    let userDelete = await database.users.delete({
        where: {
            id: "123",
        },
    })

    assert.strictEqual(userDelete.id, "123");
    assert.strictEqual(userDelete.horde_token, null);
});

test("Get user", async () => {
    let user = await getUser("123", database);
    assert.strictEqual(user.id, "123");
    assert.strictEqual(user.horde_token, null);
    assert.strictEqual(user.horde_config, null);
});

test("Get user with token", async () => {
    let user = await createUser({
        id: "123",
        horde_token: "123",
    }, database)
    assert.strictEqual(user.id, "123");
    assert.strictEqual(user.horde_token, "123");
});

test("Remove user", async () => {
    let userDelete = await database.users.delete({
        where: {
            id: "123",
        },
    })

    assert.strictEqual(userDelete.id, "123");
    assert.strictEqual(userDelete.horde_token, "123");
});

test("Create user with a config and without a token", async () => {
    let user = await createUser({
        id: "123",
        horde_config: {
            create: {
                id: "123",
                loras: {
                    create: {
                        loras_id: "123",
                    },
                },
            },
        },
    }, database)
    assert.strictEqual(user.id, "123");
    assert.strictEqual(user.horde_token, null);
    assert.strictEqual(user.horde_config.id, "123");
    assert.strictEqual(user.horde_config.loras[0].loras_id, "123");
});

test("Update the user with a token", async () => {
    let user = await createUser({
        id: "123",
        horde_token: "123",
    }, database)
    assert.strictEqual(user.id, "123");
    assert.strictEqual(user.horde_token, "123");
    // ensure config has not been deleted
    assert.strictEqual(user.horde_config.id, "123");



});

test("Delete user, config and loras", async () => {

    // all test passed, let's delete the user
    let loras = await database.loras.deleteMany({
        where: {
            aiHordeConfigId: "123",
        },
    });

    let config = await database.aIHordeConfig.delete({
        where: {
            userId: "123",
        },
    });

    let userDelete = await database.users.delete({
        where: {
            id: "123",
        },
    })

    assert.strictEqual(userDelete.id, "123");
    assert.strictEqual(userDelete.horde_token, "123");
    assert.strictEqual(config.id, "123");
    assert.strictEqual(loras.count, 1);
});