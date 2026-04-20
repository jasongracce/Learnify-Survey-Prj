"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";
import { useVisibilityPause } from "@/lib/use-visibility-pause";

type ScriptEntry = {
  from: "user" | "lumi";
  text: string;
  typingStart?: number;
  showStart: number;
};

type ChatCopy = {
  header: { name: string; tagline: string; sub: string; tag: string };
  composer: string;
  script: ScriptEntry[];
};

const COPY: Record<"en" | "th", ChatCopy> = {
  en: {
    header: {
      name: "Lumi",
      tagline: "· your study buddy",
      sub: "Socratic tutor · Always curious",
      tag: "Math",
    },
    composer: "Ask Lumi anything…",
    script: [
      { from: "user", text: "Can you help me solve x² − 5x + 6 = 0?", showStart: 0.8 },
      {
        from: "lumi",
        text: "Happy to help you work it out. What method do you already know for a quadratic like this?",
        typingStart: 1.8,
        showStart: 3.6,
      },
      {
        from: "user",
        text: "Factoring, I think. But I'm not sure where to start.",
        showStart: 6.0,
      },
      {
        from: "lumi",
        text: "Good instinct. You need two numbers that multiply to +6 and add to −5. Can you name a pair that works?",
        typingStart: 7.2,
        showStart: 9.2,
      },
      { from: "user", text: "−2 and −3?", showStart: 11.8 },
      {
        from: "lumi",
        text: "Exactly. So you can rewrite it as (x − 2)(x − 3) = 0. What does that tell you about x?",
        typingStart: 12.6,
        showStart: 14.6,
      },
      { from: "user", text: "x = 2 or x = 3!", showStart: 16.8 },
      {
        from: "lumi",
        text: "That's it. Want to try one where the numbers are trickier?",
        typingStart: 17.6,
        showStart: 19.4,
      },
    ],
  },
  th: {
    header: {
      name: "ลูมิ",
      tagline: "· เพื่อนติวของคุณ",
      sub: "ติวเตอร์แบบโสกราตีส · สงสัยอยู่เสมอ",
      tag: "คณิต",
    },
    composer: "ถามลูมิได้ทุกเรื่อง…",
    script: [
      { from: "user", text: "ช่วยแก้สมการ x² − 5x + 6 = 0 หน่อยได้ไหม?", showStart: 0.8 },
      {
        from: "lumi",
        text: "ยินดีช่วยคิดไปด้วยกันเลย วิธีไหนที่คุณพอรู้จักสำหรับสมการกำลังสองแบบนี้?",
        typingStart: 1.8,
        showStart: 3.6,
      },
      {
        from: "user",
        text: "น่าจะเป็นการแยกตัวประกอบ แต่ไม่รู้จะเริ่มยังไงดี",
        showStart: 6.0,
      },
      {
        from: "lumi",
        text: "คิดถูกทางแล้ว ลองหาสองจำนวนที่คูณกันได้ +6 และบวกกันได้ −5 คุณนึกคู่ไหนออกไหม?",
        typingStart: 7.2,
        showStart: 9.2,
      },
      { from: "user", text: "−2 กับ −3 ใช่ไหม?", showStart: 11.8 },
      {
        from: "lumi",
        text: "ใช่เลย! เขียนใหม่ได้เป็น (x − 2)(x − 3) = 0 แล้วแบบนี้บอกอะไรเราเกี่ยวกับ x?",
        typingStart: 12.6,
        showStart: 14.6,
      },
      { from: "user", text: "x = 2 หรือ x = 3!", showStart: 16.8 },
      {
        from: "lumi",
        text: "ถูกต้องเลย อยากลองข้อที่ตัวเลขยากขึ้นอีกหน่อยไหม?",
        typingStart: 17.6,
        showStart: 19.4,
      },
    ],
  },
};

const DURATION = 23;
const ACCENT = "#000";

function useLoopingTime(duration: number, enabled: boolean) {
  const [time, setTime] = useState(0);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    let raf = 0;
    let last: number | null = null;
    let accumulated = 0;
    const tick = (ts: number) => {
      if (last === null) last = ts;
      const delta = ts - last;
      last = ts;
      if (enabledRef.current) {
        accumulated = (accumulated + delta / 1000) % duration;
        setTime(accumulated);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  return time;
}

function TypingDots() {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        alignItems: "center",
        padding: "8px 12px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 6,
            background: "#999",
            opacity: 0.35,
            animation: `lumiDot 1.2s ${i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Paperclip() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5l-8.5 8.5a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5L11 17a2 2 0 01-3-3l7-7"
        stroke="#777"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20V4M5 11l7-7 7 7"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Message({
  msg,
  time,
  idx,
  allMsgs,
}: {
  msg: ScriptEntry;
  time: number;
  idx: number;
  allMsgs: ScriptEntry[];
}) {
  const typingStart = msg.typingStart ?? msg.showStart;
  if (time < typingStart) return null;

  const showingTyping =
    msg.from === "lumi" &&
    msg.typingStart !== undefined &&
    time >= msg.typingStart &&
    time < msg.showStart;

  const entryStart = showingTyping ? msg.typingStart! : msg.showStart;
  const entryDur = 0.26;
  const p = Math.min(1, Math.max(0, (time - entryStart) / entryDur));
  const eased = 1 - Math.pow(1 - p, 3);
  const opacity = eased;
  const ty = (1 - eased) * 10;

  const prev = allMsgs[idx - 1];
  const next = allMsgs[idx + 1];
  const isSameAsPrev = prev && prev.from === msg.from && time >= prev.showStart;
  const isSameAsNext = next && next.from === msg.from && time >= next.showStart;

  if (msg.from === "user") {
    const style: CSSProperties = {
      alignSelf: "flex-end",
      maxWidth: "78%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      opacity,
      transform: `translateY(${ty}px)`,
    };
    return (
      <div style={style}>
        <div
          style={{
            background: ACCENT,
            color: "#fff",
            padding: "9px 14px",
            borderRadius: 18,
            borderBottomRightRadius: isSameAsNext ? 18 : 4,
            borderTopRightRadius: isSameAsPrev ? 4 : 18,
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        maxWidth: "82%",
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: showingTyping ? "4px 6px" : "9px 14px",
          borderRadius: 18,
          borderBottomLeftRadius: isSameAsNext ? 18 : 4,
          borderTopLeftRadius: isSameAsPrev ? 4 : 18,
          fontSize: 14,
          lineHeight: 1.4,
          color: "#111",
          border: "1px solid #ececec",
          minHeight: showingTyping ? 32 : undefined,
          display: "flex",
          alignItems: "center",
        }}
      >
        {showingTyping ? <TypingDots /> : msg.text}
      </div>
    </div>
  );
}

const FONT_BY_LANG: Record<"en" | "th", string> = {
  en: "var(--font-geist-sans), -apple-system, system-ui, sans-serif",
  th: "var(--font-noto-sans-thai), var(--font-geist-sans), -apple-system, system-ui, sans-serif",
};

function ChatChrome({
  lang,
  children,
}: {
  lang: "en" | "th";
  children: React.ReactNode;
}) {
  const copy = COPY[lang];
  return (
    <div
      key={lang}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fafafa",
        fontFamily: FONT_BY_LANG[lang],
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          background: "#fff",
          borderBottom: "1px solid #ececec",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.1 }}>
            {copy.header.name}{" "}
            <span style={{ fontWeight: 400, color: "#999", fontSize: 12 }}>
              {copy.header.tagline}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "#8a8a8a", marginTop: 1 }}>
            {copy.header.sub}
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#555",
            padding: "4px 10px",
            border: "1px solid #e6e6e6",
            borderRadius: 999,
          }}
        >
          {copy.header.tag}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "16px 14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          justifyContent: "flex-end",
        }}
      >
        {children}
      </div>

      {/* Composer */}
      <div style={{ padding: "10px 14px 18px", background: "#fafafa" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: 22,
            padding: "6px 6px 6px 14px",
          }}
        >
          <Paperclip />
          <span style={{ flex: 1, fontSize: 13.5, color: "#999" }}>
            {copy.composer}
          </span>
          <button
            type="button"
            aria-label="Send"
            style={{
              width: 32,
              height: 32,
              borderRadius: 32,
              background: ACCENT,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </div>
  );
}

function PhoneChatLive({ lang }: { lang: "en" | "th" }) {
  const { ref, isVisible } = useVisibilityPause<HTMLDivElement>();
  const time = useLoopingTime(DURATION, isVisible);
  const script = COPY[lang].script;
  return (
    <div ref={ref} style={{ height: "100%" }}>
      <ChatChrome lang={lang}>
        {script.map((msg, i) => (
          <Message key={i} msg={msg} time={time} idx={i} allMsgs={script} />
        ))}
      </ChatChrome>
    </div>
  );
}

function PhoneChatStatic({ lang }: { lang: "en" | "th" }) {
  const script = COPY[lang].script;
  // Show the first 3 fully-entered messages; no animation.
  const shown = script.slice(0, 3);
  const BIG_TIME = 999;
  return (
    <ChatChrome lang={lang}>
      {shown.map((msg, i) => (
        <Message
          key={i}
          msg={{ ...msg, typingStart: undefined, showStart: 0 }}
          time={BIG_TIME}
          idx={i}
          allMsgs={shown.map((m) => ({ ...m, typingStart: undefined, showStart: 0 }))}
        />
      ))}
    </ChatChrome>
  );
}

export default function FeatureAi() {
  const { t, language } = useLanguage();
  const feature = t.features.ai;

  return (
    <section className="relative w-full overflow-hidden bg-[#f9f9f7] py-14 md:py-24">
      <style>{`@keyframes lumiDot { 0%, 100% { opacity: 0.35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }`}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <Reveal className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
              {feature.number}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
              {feature.title}
            </h2>
            <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#6b6b6b] sm:text-lg">
              {feature.description}
            </p>
          </Reveal>

          {/* Phone chat: static on mobile, live on md+ */}
          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-sm overflow-hidden rounded-[32px] ring-1 ring-black/5 h-[520px] md:h-[640px]"
              style={{
                boxShadow: "0 30px 60px -25px rgba(0,0,0,0.18)",
              }}
            >
              <div className="md:hidden h-full">
                <PhoneChatStatic lang={language} />
              </div>
              <div className="hidden md:block h-full">
                <PhoneChatLive lang={language} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
