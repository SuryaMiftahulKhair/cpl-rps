"use client";

import React from "react";

export default function ScrollToTop() {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="scroll-top"
      className="fixed right-6 bottom-6 w-10 h-10 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
