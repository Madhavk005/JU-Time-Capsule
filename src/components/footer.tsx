

export function Footer() {
  return (
    <footer className="w-full py-6 px-6 mt-auto border-t border-zinc-200/50 bg-[#F9F8F6]/80 backdrop-blur-sm relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <span className="text-sm font-semibold tracking-wider uppercase text-zinc-900">
          JECRC University Time Capsule
        </span>
        <span className="text-xs text-zinc-500 font-medium tracking-wide">
          Managed by{" "}
          <a
            href="https://www.instagram.com/socialzbts?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 hover:text-primary transition-colors underline underline-offset-4 decoration-zinc-300 hover:decoration-primary font-semibold"
          >
            JU Socialz
          </a>
        </span>
      </div>
    </footer>
  );
}
