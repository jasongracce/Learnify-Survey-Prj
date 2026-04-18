"use client";

import { useState } from "react";
import LanguageDropdown from "@/components/ui/dropdown";
import { useLanguage } from "@/lib/i18n";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.features, href: "#features" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: t.nav.survey, href: "#survey" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-[#f9f9f7]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a
          href="#"
          className="text-[24px] leading-none tracking-tight text-[#1a1a1a]"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 900 }}
        >
          Learnify.
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA + Language */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#waitlist"
            className="rounded-full border border-[#1a1a1a] px-5 py-2 text-sm font-medium text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
          >
            {t.joinWaitlist}
          </a>
          <LanguageDropdown />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-5 bg-[#1a1a1a] transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-5 bg-[#1a1a1a] transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-5 bg-[#1a1a1a] transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-[#f9f9f7] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              className="mt-2 inline-flex w-fit rounded-full border border-[#1a1a1a] px-5 py-2 text-sm font-medium text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
            >
              {t.joinWaitlist}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
