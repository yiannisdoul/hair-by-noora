import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const isLocal = window.location.hostname === "localhost";
        const baseUrl = isLocal ? "http://127.0.0.1:8787" : "https://hairbynoora.com.au";
        
        const response = await fetch(`${baseUrl}/api/check-session?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setStatus("error");
      }
    };

    if (sessionId) {
      checkStatus();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {status === "loading" ? (
          <div className="animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        ) : status === "success" ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your booking. We've sent a confirmation email with all the details.
            </p>
            <Link
              to="/"
              className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Return Home
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              Please contact us if you continue to have problems.
            </p>
            <Link
              to="/"
              className="inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Return Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}