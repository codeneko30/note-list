import { db } from "../db/connection";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";

export async function seedUsers() {
    const insertedUsers = await db.insert(users).values([
        { phone: "+8801711111111", passwordHash: await bcrypt.hash("111111", 10) },
        { phone: "+8801722222222", passwordHash: await bcrypt.hash("222222", 10) },
        { phone: "+8801733333333", passwordHash: await bcrypt.hash("333333", 10) },
        { phone: "+8801744444444", passwordHash: await bcrypt.hash("444444", 10) },
        { phone: "+8801755555555", passwordHash: await bcrypt.hash("555555", 10) },
    ]).returning();

    console.log("Users seeded ✔️");
    return insertedUsers;
}
seedUsers()