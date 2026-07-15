import { db } from "../db/connection";
import { users, lists } from "../db/schema";

// flatmaping
export async function seedLists() {
    const usersData = await db.select().from(users);

    const values = usersData.flatMap((user) => [
        { userId: user.id, name: "Shopping", icon: "🛒", position: 0 },
        { userId: user.id, name: "TODO", icon: "✅", position: 1 },
        { userId: user.id, name: "Books", icon: "📚", position: 2 },
        { userId: user.id, name: "Ideas", icon: "💡", position: 3 },
        { userId: user.id, name: "Movies", icon: "🎬", position: 4 },
    ]);

    const insertedLists = await db
        .insert(lists)
        .values(values)
        .returning();

    console.log("Lists seeded ✔️");

    return insertedLists;
}

seedLists();