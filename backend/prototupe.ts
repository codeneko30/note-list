import { db } from './db/connection';
import { users, lists, items } from './db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { secreetKey } from './key';

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

const PHONE_RE = /^[0-9+][0-9\s-]{6,19}$/;
const PIN_RE = /^\d{6}$/;

const DEFAULT_LISTS = [
  { name: "Shopping", icon: "🛒" },
  { name: "TODO", icon: "✅" },
  { name: "Books", icon: "📚" },
  { name: "Ideas", icon: "💡" },
  { name: "Movies", icon: "🎬" },
  { name: "Recipes", icon: "🍳" }
];

// ============================================
// AUTH ROUTES
// ============================================

// 🔹 Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password } = req.body ?? {};

    if (!phone || !PHONE_RE.test(String(phone).trim())) {
      return res.status(400).json({ error: "Enter a valid phone number" });
    }
    if (!password || !PIN_RE.test(String(password))) {
      return res.status(400).json({ error: "Password must be exactly 6 digits" });
    }

    const cleanPhone = String(phone).trim();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone));

    if (existing) {
      return res.status(409).json({ error: "This phone number is already registered. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({ phone: cleanPhone, passwordHash })
      .returning();

    // Give every new user a friendly starter set of lists
    await db.insert(lists).values(
      DEFAULT_LISTS.map((l, i) => ({
        userId: user.id,
        name: l.name,
        icon: l.icon,
        position: i
      }))
    );

    const token = jwt.sign({ userId: user.id, phone: user.phone }, secreetKey, { expiresIn: "30d" });

    res.status(201).json({ user: { id: user.id, phone: user.phone }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed, please try again" });
  }
});

// 🔹 Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body ?? {};

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required" });
    }

    const cleanPhone = String(phone).trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone));

    if (!user) {
      return res.status(401).json({ error: "No account found for this phone number" });
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user.id, phone: user.phone }, secreetKey, { expiresIn: "30d" });

    res.json({ user: { id: user.id, phone: user.phone }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed, please try again" });
  }
});

// 🔹 Me (protected)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ============================================
// LISTS ROUTES
// ============================================

// GET /api/lists
app.get('/api/lists', authMiddleware, async (req, res) => {
  const rows = await db
    .select()
    .from(lists)
    .where(eq(lists.userId, req.user.userId))
    .orderBy(asc(lists.position));

  res.json({ lists: rows });
});

// POST /api/lists
app.post('/api/lists', authMiddleware, async (req, res) => {
  const { name, icon } = req.body ?? {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "List name is required" });
  }

  const existing = await db
    .select()
    .from(lists)
    .where(eq(lists.userId, req.user.userId));

  const [row] = await db
    .insert(lists)
    .values({
      userId: req.user.userId,
      name: String(name).trim(),
      icon: icon || "📝",
      position: existing.length
    })
    .returning();

  res.status(201).json({ list: row });
});

// PATCH /api/lists/:id
app.patch('/api/lists/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, icon, position } = req.body ?? {};

  const [existing] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));

  if (!existing) return res.status(404).json({ error: "List not found" });

  const updates: any = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (icon !== undefined) updates.icon = icon;
  if (position !== undefined) updates.position = position;

  const [row] = await db
    .update(lists)
    .set(updates)
    .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)))
    .returning();

  res.json({ list: row });
});

// DELETE /api/lists/:id
app.delete('/api/lists/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));

  if (!existing) return res.status(404).json({ error: "List not found" });

  await db
    .delete(lists)
    .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));

  res.json({ ok: true });
});

// ============================================
// ITEMS ROUTES
// ============================================

async function assertListOwnership(listId, userId) {
  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, Number(listId)), eq(lists.userId, userId)));
  return list;
}

// GET /api/items?listId=1
app.get('/api/items', authMiddleware, async (req, res) => {
  const { listId } = req.query;
  if (!listId) return res.status(400).json({ error: "listId is required" });

  const list = await assertListOwnership(listId, req.user.userId);
  if (!list) return res.status(404).json({ error: "List not found" });

  const rows = await db
    .select()
    .from(items)
    .where(and(eq(items.listId, Number(listId)), eq(iimport { db } from './db/connection';
        import { users, lists, items } from './db/schema';
        import { eq, and, asc } from 'drizzle-orm';
        import { secreetKey } from './key';
        
        const express = require('express');
        const jwt = require('jsonwebtoken');
        const bcrypt = require('bcryptjs');
        const authMiddleware = require('./middleware/authMiddleware');
        
        const app = express();
        app.use(express.json());
        
        const PHONE_RE = /^[0-9+][0-9\s-]{6,19}$/;
        const PIN_RE = /^\d{6}$/;
        
        const DEFAULT_LISTS = [
          { name: "Shopping", icon: "🛒" },
          { name: "TODO", icon: "✅" },
          { name: "Books", icon: "📚" },
          { name: "Ideas", icon: "💡" },
          { name: "Movies", icon: "🎬" },
          { name: "Recipes", icon: "🍳" }
        ];
        
        // ============================================
        // AUTH ROUTES
        // ============================================
        
        // 🔹 Register
        app.post('/api/auth/register', async (req, res) => {
          try {
            const { phone, password } = req.body ?? {};
        
            if (!phone || !PHONE_RE.test(String(phone).trim())) {
              return res.status(400).json({ error: "Enter a valid phone number" });
            }
            if (!password || !PIN_RE.test(String(password))) {
              return res.status(400).json({ error: "Password must be exactly 6 digits" });
            }
        
            const cleanPhone = String(phone).trim();
        
            const [existing] = await db
              .select()
              .from(users)
              .where(eq(users.phone, cleanPhone));
        
            if (existing) {
              return res.status(409).json({ error: "This phone number is already registered. Please log in." });
            }
        
            const passwordHash = await bcrypt.hash(password, 10);
        
            const [user] = await db
              .insert(users)
              .values({ phone: cleanPhone, passwordHash })
              .returning();
        
            // Give every new user a friendly starter set of lists
            await db.insert(lists).values(
              DEFAULT_LISTS.map((l, i) => ({
                userId: user.id,
                name: l.name,
                icon: l.icon,
                position: i
              }))
            );
        
            const token = jwt.sign({ userId: user.id, phone: user.phone }, secreetKey, { expiresIn: "30d" });
        
            res.status(201).json({ user: { id: user.id, phone: user.phone }, token });
          } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Registration failed, please try again" });
          }
        });
        
        // 🔹 Login
        app.post('/api/auth/login', async (req, res) => {
          try {
            const { phone, password } = req.body ?? {};
        
            if (!phone || !password) {
              return res.status(400).json({ error: "Phone number and password are required" });
            }
        
            const cleanPhone = String(phone).trim();
        
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.phone, cleanPhone));
        
            if (!user) {
              return res.status(401).json({ error: "No account found for this phone number" });
            }
        
            const valid = await bcrypt.compare(String(password), user.passwordHash);
            if (!valid) {
              return res.status(401).json({ error: "Incorrect password" });
            }
        
            const token = jwt.sign({ userId: user.id, phone: user.phone }, secreetKey, { expiresIn: "30d" });
        
            res.json({ user: { id: user.id, phone: user.phone }, token });
          } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Login failed, please try again" });
          }
        });
        
        // 🔹 Me (protected)
        app.get('/api/auth/me', authMiddleware, (req, res) => {
          res.json({ user: req.user });
        });
        
        // ============================================
        // LISTS ROUTES
        // ============================================
        
        // GET /api/lists
        app.get('/api/lists', authMiddleware, async (req, res) => {
          const rows = await db
            .select()
            .from(lists)
            .where(eq(lists.userId, req.user.userId))
            .orderBy(asc(lists.position));
        
          res.json({ lists: rows });
        });
        
        // POST /api/lists
        app.post('/api/lists', authMiddleware, async (req, res) => {
          const { name, icon } = req.body ?? {};
          if (!name || !String(name).trim()) {
            return res.status(400).json({ error: "List name is required" });
          }
        
          const existing = await db
            .select()
            .from(lists)
            .where(eq(lists.userId, req.user.userId));
        
          const [row] = await db
            .insert(lists)
            .values({
              userId: req.user.userId,
              name: String(name).trim(),
              icon: icon || "📝",
              position: existing.length
            })
            .returning();
        
          res.status(201).json({ list: row });
        });
        
        // PATCH /api/lists/:id
        app.patch('/api/lists/:id', authMiddleware, async (req, res) => {
          const { id } = req.params;
          const { name, icon, position } = req.body ?? {};
        
          const [existing] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));
        
          if (!existing) return res.status(404).json({ error: "List not found" });
        
          const updates: any = {};
          if (name !== undefined) updates.name = String(name).trim();
          if (icon !== undefined) updates.icon = icon;
          if (position !== undefined) updates.position = position;
        
          const [row] = await db
            .update(lists)
            .set(updates)
            .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)))
            .returning();
        
          res.json({ list: row });
        });
        
        // DELETE /api/lists/:id
        app.delete('/api/lists/:id', authMiddleware, async (req, res) => {
          const { id } = req.params;
        
          const [existing] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));
        
          if (!existing) return res.status(404).json({ error: "List not found" });
        
          await db
            .delete(lists)
            .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));
        
          res.json({ ok: true });
        });
        
        // ============================================
        // ITEMS ROUTES
        // ============================================
        
        async function assertListOwnership(listId, userId) {
          const [list] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, Number(listId)), eq(lists.userId, userId)));
          return list;
        }
        
        // GET /api/items?listId=1
        app.get('/api/items', authMiddleware, async (req, res) => {
          const { listId } = req.query;
          if (!listId) return res.status(400).json({ error: "listId is required" });
        
          const list = await assertListOwnership(listId, req.user.userId);
          if (!list) return res.status(404).json({ error: "List not found" });
        
          const rows = await db
            .select()
            .from(items)
            .where(and(eq(items.listId, Number(listId)), eq(items.userId, req.user.userId)))
            .orderBy(asc(items.position));
        
          const byId = new Map(rows.map((r) => [r.id, { ...r, subItems: [] }]));
          const top = [];
          for (const row of byId.values()) {
            if (row.parentId && byId.has(row.parentId)) {
              byId.get(row.parentId).subItems.push(row);
            } else {
              top.push(row);
            }
          }
        
          res.json({ items: top });
        });
        
        // POST /api/items
        app.post('/api/items', authMiddleware, async (req, res) => {
          const { listId, title, notes, parentId } = req.body ?? {};
          if (!listId) return res.status(400).json({ error: "listId is required" });
          if (!title || !String(title).trim()) {
            return res.status(400).json({ error: "Item text is required" });
          }
        
          const list = await assertListOwnership(listId, req.user.userId);
          if (!list) return res.status(404).json({ error: "List not found" });
        
          const siblings = await db
            .select()
            .from(items)
            .where(and(eq(items.listId, Number(listId)), eq(items.userId, req.user.userId)));
        
          const [row] = await db
            .insert(items)
            .values({
              listId: Number(listId),
              userId: req.user.userId,
              parentId: parentId ? Number(parentId) : null,
              title: String(title).trim(),
              notes: notes ? String(notes) : "",
              position: siblings.length
            })
            .returning();
        
          res.status(201).json({ item: { ...row, subItems: [] } });
        });
        
        // PATCH /api/items/:id
        app.patch('/api/items/:id', authMiddleware, async (req, res) => {
          const { id } = req.params;
          const { title, notes, done, position, parenimport { db } from './db/connection';
          import { users, lists, items } from './db/schema';
          import { eq, and, asc } from 'drizzle-orm';
          import { secreetKey } from './key';
          
          const express = require('express');
          const jwt = require('jsonwebtoken');
          const bcrypt = require('bcryptjs');
          const authMiddleware = require('./middleware/authMiddleware');
          
          const app = express();
          app.use(express.json());
          
          const PHONE_RE = /^[0-9+][0-9\s-]{6,19}$/;
          const PIN_RE = /^\d{6}$/;
          
          const DEFAULT_LISTS = [
            { name: "Shopping", icon: "🛒" },
            { name: "TODO", icon: "✅" },
            { name: "Books", icon: "📚" },
            { name: "Ideas", icon: "💡" },
            { name: "Movies", icon: "🎬" },
            { name: "Recipes", icon: "🍳" }
          ];
          
          // ============================================
          // AUTH ROUTES
          // ============================================
          
          // 🔹 Register
          app.post('/api/auth/register', async (req, res) => {
            try {
              const { phone, password } = req.body ?? {};
          
              if (!phone || !PHONE_RE.test(String(phone).trim())) {
                return res.status(400).json({ error: "Enter a valid phone number" });
              }
              if (!password || !PIN_RE.test(String(password))) {
                return res.status(400).json({ error: "Password must be exactly 6 digits" });
              }
          
              const cleanPhone = String(phone).trim();
          
              const [existing] = await db
                .select()
                .from(users)
                .where(eq(users.phone, cleanPhone));
          
              if (existing) {
                return res.status(409).json({ error: "This phone number is already registered. Please log in." });
              }
          
              const passwordHash = await bcrypt.hash(password, 10);
          
              const [user] = await db
                .insert(users)
                .values({ phone: cleanPhone, passwordHash })
                .returning();
          
              // Give every new user a friendly starter set of lists
              await db.insert(lists).values(
                DEFAULT_LISTS.map((l, i) => ({
                  userId: user.id,
                  name: l.name,
                  icon: l.icon,
                  position: i
                }))
              );
          
              const token = jwt.sign({ userId: user.id, phone: user.phone }, secreetKey, { expiresIn: "30d" });
          
              res.status(201).json({ user: { id: user.id, phone: user.phone }, token });
            } catch (err) {
              console.error(err);
              res.status(500).json({ error: "Registration failed, please try again" });
            }
          });
          
          // 🔹 Login
          app.post('/api/auth/login', async (req, res) => {
            try {
              const { phone, password } = req.body ?? {};
          
              if (!phone || !password) {
                return res.status(400).json({ error: "Phone number and password are required" });
              }
          
              const cleanPhone = String(phone).trim();
          
              const [user] = await db
                .select()
                .from(users)
                .where(eq(users.phone, cleanPhone));
          
              if (!user) {
                return res.status(401).json({ error: "No account found for this phone number" });
              }
          
              const valid = await bcrypt.compare(String(password), user.passwordHash);
              if (!valid) {
                return res.status(401).json({ error: "Incorrect password" });
              }
          
              const token = jwt.sign({ userId: user.id, phone: user.phone }, secreetKey, { expiresIn: "30d" });
          
              res.json({ user: { id: user.id, phone: user.phone }, token });
            } catch (err) {
              console.error(err);
              res.status(500).json({ error: "Login failed, please try again" });
            }
          });
          
          // 🔹 Me (protected)
          app.get('/api/auth/me', authMiddleware, (req, res) => {
            res.json({ user: req.user });
          });
          
          // ============================================
          // LISTS ROUTES
          // ============================================
          
          // GET /api/lists
          app.get('/api/lists', authMiddleware, async (req, res) => {
            const rows = await db
              .select()
              .from(lists)
              .where(eq(lists.userId, req.user.userId))
              .orderBy(asc(lists.position));
          
            res.json({ lists: rows });
          });
          
          // POST /api/lists
          app.post('/api/lists', authMiddleware, async (req, res) => {
            const { name, icon } = req.body ?? {};
            if (!name || !String(name).trim()) {
              return res.status(400).json({ error: "List name is required" });
            }
          
            const existing = await db
              .select()
              .from(lists)
              .where(eq(lists.userId, req.user.userId));
          
            const [row] = await db
              .insert(lists)
              .values({
                userId: req.user.userId,
                name: String(name).trim(),
                icon: icon || "📝",
                position: existing.length
              })
              .returning();
          
            res.status(201).json({ list: row });
          });
          
          // PATCH /api/lists/:id
          app.patch('/api/lists/:id', authMiddleware, async (req, res) => {
            const { id } = req.params;
            const { name, icon, position } = req.body ?? {};
          
            const [existing] = await db
              .select()
              .from(lists)
              .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));
          
            if (!existing) return res.status(404).json({ error: "List not found" });
          
            const updates: any = {};
            if (name !== undefined) updates.name = String(name).trim();
            if (icon !== undefined) updates.icon = icon;
            if (position !== undefined) updates.position = position;
          
            const [row] = await db
              .update(lists)
              .set(updates)
              .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)))
              .returning();
          
            res.json({ list: row });
          });
          
          // DELETE /api/lists/:id
          app.delete('/api/lists/:id', authMiddleware, async (req, res) => {
            const { id } = req.params;
          
            const [existing] = await db
              .select()
              .from(lists)
              .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));
          
            if (!existing) return res.status(404).json({ error: "List not found" });
          
            await db
              .delete(lists)
              .where(and(eq(lists.id, Number(id)), eq(lists.userId, req.user.userId)));
          
            res.json({ ok: true });
          });
          
          // ============================================
          // ITEMS ROUTES
          // ============================================
          
          async function assertListOwnership(listId, userId) {
            const [list] = await db
              .select()
              .from(lists)
              .where(and(eq(lists.id, Number(listId)), eq(lists.userId, userId)));
            return list;
          }
          
          // GET /api/items?listId=1
          app.get('/api/items', authMiddleware, async (req, res) => {
            const { listId } = req.query;
            if (!listId) return res.status(400).json({ error: "listId is required" });
          
            const list = await assertListOwnership(listId, req.user.userId);
            if (!list) return res.status(404).json({ error: "List not found" });
          
            const rows = await db
              .select()
              .from(items)
              .where(and(eq(items.listId, Number(listId)), eq(items.userId, req.user.userId)))
              .orderBy(asc(items.position));
          
            const byId = new Map(rows.map((r) => [r.id, { ...r, subItems: [] }]));
            const top = [];
            for (const row of byId.values()) {
              if (row.parentId && byId.has(row.parentId)) {
                byId.get(row.parentId).subItems.push(row);
              } else {
                top.push(row);
              }
            }
          
            res.json({ items: top });
          });
          
          // POST /api/items
          app.post('/api/items', authMiddleware, async (req, res) => {
            const { listId, title, notes, parentId } = req.body ?? {};
            if (!listId) return res.status(400).json({ error: "listId is required" });
            if (!title || !String(title).trim()) {
              return res.status(400).json({ error: "Item text is required" });
            }
          
            const list = await assertListOwnership(listId, req.user.userId);
            if (!list) return res.status(404).json({ error: "List not found" });
          
            const siblings = await db
              .select()
              .from(items)
              .where(and(eq(items.listId, Number(listId)), eq(items.userId, req.user.userId)));
          
            const [row] = await db
              .insert(items)
              .values({
                listId: Number(listId),
                userId: req.user.userId,
                parentId: parentId ? Number(parentId) : null,
                title: String(title).trim(),
                notes: notes ? String(notes) : "",
                position: siblings.length
              })
              .returning();
          
            res.status(201).json({ item: { ...row, subItems: [] } });
          });
          
          // PATCH /api/items/:id
          app.patch('/api/items/:id', authMiddleware, async (req, res) => {
            const { id } = req.params;
            const { title, notes, done, position, parentId } = req.body ?? {};
          
            const [existing] = await db
              .select()
              .from(items)
              .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));
          
            if (!existing) return res.status(404).json({ error: "Item not found" });
          
            const updates: any = { updatedAt: new Date() };
            if (title !== undefined) updates.title = String(title).trim();
            if (notes !== undefined) updates.notes = String(notes);
            if (done !== undefined) updates.done = Boolean(done);
            if (position !== undefined) updates.position = position;
            if (parentId !== undefined) updates.parentId = parentId ? Number(parentId) : null;
          
            const [row] = await db
              .update(items)
              .set(updates)
              .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)))
              .returning();
          
            res.json({ item: row });
          });
          
          // DELETE /api/items/:id
          app.delete('/api/items/:id', authMiddleware, async (req, res) => {
            const { id } = req.params;
          
            const [existing] = await db
              .select()
              .from(items)
              .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));
          
            if (!existing) return res.status(404).json({ error: "Item not found" });
          
            await db
              .delete(items)
              .where(and(eq(items.parentId, Number(id)), eq(items.userId, req.user.userId)));
          
            await db
              .delete(items)
              .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));
          
            res.json({ ok: true });
          });
          
          // ============================================
          // HEALTH
          // ============================================
          
          app.get('/api/health', (req, res) => res.json({ ok: true }));
          
          // Central error handler
          app.use((err, req, res, next) => {
            console.error(err);
            res.status(500).json({ error: "Something went wrong" });
          });
          
          const PORT = process.env.PORT || 4000;
          app.listen(PORT, () => {
            console.log(`Todo API listening on http://localhost:${PORT}`);
          });tId } = req.body ?? {};
        
          const [existing] = await db
            .select()
            .from(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));
        
          if (!existing) return res.status(404).json({ error: "Item not found" });
        
          const updates: any = { updatedAt: new Date() };
          if (title !== undefined) updates.title = String(title).trim();
          if (notes !== undefined) updates.notes = String(notes);
          if (done !== undefined) updates.done = Boolean(done);
          if (position !== undefined) updates.position = position;
          if (parentId !== undefined) updates.parentId = parentId ? Number(parentId) : null;
        
          const [row] = await db
            .update(items)
            .set(updates)
            .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)))
            .returning();
        
          res.json({ item: row });
        });
        
        // DELETE /api/items/:id
        app.delete('/api/items/:id', authMiddleware, async (req, res) => {
          const { id } = req.params;
        
          const [existing] = await db
            .select()
            .from(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));
        
          if (!existing) return res.status(404).json({ error: "Item not found" });
        
          await db
            .delete(items)
            .where(and(eq(items.parentId, Number(id)), eq(items.userId, req.user.userId)));
        
          await db
            .delete(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));
        
          res.json({ ok: true });
        });
        
        // ============================================
        // HEALTH
        // ============================================
        
        app.get('/api/health', (req, res) => res.json({ ok: true }));
        
        // Central error handler
        app.use((err, req, res, next) => {
          console.error(err);
          res.status(500).json({ error: "Something went wrong" });
        });
        
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
          console.log(`Todo API listening on http://localhost:${PORT}`);
        });tems.userId, req.user.userId)))
    .orderBy(asc(items.position));

  const byId = new Map(rows.map((r) => [r.id, { ...r, subItems: [] }]));
  const top = [];
  for (const row of byId.values()) {
    if (row.parentId && byId.has(row.parentId)) {
      byId.get(row.parentId).subItems.push(row);
    } else {
      top.push(row);
    }
  }

  res.json({ items: top });
});

// POST /api/items
app.post('/api/items', authMiddleware, async (req, res) => {
  const { listId, title, notes, parentId } = req.body ?? {};
  if (!listId) return res.status(400).json({ error: "listId is required" });
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Item text is required" });
  }

  const list = await assertListOwnership(listId, req.user.userId);
  if (!list) return res.status(404).json({ error: "List not found" });

  const siblings = await db
    .select()
    .from(items)
    .where(and(eq(items.listId, Number(listId)), eq(items.userId, req.user.userId)));

  const [row] = await db
    .insert(items)
    .values({
      listId: Number(listId),
      userId: req.user.userId,
      parentId: parentId ? Number(parentId) : null,
      title: String(title).trim(),
      notes: notes ? String(notes) : "",
      position: siblings.length
    })
    .returning();

  res.status(201).json({ item: { ...row, subItems: [] } });
});

// PATCH /api/items/:id
app.patch('/api/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, notes, done, position, parentId } = req.body ?? {};

  const [existing] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));

  if (!existing) return res.status(404).json({ error: "Item not found" });

  const updates: any = { updatedAt: new Date() };
  if (title !== undefined) updates.title = String(title).trim();
  if (notes !== undefined) updates.notes = String(notes);
  if (done !== undefined) updates.done = Boolean(done);
  if (position !== undefined) updates.position = position;
  if (parentId !== undefined) updates.parentId = parentId ? Number(parentId) : null;

  const [row] = await db
    .update(items)
    .set(updates)
    .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)))
    .returning();

  res.json({ item: row });
});

// DELETE /api/items/:id
app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));

  if (!existing) return res.status(404).json({ error: "Item not found" });

  await db
    .delete(items)
    .where(and(eq(items.parentId, Number(id)), eq(items.userId, req.user.userId)));

  await db
    .delete(items)
    .where(and(eq(items.id, Number(id)), eq(items.userId, req.user.userId)));

  res.json({ ok: true });
});

// ============================================
// HEALTH
// ============================================

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Todo API listening on http://localhost:${PORT}`);
});