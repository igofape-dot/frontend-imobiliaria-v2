export function GoFapeLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width="34"
        height="20"
        viewBox="0 0 38 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="gofape-left" x1="2" y1="3" x2="21" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="gofape-right" x1="17" y1="3" x2="36" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        {/* Left infinity loop */}
        <path
          d="M11.5 18.5C6.5 18.5 3 15.1 3 11C3 6.9 6.5 3.5 11.5 3.5C15.5 3.5 17.8 6.8 19.6 10.6C21.2 14 23.2 16.5 26.5 16.5C29.8 16.5 32.2 14.1 32.2 11C32.2 7.9 29.8 5.5 26.5 5.5C24.5 5.5 22.9 6.5 21.7 8.1"
          stroke="url(#gofape-left)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right infinity loop */}
        <path
          d="M26.5 3.5C31.5 3.5 35 6.9 35 11C35 15.1 31.5 18.5 26.5 18.5C22.5 18.5 20.2 15.2 18.4 11.4C16.8 8 14.8 5.5 11.5 5.5C8.2 5.5 5.8 7.9 5.8 11C5.8 14.1 8.2 16.5 11.5 16.5C13.6 16.5 15.2 15.4 16.4 13.7"
          stroke="url(#gofape-right)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[17px] font-bold tracking-tight leading-none whitespace-nowrap">
        <span className="text-[#0F294A]">Go</span>
        <span className="text-[#2563EB]">FAPE</span>
      </span>
    </div>
  );
}
