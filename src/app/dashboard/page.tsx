"use client"; // Required for Next.js client-side code

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter(); // ✅ Next.js router for navigation

    useEffect(() => {
        // Try to get the token from localStorage first
        // const storedToken = localStorage.getItem("bigcommerce_access_token");

        // if (storedToken) {
        //     setToken(storedToken);
        // } else {
            // Fetch token from server-side cookies
            fetch("/api/get-token")
                .then((res) => res.json())
                .then((data) => {
                    if (data.token) {
                        localStorage.setItem("bigcommerce_access_token", data.token); // Store in localStorage for quick access
                        setToken(data.token);
                    }
                })
                .catch((err) => console.error("Error fetching token:", err));
        // }
    }, []);

    if (!token) {
        return (
            <a href="https://login.bigcommerce.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=STORE_INFORMATION%20CHECKOUT_CONTENT&response_type=code">
                Login with BigCommerce
            </a>
        );
    }

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



// Welcome to Your App Dashboard
// Your BigCommerce Access Token: 4sixir7biosg2zen33d8ctdld6x1fw

