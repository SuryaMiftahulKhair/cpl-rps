"use client";  // <-- WAJIB kalau pakai useState, useRouter, useEffect, dll

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      router.push("/home");
    } else {
      alert("Username atau Password salah!");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-unhas.png" alt="Logo" className="h-16 mb-4" />
          <h1 className="text-xl font-bold text-black">APP-CPL</h1>
          <p className="text-gray-600 text-sm">Universitas Hasanuddin</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm text-black placeholder-gray-400"
              placeholder="Masukkan Username"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-black">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm text-black placeholder-gray-400"
              placeholder="Masukkan Password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
