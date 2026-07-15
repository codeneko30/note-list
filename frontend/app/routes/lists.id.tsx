// import { useLoaderData, useFetcher, useParams, Link, redirect } from "react-router";
// import type { Route } from "./+types/lists.$id";
// import { useState, useRef } from "react";

// // ✅ Types
// interface List {
//   id: number;
//   name: string;
//   icon: string;
// }

// interface Item {
//   id: number;
//   listId: number;
//   title: string;
//   notes: string | null;
//   done: boolean;
//   position: number;
// }

// // ✅ clientLoader with params
// export async function clientLoader({
//   params,
// }: Route.ClientLoaderArgs): Promise<{
//   lists: List[];
//   items: Item[];
//   currentList: List | undefined;
// }> {
//   const token = localStorage.getItem("token");
//   if (!token) throw redirect("/login");

//   const [listsRes, itemsRes] = await Promise.all([
//     fetch("/api/lists", { headers: { Authorization: `Bearer ${token}` } }),
//     fetch(`/api/items?listId=${params.id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     }),
//   ]);

//   if (!listsRes.ok || !itemsRes.ok) {
//     localStorage.removeItem("token");
//     throw redirect("/login");
//   }

//   const listsData = await listsRes.json();
//   const itemsData = await itemsRes.json();
//   const currentList = listsData.lists.find(
//     (l: List) => l.id === Number(params.id)
//   );

//   return { lists: listsData.lists, items: itemsData.items, currentList };
// }

// // ✅ HydrateFallback
// export function HydrateFallback() {
//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="text-center">
//         <div className="text-4xl mb-2 animate-pulse">✅</div>
//         <p className="text-gray-500">Loading items...</p>
//       </div>
//     </div>
//   );
// }

// // ✅ clientAction
// export async function clientAction({ request, params }: Route.ClientActionArgs) {
//   const token = localStorage.getItem("token");
//   if (!token) throw redirect("/login");

//   const formData = await request.formData();
//   const intent = formData.get("intent");
//   const listId = params.id;

//   if (intent === "create-item") {
//     const title = formData.get("title");
//     const notes = formData.get("notes");
//     const res = await fetch("/api/create-items", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ listId: Number(listId), title, notes }),
//     });
//     return res.json();
//   }

//   if (intent === "toggle") {
//     const itemId = formData.get("itemId");
//     const done = formData.get("done") === "true";
//     await fetch(`/api/items/${itemId}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ done: !done }),
//     });
//     return { ok: true };
//   }

//   if (intent === "delete-item") {
//     const itemId = formData.get("itemId");
//     await fetch(`/api/items/${itemId}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return { ok: true };
//   }

//   if (intent === "update-item") {
//     const itemId = formData.get("itemId");
//     const title = formData.get("title");
//     const notes = formData.get("notes");
//     await fetch(`/api/items/${itemId}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ title, notes }),
//     });
//     return { ok: true };
//   }

//   if (intent === "reorder") {
//     const itemId = formData.get("itemId");
//     const position = formData.get("position");
//     await fetch(`/api/items/${itemId}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ position: Number(position) }),
//     });
//     return { ok: true };
//   }

//   return null;
// }

// export default function ListDetail() {
//   const { lists, items, currentList } = useLoaderData<Route.ComponentProps["loaderData"]>();
//   const fetcher = useFetcher();
//   const params = useParams();

//   // UI states
//   const [showAdd, setShowAdd] = useState(false);
//   const [newTitle, setNewTitle] = useState("");
//   const [newNotes, setNewNotes] = useState("");
//   const [editingItem, setEditingItem] = useState<number | null>(null);
//   const [editTitle, setEditTitle] = useState("");
//   const [editNotes, setEditNotes] = useState("");
//   const [swipedItem, setSwipedItem] = useState<number | null>(null);
//   const touchStartX = useRef(0);

//   const isSubmitting = fetcher.state !== "idle";

//   // Swipe handlers
//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const handleTouchEnd = (e: React.TouchEvent, itemId: number) => {
//     const diff = touchStartX.current - e.changedTouches[0].clientX;
//     if (Math.abs(diff) > 60) {
//       setSwipedItem(swipedItem === itemId ? null : itemId);
//     }
//   };

//   // Item actions
//   const handleToggle = (item: Item) => {
//     fetcher.submit(
//       {
//         intent: "toggle",
//         itemId: String(item.id),
//         done: String(item.done),
//       },
//       { method: "post" }
//     );
//   };

//   const handleDelete = (itemId: number) => {
//     fetcher.submit(
//       { intent: "delete-item", itemId: String(itemId) },
//       { method: "post" }
//     );
//     setSwipedItem(null);
//   };

//   const handleEdit = (item: Item) => {
//     setEditingItem(item.id);
//     setEditTitle(item.title);
//     setEditNotes(item.notes || "");
//     setSwipedItem(null);
//   };

//   const saveEdit = (itemId: number) => {
//     fetcher.submit(
//       {
//         intent: "update-item",
//         itemId: String(itemId),
//         title: editTitle,
//         notes: editNotes,
//       },
//       { method: "post" }
//     );
//     setEditingItem(null);
//   };

//   const moveItem = (itemId: number, newPos: number) => {
//     fetcher.submit(
//       {
//         intent: "reorder",
//         itemId: String(itemId),
//         position: String(newPos),
//       },
//       { method: "post" }
//     );
//   };

//   return (
//     <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
//       {/* Header */}
//       <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
//         <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">
//           ←
//         </Link>
//         <div className="flex-1">
//           <h1 className="text-lg font-bold text-gray-800">
//             {currentList?.icon} {currentList?.name}
//           </h1>
//           <p className="text-xs text-gray-400">{items.length} items</p>
//         </div>
//         <button
//           onClick={() => setShowAdd(true)}
//           className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition"
//         >
//           +
//         </button>
//       </div>

//       {/* Quick List Switcher */}
//       <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-gray-50 scrollbar-hide">
//         {lists.map((list: List) => (
//           <Link
//             key={list.id}
//             to={`/lists/${list.id}`}
//             className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
//               list.id === Number(params.id)
//                 ? "bg-blue-100 text-blue-700 font-medium"
//                 : "bg-gray-100 text-gray-500"
//             }`}
//           >
//             {list.icon} {list.name}
//           </Link>
//         ))}
//       </div>

//       {/* Add Item Modal */}
//       {showAdd && (
//         <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
//           <div className="bg-white w-full max-w-md rounded-t-3xl p-5 animate-slide-up">
//             <h2 className="text-lg font-bold mb-3">New Item</h2>
//             <fetcher.Form
//               method="post"
//               onSubmit={() => {
//                 setShowAdd(false);
//                 setNewTitle("");
//                 setNewNotes("");
//               }}
//             >
//               <input type="hidden" name="intent" value="create-item" />
//               <input
//                 name="title"
//                 value={newTitle}
//                 onChange={(e) => setNewTitle(e.target.value)}
//                 placeholder="What to do?"
//                 autoFocus
//                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none mb-2"
//               />
//               <textarea
//                 name="notes"
//                 value={newNotes}
//                 onChange={(e) => setNewNotes(e.target.value)}
//                 placeholder="Notes (optional)..."
//                 rows={2}
//                 className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none mb-4 resize-none text-sm"
//               />
//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowAdd(false)}
//                   className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={!newTitle.trim() || isSubmitting}
//                   className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
//                 >
//                   Add
//                 </button>
//               </div>
//             </fetcher.Form>
//           </div>
//         </div>
//       )}

//       {/* Items */}
//       <div className="divide-y divide-gray-50">
//         {items.map((item: Item, index: number) => (
//           <div
//             key={item.id}
//             className="relative overflow-hidden"
//             onTouchStart={handleTouchStart}
//             onTouchEnd={(e) => handleTouchEnd(e, item.id)}
//           >
//             {/* Swipe Actions */}
//             <div className="absolute inset-0 flex">
//               <button
//                 onClick={() => handleEdit(item)}
//                 className="flex-1 bg-blue-500 flex items-center justify-center text-white gap-1"
//               >
//                 <span>Edit</span>
//               </button>
//               <button
//                 onClick={() => handleDelete(item.id)}
//                 className="flex-1 bg-red-500 flex items-center justify-center text-white gap-1"
//               >
//                 <span>Delete</span>
//               </button>
//             </div>

//             {/* Item Content */}
//             <div
//               className={`relative bg-white p-4 flex items-start gap-3 transition-transform duration-200 ${
//                 swipedItem === item.id ? "-translate-x-1/3" : ""
//               }`}
//             >
//               {/* Tap to strike */}
//               <button
//                 onClick={() => handleToggle(item)}
//                 className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition flex-shrink-0 ${
//                   item.done
//                     ? "bg-green-500 border-green-500 text-white"
//                     : "border-gray-300"
//                 }`}
//               >
//                 {item.done && "✓"}
//               </button>

//               <div className="flex-1">
//                 {editingItem === item.id ? (
//                   <div className="space-y-2">
//                     <input
//                       value={editTitle}
//                       onChange={(e) => setEditTitle(e.target.value)}
//                       className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
//                       autoFocus
//                     />
//                     <textarea
//                       value={editNotes}
//                       onChange={(e) => setEditNotes(e.target.value)}
//                       rows={2}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
//                     />
//                     <div className="flex gap-3">
//                       <button
//                         onClick={() => saveEdit(item.id)}
//                         className="text-green-600 text-sm font-medium"
//                       >
//                         Save
//                       </button>
//                       <button
//                         onClick={() => setEditingItem(null)}
//                         className="text-red-600 text-sm font-medium"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div onClick={() => handleToggle(item)} className="cursor-pointer">
//                     <p
//                       className={`font-medium ${
//                         item.done ? "line-through text-gray-400" : "text-gray-800"
//                       }`}
//                     >
//                       {item.title}
//                     </p>
//                     {item.notes && (
//                       <p
//                         className={`text-sm mt-1 ${
//                           item.done ? "text-gray-300" : "text-gray-500"
//                         }`}
//                       >
//                         {item.notes}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Move buttons */}
//               <div className="flex flex-col gap-1 flex-shrink-0">
//                 {index > 0 && (
//                   <button
//                     onClick={() => moveItem(item.id, index - 1)}
//                     className="text-gray-300 hover:text-gray-500 text-xs p-1"
//                   >
//                     ▲
//                   </button>
//                 )}
//                 {index < items.length - 1 && (
//                   <button
//                     onClick={() => moveItem(item.id, index + 1)}
//                     className="text-gray-300 hover:text-gray-500 text-xs p-1"
//                   >
//                     ▼
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {items.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-6xl mb-3">✅</p>
//           <p>No items yet. Add one!</p>
//         </div>
//       )}
//     </div>
//   );
// }































import { useLoaderData, useFetcher, useParams, Link, redirect } from "react-router";
import type { Route } from "./+types/lists.$id";
import { useState, useRef } from "react";

// ✅ API URL
const API_URL = "http://localhost:4000";

// ✅ Types
interface List {
  id: number;
  name: string;
  icon: string;
}

interface Item {
  id: number;
  listId: number;
  title: string;
  notes: string | null;
  done: boolean;
  position: number;
}

// ✅ Safe fetch helper
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
}

// ✅ clientLoader with params
export async function clientLoader({
  params,
}: Route.ClientLoaderArgs): Promise<{
  lists: List[];
  items: Item[];
  currentList: List | undefined;
}> {
  const token = localStorage.getItem("token");
  if (!token) throw redirect("/login");

  const [listsRes, itemsRes] = await Promise.all([
    apiFetch("/api/lists"),
    apiFetch(`/api/items?listId=${params.id}`),
  ]);

  if (!listsRes.ok || !itemsRes.ok) {
    localStorage.removeItem("token");
    throw redirect("/login");
  }

  const listsData = await listsRes.json();
  const itemsData = await itemsRes.json();
  const currentList = listsData.lists.find(
    (l: List) => l.id === Number(params.id)
  );

  return { lists: listsData.lists, items: itemsData.items, currentList };
}

// ✅ HydrateFallback
export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-pulse">✅</div>
        <p className="text-gray-500">Loading items...</p>
      </div>
    </div>
  );
}

// ✅ clientAction
export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const token = localStorage.getItem("token");
  if (!token) throw redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent");
  const listId = params.id;

  if (intent === "create-item") {
    const title = formData.get("title");
    const notes = formData.get("notes");
    const res = await apiFetch("/api/create-items", {
      method: "POST",
      body: JSON.stringify({ listId: Number(listId), title, notes }),
    });
    return res.json();
  }

  if (intent === "toggle") {
    const itemId = formData.get("itemId");
    const done = formData.get("done") === "true";
    await apiFetch(`/api/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ done: !done }),
    });
    return { ok: true };
  }

  if (intent === "delete-item") {
    const itemId = formData.get("itemId");
    await apiFetch(`/api/items/${itemId}`, { method: "DELETE" });
    return { ok: true };
  }

  if (intent === "update-item") {
    const itemId = formData.get("itemId");
    const title = formData.get("title");
    const notes = formData.get("notes");
    await apiFetch(`/api/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ title, notes }),
    });
    return { ok: true };
  }

  if (intent === "reorder") {
    const itemId = formData.get("itemId");
    const position = formData.get("position");
    await apiFetch(`/api/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ position: Number(position) }),
    });
    return { ok: true };
  }

  return null;
}

export default function ListDetail() {
  const { lists, items, currentList } = useLoaderData<Route.ComponentProps["loaderData"]>();
  const fetcher = useFetcher();
  const params = useParams();

  // UI states
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [swipedItem, setSwipedItem] = useState<number | null>(null);
  const touchStartX = useRef(0);

  const isSubmitting = fetcher.state !== "idle";

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, itemId: number) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      setSwipedItem(swipedItem === itemId ? null : itemId);
    }
  };

  // Item actions
  const handleToggle = (item: Item) => {
    fetcher.submit(
      {
        intent: "toggle",
        itemId: String(item.id),
        done: String(item.done),
      },
      { method: "post" }
    );
  };

  const handleDelete = (itemId: number) => {
    fetcher.submit(
      { intent: "delete-item", itemId: String(itemId) },
      { method: "post" }
    );
    setSwipedItem(null);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item.id);
    setEditTitle(item.title);
    setEditNotes(item.notes || "");
    setSwipedItem(null);
  };

  const saveEdit = (itemId: number) => {
    fetcher.submit(
      {
        intent: "update-item",
        itemId: String(itemId),
        title: editTitle,
        notes: editNotes,
      },
      { method: "post" }
    );
    setEditingItem(null);
  };

  const moveItem = (itemId: number, newPos: number) => {
    fetcher.submit(
      {
        intent: "reorder",
        itemId: String(itemId),
        position: String(newPos),
      },
      { method: "post" }
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800">
            {currentList?.icon} {currentList?.name}
          </h1>
          <p className="text-xs text-gray-400">{items.length} items</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition"
        >
          +
        </button>
      </div>

      {/* Quick List Switcher */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-gray-50 scrollbar-hide">
        {lists.map((list: List) => (
          <Link
            key={list.id}
            to={`/lists/${list.id}`}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
              list.id === Number(params.id)
                ? "bg-blue-100 text-blue-700 font-medium"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {list.icon} {list.name}
          </Link>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 animate-slide-up">
            <h2 className="text-lg font-bold mb-3">New Item</h2>
            <fetcher.Form
              method="post"
              onSubmit={() => {
                setShowAdd(false);
                setNewTitle("");
                setNewNotes("");
              }}
            >
              <input type="hidden" name="intent" value="create-item" />
              <input
                name="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What to do?"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none mb-2"
              />
              <textarea
                name="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes (optional)..."
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none mb-4 resize-none text-sm"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map((item: Item, index: number) => (
          <div
            key={item.id}
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, item.id)}
          >
            {/* Swipe Actions */}
            <div className="absolute inset-0 flex">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 bg-blue-500 flex items-center justify-center text-white gap-1"
              >
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 bg-red-500 flex items-center justify-center text-white gap-1"
              >
                <span>Delete</span>
              </button>
            </div>

            {/* Item Content */}
            <div
              className={`relative bg-white p-4 flex items-start gap-3 transition-transform duration-200 ${
                swipedItem === item.id ? "-translate-x-1/3" : ""
              }`}
            >
              {/* Tap to strike */}
              <button
                onClick={() => handleToggle(item)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition flex-shrink-0 ${
                  item.done
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {item.done && "✓"}
              </button>

              <div className="flex-1">
                {editingItem === item.id ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                      autoFocus
                    />
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="text-green-600 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-red-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => handleToggle(item)} className="cursor-pointer">
                    <p
                      className={`font-medium ${
                        item.done ? "line-through text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.notes && (
                      <p
                        className={`text-sm mt-1 ${
                          item.done ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Move buttons */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                {index > 0 && (
                  <button
                    onClick={() => moveItem(item.id, index - 1)}
                    className="text-gray-300 hover:text-gray-500 text-xs p-1"
                  >
                    ▲
                  </button>
                )}
                {index < items.length - 1 && (
                  <button
                    onClick={() => moveItem(item.id, index + 1)}
                    className="text-gray-300 hover:text-gray-500 text-xs p-1"
                  >
                    ▼
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-3">✅</p>
          <p>No items yet. Add one!</p>
        </div>
      )}
    </div>
  );
}