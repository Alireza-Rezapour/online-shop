// app/loading.tsx
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background"
    >
      {/* Spinner */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-4 border-muted" />

        {/* Spinning arc */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary/40 motion-reduce:animate-none" />

        {/* Hanger icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-9 w-9 animate-pulse text-primary-foreground dark:text-primary"
          aria-hidden="true"
        >
          <path d="M12 7a2 2 0 1 0-2-2" />
          <path d="M12 7v2l9.2 6.1a1.5 1.5 0 0 1-.8 2.9H3.6a1.5 1.5 0 0 1-.8-2.9L12 9" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-medium text-foreground">
          درحال بارگذاری
          <span className="inline-flex w-5 justify-start">
            <span className="animate-bounce [animation-delay:0ms]"> </span>
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </p>
      </div>

      <span className="sr-only">Loading, please wait</span>
    </div>
  );
}
