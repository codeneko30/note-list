

import { db } from "../db/connection";
import { lists, items } from "../db/schema";
// flatmaping
export async function seedItems() {
    const listsData = await db.select().from(lists);

    const values = listsData.flatMap((list) => [
        { listId: list.id, userId: list.userId, title: "Task 1: Get started", notes: "Initial setup", done: false, position: 0 },
        { listId: list.id, userId: list.userId, title: "Task 2: Plan ahead", notes: "Create a roadmap", done: false, position: 1 },
        { listId: list.id, userId: list.userId, title: "Task 3: Execute", notes: "Do the work", done: true, position: 2 },
        { listId: list.id, userId: list.userId, title: "Task 4: Review", notes: "Check quality", done: false, position: 3 },
        { listId: list.id, userId: list.userId, title: "Task 5: Complete", notes: "Mark as done", done: true, position: 4 },
    ]);

    const insertedItems = await db.insert(items).values(values).returning();

    console.log("Items seeded ✔️");

    return insertedItems;
}

seedItems();