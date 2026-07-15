// import { useLoaderData, useFetcher, Link, redirect } from "react-router";
// import type { Route } from "./+types/dashboard";
// import { useState, useRef } from "react";

// // ✅ Type for list
// interface List {
//   id: number;
//   name: string;
//   icon: string;
//   position: number;
// }

// // ✅ clientLoader - browser only, no server execution
// export async function clientLoader(): Promise<{ lists: List[] }> {
//   const token = localStorage.getItem("token");
//   if (!token) throw redirect("/login");

//   const res = await fetch("/api/lists", {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   if (!res.ok) {
//     localStorage.removeItem("token");
//     throw redirect("/login");
//   }

//   const data = await res.json();
//   return { lists: data.lists };
// }

// // ✅ HydrateFallback - REQUIRED when using clientLoader
// export function HydrateFallback() {
//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="text-center">
//         <div className="text-4xl mb-2 animate-pulse">📝</div>
//         <p className="text-gray-500">Loading...</p>
//       </div>
//     </div>
//   );
// }

// // ✅ clientAction - browser only, can access localStorage
// export async function clientAction({ request }: Route.ClientActionArgs) {
//   const token = localStorage.getItem("token");
//   if (!token) throw redirect("/login");

//   const formData = await request.formData();
//   const intent = formData.get("intent");

//   if (intent === "create") {
//     const name = formData.get("name");
//     const icon = formData.get("icon") || "📝";
//     const res = await fetch("/api/create-lists", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ name, icon }),
//     });
//     return res.json();
//   }

//   if (intent === "delete") {
//     const listId = formData.get("listId");
//     await fetch(`/api/lists/${listId}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return { ok: true };
//   }

//   if (intent === "update") {
//     const listId = formData.get("listId");
//     const name = formData.get("name");
//     await fetch(`/api/lists/${listId}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ name }),
//     });
//     return { ok: true };
//   }

//   return null;
// }

// export default function Dashboard() {
//   const { lists } = useLoaderData<Route.ComponentProps["loaderData"]>();
//   const fetcher = useFetcher();

//   // UI states
//   const [showAdd, setShowAdd] = useState(false);
//   const [editingList, setEditingList] = useState<number | null>(null);
//   const [swipedList, setSwipedList] = useState<number | null>(null);
//   const [newName, setNewName] = useState("");
//   const [editName, setEditName] = useState("");
//   const [selectedIcon, setSelectedIcon] = useState("📝");
//   const touchStartX = useRef(0);

//   const icons = ["📝", "🛒", "✅", "📚", "💡", "🎬", "🍳", "💼", "🏠", "🎯"];
//   const isSubmitting = fetcher.state !== "idle";

//   // Swipe handlers
//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const handleTouchEnd = (e: React.TouchEvent, listId: number) => {
//     const diff = touchStartX.current - e.changedTouches[0].clientX;
//     if (Math.abs(diff) > 60) {
//       setSwipedList(swipedList === listId ? null : listId);
//     }
//   };

//   // Actions
//   const handleDelete = (listId: number) => {
//     fetcher.submit(
//       { intent: "delete", listId: String(listId) },
//       { method: "post" }
//     );
//     setSwipedList(null);
//   };

//   const handleEdit = (list: List) => {
//     setEditingList(list.id);
//     setEditName(list.name);
//     setSwipedList(null);
//   };

//   const saveEdit = (listId: number) => {
//     fetcher.submit(
//       { intent: "update", listId: String(listId), name: editName },
//       { method: "post" }
//     );
//     setEditingList(null);
//   };

//   return (
//     <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
//       {/* Header */}
//       <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
//         <div>
//           <h1 className="text-lg font-bold text-gray-800">My Lists</h1>
//           <p className="text-xs text-gray-400">{lists.length} lists</p>
//         </div>
//         <button
//           onClick={() => setShowAdd(true)}
//           className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition"
//         >
//           +
//         </button>
//       </div>

//       {/* Add List Modal */}
//       {showAdd && (
//         <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
//           <div className="bg-white w-full max-w-md rounded-t-3xl p-5 animate-slide-up">
//             <h2 className="text-lg font-bold mb-3">New List</h2>
//             <fetcher.Form
//               method="post"
//               onSubmit={() => {
//                 setShowAdd(false);
//                 setNewName("");
//                 setSelectedIcon("📝");
//               }}
//             >
//               <input type="hidden" name="intent" value="create" />
//               <input type="hidden" name="icon" value={selectedIcon} />

//               {/* Icon picker */}
//               <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-2">
//                 {icons.map((icon) => (
//                   <button
//                     key={icon}
//                     type="button"
//                     onClick={() => setSelectedIcon(icon)}
//                     className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${
//                       selectedIcon === icon
//                         ? "bg-blue-100 ring-2 ring-blue-400"
//                         : "bg-gray-50"
//                     }`}
//                   >
//                     {icon}
//                   </button>
//                 ))}
//               </div>

//               <input
//                 name="name"
//                 value={newName}
//                 onChange={(e) => setNewName(e.target.value)}
//                 placeholder="List name..."
//                 autoFocus
//                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none mb-4"
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
//                   disabled={!newName.trim() || isSubmitting}
//                   className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
//                 >
//                   Create
//                 </button>
//               </div>
//             </fetcher.Form>
//           </div>
//         </div>
//       )}

//       {/* Lists */}
//       <div className="divide-y divide-gray-50">
//         {lists.map((list: List) => (
//           <div
//             key={list.id}
//             className="relative overflow-hidden"
//             onTouchStart={handleTouchStart}
//             onTouchEnd={(e) => handleTouchEnd(e, list.id)}
//           >
//             {/* Swipe Actions Background */}
//             <div className="absolute inset-0 flex">
//               <button
//                 onClick={() => handleEdit(list)}
//                 className="flex-1 bg-blue-500 flex items-center justify-center text-white gap-1"
//               >
//                 <span>Edit</span>
//               </button>
//               <button
//                 onClick={() => handleDelete(list.id)}
//                 className="flex-1 bg-red-500 flex items-center justify-center text-white gap-1"
//               >
//                 <span>Delete</span>
//               </button>
//             </div>

//             {/* List Content */}
//             <div
//               className={`relative bg-white p-4 flex items-center gap-3 transition-transform duration-200 ${
//                 swipedList === list.id ? "-translate-x-1/3" : ""
//               }`}
//             >
//               <span className="text-2xl">{list.icon}</span>

//               {editingList === list.id ? (
//                 <div className="flex-1 flex gap-2">
//                   <input
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm"
//                     autoFocus
//                     onKeyDown={(e) => e.key === "Enter" && saveEdit(list.id)}
//                   />
//                   <button
//                     onClick={() => saveEdit(list.id)}
//                     className="text-green-600 text-xl"
//                   >
//                     ✓
//                   </button>
//                   <button
//                     onClick={() => setEditingList(null)}
//                     className="text-red-600 text-xl"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ) : (
//                 <Link
//                   to={`/lists/${list.id}`}
//                   className="flex-1 flex items-center justify-between"
//                 >
//                   <span className="font-medium text-gray-800">{list.name}</span>
//                   <span className="text-gray-300">›</span>
//                 </Link>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {lists.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-6xl mb-3">📝</p>
//           <p>No lists yet. Create one!</p>
//         </div>
//       )}
//     </div>
//   );
// }















import { useLoaderData, useFetcher, Link, redirect } from "react-router";
import type { Route } from "./+types/dashboard";
import { useState, useRef } from "react";

// ✅ API URL
const API_URL = "http://localhost:4000";

// ✅ Type for list
interface List {
  id: number;
  name: string;
  icon: string;
  position: number;
}

// ✅ Safe fetch with full URL
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

// ✅ clientLoader - browser only
export async function clientLoader(): Promise<{ lists: List[] }> {
  const token = localStorage.getItem("token");
  if (!token) throw redirect("/login");

  const res = await apiFetch("/api/lists");

  if (!res.ok) {
    localStorage.removeItem("token");
    throw redirect("/login");
  }

  const data = await res.json();
  return { lists: data.lists };
}

// ✅ HydrateFallback
export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-pulse">📝</div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// ✅ clientAction - browser only
export async function clientAction({ request }: Route.ClientActionArgs) {
  const token = localStorage.getItem("token");
  if (!token) throw redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name");
    const icon = formData.get("icon") || "📝";
    const res = await apiFetch("/api/create-lists", {
      method: "POST",
      body: JSON.stringify({ name, icon }),
    });
    return res.json();
  }

  if (intent === "delete") {
    const listId = formData.get("listId");
    await apiFetch(`/api/lists/${listId}`, { method: "DELETE" });
    return { ok: true };
  }

  if (intent === "update") {
    const listId = formData.get("listId");
    const name = formData.get("name");
    await apiFetch(`/api/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    return { ok: true };
  }

  return null;
}

export default function Dashboard() {
  const { lists } = useLoaderData<Route.ComponentProps["loaderData"]>();
  const fetcher = useFetcher();

  // UI states
  const [showAdd, setShowAdd] = useState(false);
  const [editingList, setEditingList] = useState<number | null>(null);
  const [swipedList, setSwipedList] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📝");
  const touchStartX = useRef(0);

  const icons = ["📝", "🛒", "✅", "📚", "💡", "🎬", "🍳", "💼", "🏠", "🎯"];
  const isSubmitting = fetcher.state !== "idle";

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, listId: number) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      setSwipedList(swipedList === listId ? null : listId);
    }
  };

  // Actions
  const handleDelete = (listId: number) => {
    fetcher.submit(
      { intent: "delete", listId: String(listId) },
      { method: "post" }
    );
    setSwipedList(null);
  };

  const handleEdit = (list: List) => {
    setEditingList(list.id);
    setEditName(list.name);
    setSwipedList(null);
  };

  const saveEdit = (listId: number) => {
    fetcher.submit(
      { intent: "update", listId: String(listId), name: editName },
      { method: "post" }
    );
    setEditingList(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-800">My Lists</h1>
          <p className="text-xs text-gray-400">{lists.length} lists</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition"
        >
          +
        </button>
      </div>

      {/* Add List Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 animate-slide-up">
            <h2 className="text-lg font-bold mb-3">New List</h2>
            <fetcher.Form
              method="post"
              onSubmit={() => {
                setShowAdd(false);
                setNewName("");
                setSelectedIcon("📝");
              }}
            >
              <input type="hidden" name="intent" value="create" />
              <input type="hidden" name="icon" value={selectedIcon} />

              {/* Icon picker */}
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${
                      selectedIcon === icon
                        ? "bg-blue-100 ring-2 ring-blue-400"
                        : "bg-gray-50"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <input
                name="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="List name..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none mb-4"
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
                  disabled={!newName.trim() || isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}

      {/* Lists */}
      <div className="divide-y divide-gray-50">
        {lists.map((list: List) => (
          <div
            key={list.id}
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, list.id)}
          >
            {/* Swipe Actions Background */}
            <div className="absolute inset-0 flex">
              <button
                onClick={() => handleEdit(list)}
                className="flex-1 bg-blue-500 flex items-center justify-center text-white gap-1"
              >
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(list.id)}
                className="flex-1 bg-red-500 flex items-center justify-center text-white gap-1"
              >
                <span>Delete</span>
              </button>
            </div>

            {/* List Content */}
            <div
              className={`relative bg-white p-4 flex items-center gap-3 transition-transform duration-200 ${
                swipedList === list.id ? "-translate-x-1/3" : ""
              }`}
            >
              <span className="text-2xl">{list.icon}</span>

              {editingList === list.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(list.id)}
                  />
                  <button
                    onClick={() => saveEdit(list.id)}
                    className="text-green-600 text-xl"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingList(null)}
                    className="text-red-600 text-xl"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <Link
                  to={`/lists/${list.id}`}
                  className="flex-1 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-800">{list.name}</span>
                  <span className="text-gray-300">›</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {lists.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-3">📝</p>
          <p>No lists yet. Create one!</p>
        </div>
      )}
    </div>
  );
}