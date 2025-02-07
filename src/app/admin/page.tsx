"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const Email = process.env.NEXT_PUBLIC_EMAIL;
    const Password = process.env.NEXT_PUBLIC_PASSWORD;

    if (email === Email && password === Password) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Invalid email or password");
    }
    
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-700">
      <form onSubmit={handleLogin} className=" bg-gray-500 p-6 rounded shadow-md">
        <h2 className="text-xl font-bold text-center text-black mb-4">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border text-black border-gray-300 rounded"
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border text-black border-gray-300 rounded"
          value={password}
        />
        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}