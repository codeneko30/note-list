
// import { useNavigate, Link } from "react-router";
// import { useState } from "react";

// export default function Login() {
//   const navigate = useNavigate();

//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPin, setShowPin] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       // ✅ Use relative path (Vite proxy handles it)
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ phone, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Login failed");
//         return;
//       }

//       localStorage.setItem("token", data.token);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       setError("Server error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
//         <div className="text-center">
//           <div className="text-5xl mb-2">📝</div>
//           <h1 className="text-2xl font-bold text-gray-800">Note List</h1>
//           <p className="text-sm text-gray-400 mt-1">
//             All your lists in one place
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="text-xs font-medium text-gray-500 mb-1 block">
//               Phone Number
//             </label>
//             <input
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               type="tel"
//               placeholder="+8801XXXXXXXXX"
//               required
//               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-medium text-gray-500 mb-1 block">
//               6-Digit PIN
//             </label>
//             <div className="relative">
//               <input
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 type={showPin ? "text" : "password"}
//                 placeholder="******"
//                 maxLength={6}
//                 required
//                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPin(!showPin)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
//               >
//                 {showPin ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>

//           {error && (
//             <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
//               {error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
//           >
//             {loading ? "Please wait..." : "Login"}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500">
//           New user?{" "}
//           <Link to="/register" className="text-blue-600 font-medium hover:underline">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

















import { useNavigate, Link } from "react-router";
import { useState } from "react";

// ✅ API URL constant
const API_URL = "http://localhost:4000";

export default function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // ✅ FIXED: Full URL with CORS
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      // ✅ Debug: Check if response is JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned:", text);
        setError("Server error. Check console.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Network error:", err);
      setError("Cannot connect to server. Is backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="text-center">
          <div className="text-5xl mb-2">📝</div>
          <h1 className="text-2xl font-bold text-gray-800">Note List</h1>
          <p className="text-sm text-gray-400 mt-1">
            All your lists in one place
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+8801XXXXXXXXX"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              6-Digit PIN
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPin ? "text" : "password"}
                placeholder="******"
                maxLength={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          New user?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}