"use client"; // Required for Next.js client-side code

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

export default function Dashboard() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter(); // ✅ Next.js router for navigation

    useEffect(() => {
    fetch("/api/get-token", { credentials: "include" })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data?.token) {
        localStorage.setItem("bigcommerce_access_token", data.token);
        setToken(data.token);
      }
    })
    .catch((err) => console.error("Error fetching token:", err));
}, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1>Welcome to Your App Dashboard</h1>
            <p>Your BigCommerce Access Token: {token}</p>

            {/* ✅ Button to navigate to the coupon page */}
            <button
                onClick={() => router.push("/coupons")}
                style={{
                    padding: "10px 15px",
                    fontSize: "16px",
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "20px",
                }}
            >
                Go to Coupons
            </button>
        </div>
    );
}