import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function CanceledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Canceled</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been canceled. No payment has been processed.
        </p>
        <Link
          to="/"
          className="inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}