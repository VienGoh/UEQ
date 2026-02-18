"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const qp = useSearchParams();
  const callbackUrl = qp.get("callbackUrl") ?? "/dashboard";

  const [username, setUsername] = useState(""); // GANTI
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    console.log("Attempting login with:", { username, password });

    const res = await signIn("credentials", {
      redirect: false,
      username, // GANTI
      password,
      callbackUrl,
    });

    console.log("Login response:", res);

    setLoading(false);

    if (res?.error) {
      setErr("Username atau password salah.");
    } else {
      console.log("Login successful, redirecting to:", callbackUrl);
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Login Admin</h1>

        {err && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {err}
          </div>
        )}

        <label className="block">
          <span className="text-sm">Username</span>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="admin"
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="admin123"
          />
        </label>

        <button
          className="w-full rounded-xl bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          disabled={loading}
          type="submit"
        >
          {loading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Memproses...</span>
            </>
          ) : (
            "Masuk"
          )}
        </button>
        
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          {/* <p className="font-medium mb-1">Credentials untuk testing:</p>
          <p>Username: <strong>admin</strong></p>
          <p>Password: <strong>admin123</strong></p>
          <p className="mt-2 text-xs">Pastikan sudah menjalankan seed database</p> */}
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="animate-spin h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full"></span>
            <span>Memuat halaman...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}