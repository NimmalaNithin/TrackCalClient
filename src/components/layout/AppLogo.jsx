import React from "react";

const AppLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950">
        <svg
          className="size-6"
          viewBox="0 0 64 64"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M18 33h8l4-13 7 25 5-12h7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />
          <circle cx="50" cy="33" r="4" className="fill-emerald-500" />
        </svg>
      </div>
      <div className="leading-none content-center">
        <span className="font-medium">Track Cal</span>
      </div>
    </div>
  );
};

export default AppLogo;
