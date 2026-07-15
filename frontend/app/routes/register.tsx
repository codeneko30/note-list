// import { useNavigate, Link } from "react-router";
// import { useState } from "react";

// export default function Register() {
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
//       // ✅ Relative path
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ phone, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Registration failed");
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
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-600 to-teal-700 p-4">
//       <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5">
//         <div className="text-center">
//           <div className="mb-2 text-5xl">✨</div>
//           <h1 className="text-2xl font-bold text-gray-800">Join Us</h1>
//           <p className="mt-1 text-sm text-gray-400">Create a new account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-500">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="+8801XXXXXXXXX"
//               required
//               className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-500">
//               6-Digit PIN
//             </label>
//             <div className="relative">
//               <input
//                 type={showPin ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="******"
//                 maxLength={6}
//                 required
//                 className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-16 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
//             <div className="rounded-lg bg-red-50 py-2 text-center text-sm text-red-500">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
//           >
//             {loading ? "Creating..." : "Register"}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500">
//           Already have an account?{" "}
//           <Link to="/login" className="font-medium text-green-600 hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }













import { useNavigate, Link } from "react-router";
import { useState } from "react";

// ✅ API URL
const API_URL = "http://localhost:4000";

export default function Register() {
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
      // ✅ FIXED: Full URL
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      // ✅ Parse response safely
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
        setError(data.error || "Registration failed");
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-600 to-teal-700 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5">
        <div className="text-center">
          <div className="mb-2 text-5xl">✨</div>
          <h1 className="text-2xl font-bold text-gray-800">Join Us</h1>
          <p className="mt-1 text-sm text-gray-400">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              6-Digit PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                maxLength={6}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-16 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
            <div className="rounded-lg bg-red-50 py-2 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}