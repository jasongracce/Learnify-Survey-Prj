"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "th";

export type Translations = {
  nav: { about: string; features: string; pricing: string; survey: string };
  joinWaitlist: string;
  languageLabel: string;
  hero: {
    badge: string;
    headlinePrefix: string;
    rotating: string[];
    description: string;
    answerSurvey: string;
    seeFeatures: string;
    beta: string;
  };
  cards: {
    smartStudy: { label: string; title: string; description: string };
    multiSubject: { label: string; title: string; description: string };
    liveSupport: { label: string; title: string; description: string };
    studySystem: { label: string; title: string; description: string };
  };
  pillars: {
    active: string;
    localised: string;
    personalized: string;
    ai: string;
  };
  features: {
    active: {
      number: string;
      title: string;
      description: string;
    };
    localised: {
      number: string;
      title: string;
      description: string;
    };
    personalized: {
      number: string;
      title: string;
      description: string;
    };
    ai: {
      number: string;
      title: string;
      description: string;
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    billingSuffix: string;
    tiers: {
      free: { badge: string; price: string; tagline: string };
      pro: { badge: string; price: string; tagline: string };
      ultra: { badge: string; price: string; tagline: string };
    };
    features: {
      activeLearning: string;
      unlimitedLearning: string;
      unlimitedLumi: string;
      noAds: string;
      personalizedPaths: string;
      everythingInPro: string;
      advancedAnalytics: string;
      earlyAccess: string;
    };
    cta: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      about: "About",
      features: "Features",
      pricing: "Pricing",
      survey: "Survey",
    },
    joinWaitlist: "Join Waitlist",
    languageLabel: "EN",
    hero: {
      badge: "Smarter study starts here",
      headlinePrefix: "Are you ready to",
      rotating: [
        "learn smarter?",
        "stay focused?",
        "ask better questions?",
        "study with clarity?",
      ],
      description:
        "Learnify helps students study with more focus, ask better questions, and build real understanding without the usual overwhelm.",
      answerSurvey: "Answer Survey",
      seeFeatures: "See Features",
      beta: "Beta Test soon...",
    },
    cards: {
      smartStudy: {
        label: "SMART STUDY",
        title: "Learn in Flow",
        description: "Focused study sessions that keep momentum high.",
      },
      multiSubject: {
        label: "MULTI-SUBJECT",
        title: "Everything Together",
        description: "Notes, quizzes, and revision in one place.",
      },
      liveSupport: {
        label: "LIVE SUPPORT",
        title: "Instant Clarity",
        description: "Ask questions and get guided help instantly.",
      },
      studySystem: {
        label: "STUDY SYSTEM",
        title: "Smarter Progress",
        description: "Track weak spots and revise with structure.",
      },
    },
    pillars: {
      active: "Active Learning",
      localised: "Localised Curriculum",
      personalized: "Personalized Learning",
      ai: "AI Powered",
    },
    features: {
      active: {
        number: "01.",
        title: "Active Learning",
        description:
          "Learnify makes you a participant, not a spectator. Every lesson opens with a question — you answer first, then unpack the concept behind it. This retrieval-first approach strengthens memory and turns passive reading into real understanding.",
      },
      localised: {
        number: "02.",
        title: "Localised Curriculum",
        description:
          "Every subject is rebuilt for where you actually learn. Examples use local context, questions match your national curriculum, and explanations respect the way your teachers already frame the material. Learnify plans on launching in Thailand first.",
      },
      personalized: {
        number: "03.",
        title: "Personalized Learning",
        description:
          "Learnify adapts to the way you learn. It tracks where you get stuck, the time of day you focus best, and the pacing that actually works for your brain — then reshapes every session around it. No two students ever see the same path.",
      },
      ai: {
        number: "04.",
        title: "AI Powered with Lumi",
        description:
          "Meet Lumi — Learnify's Socratic study companion. Instead of handing you answers, Lumi guides you with the right questions, one step at a time, so you actually learn how to solve the next problem on your own.",
      },
    },
    pricing: {
      title: "Pricing plans",
      subtitle: "Choose the right plan for your needs.",
      billingSuffix: "THB/mo",
      tiers: {
        free: { badge: "Free", price: "0", tagline: "For getting started" },
        pro: { badge: "PRO", price: "149", tagline: "For serious learners" },
        ultra: { badge: "ULTRA", price: "249", tagline: "For power users" },
      },
      features: {
        activeLearning: "Active Learning Lessons",
        unlimitedLearning: "Unlimited Learning",
        unlimitedLumi: "Unlimited Lumi Messages",
        noAds: "No ads",
        personalizedPaths: "Personalized Learning Paths",
        everythingInPro: "Everything in Pro",
        advancedAnalytics: "Advanced Analytics",
        earlyAccess: "Early access to new features",
      },
      cta: "Coming Soon",
    },
  },
  th: {
    nav: {
      about: "เกี่ยวกับ",
      features: "ฟีเจอร์",
      pricing: "ราคา",
      survey: "แบบสอบถาม",
    },
    joinWaitlist: "ลงชื่อรอ",
    languageLabel: "TH",
    hero: {
      badge: "เรียนอย่างชาญฉลาดเริ่มต้นที่นี่",
      headlinePrefix: "คุณพร้อมที่จะ",
      rotating: [
        "เรียนอย่างชาญฉลาด?",
        "มีสมาธิจดจ่อ?",
        "ตั้งคำถามที่ดีขึ้น?",
        "เรียนอย่างชัดเจน?",
      ],
      description:
        "Learnify ช่วยให้นักเรียนเรียนอย่างมีสมาธิ ตั้งคำถามที่ดีขึ้น และสร้างความเข้าใจอย่างแท้จริงโดยไม่รู้สึกท่วมท้น",
      answerSurvey: "ตอบแบบสอบถาม",
      seeFeatures: "ดูฟีเจอร์",
      beta: "เร็วๆ นี้ช่วงทดลอง...",
    },
    cards: {
      smartStudy: {
        label: "เรียนอย่างชาญฉลาด",
        title: "เรียนอย่างลื่นไหล",
        description: "เซสชันเรียนแบบมีสมาธิที่รักษาความกระตือรือร้น",
      },
      multiSubject: {
        label: "หลายวิชา",
        title: "ทุกอย่างในที่เดียว",
        description: "โน้ต แบบทดสอบ และทบทวนในที่เดียว",
      },
      liveSupport: {
        label: "ช่วยเหลือสด",
        title: "ความชัดเจนทันที",
        description: "ถามคำถามและรับคำแนะนำทันที",
      },
      studySystem: {
        label: "ระบบการเรียน",
        title: "ก้าวหน้าอย่างชาญฉลาด",
        description: "ติดตามจุดอ่อนและทบทวนอย่างเป็นระบบ",
      },
    },
    pillars: {
      active: "การเรียนรู้แบบมีส่วนร่วม",
      localised: "หลักสูตรที่ปรับให้เข้ากับท้องถิ่น",
      personalized: "การเรียนรู้เฉพาะบุคคล",
      ai: "ขับเคลื่อนด้วย AI",
    },
    features: {
      active: {
        number: "01.",
        title: "การเรียนรู้แบบมีส่วนร่วม",
        description:
          "Learnify ทำให้คุณเป็นผู้มีส่วนร่วม ไม่ใช่แค่ผู้ชม ทุกบทเรียนเริ่มต้นด้วยคำถาม คุณต้องตอบก่อน แล้วจึงเรียนรู้แนวคิดเบื้องหลัง วิธีการดึงความรู้ออกมาใช้ก่อนนี้ช่วยเสริมความจำและเปลี่ยนการอ่านแบบเฉยๆ ให้กลายเป็นความเข้าใจที่แท้จริง",
      },
      localised: {
        number: "02.",
        title: "หลักสูตรที่ปรับให้เข้ากับท้องถิ่น",
        description:
          "ทุกวิชาถูกสร้างขึ้นใหม่ให้เข้ากับที่ที่คุณเรียนจริง ตัวอย่างใช้บริบทท้องถิ่น คำถามตรงกับหลักสูตรของประเทศคุณ และคำอธิบายเคารพวิธีที่คุณครูของคุณสอนอยู่แล้ว Learnify วางแผนเปิดตัวที่ประเทศไทยเป็นที่แรก",
      },
      personalized: {
        number: "03.",
        title: "การเรียนรู้เฉพาะบุคคล",
        description:
          "Learnify ปรับตัวเข้ากับวิธีการเรียนของคุณ โดยติดตามจุดที่คุณติดขัด ช่วงเวลาที่คุณมีสมาธิดีที่สุด และจังหวะที่เหมาะกับสมองของคุณจริงๆ แล้วปรับทุกช่วงการเรียนรู้ให้เข้ากับคุณ ไม่มีนักเรียนสองคนที่จะเห็นเส้นทางเดียวกัน",
      },
      ai: {
        number: "04.",
        title: "ขับเคลื่อนด้วย AI ชื่อ Lumi",
        description:
          "พบกับ Lumi เพื่อนคู่คิดการเรียนแบบโสกราตีสของ Learnify แทนที่จะบอกคำตอบให้ Lumi จะนำทางคุณด้วยคำถามที่ถูกต้องทีละขั้น เพื่อให้คุณเรียนรู้วิธีแก้โจทย์ข้อต่อไปได้ด้วยตัวเอง",
      },
    },
    pricing: {
      title: "แผนราคา",
      subtitle: "เลือกแผนที่เหมาะกับคุณ",
      billingSuffix: "บาท/เดือน",
      tiers: {
        free: { badge: "ฟรี", price: "0", tagline: "สำหรับผู้เริ่มต้น" },
        pro: { badge: "PRO", price: "149", tagline: "สำหรับผู้เรียนจริงจัง" },
        ultra: { badge: "ULTRA", price: "249", tagline: "สำหรับผู้ใช้ขั้นสูง" },
      },
      features: {
        activeLearning: "บทเรียนแบบมีส่วนร่วม",
        unlimitedLearning: "เรียนได้ไม่จำกัด",
        unlimitedLumi: "ข้อความ Lumi ไม่จำกัด",
        noAds: "ไม่มีโฆษณา",
        personalizedPaths: "เส้นทางการเรียนเฉพาะบุคคล",
        everythingInPro: "ทุกอย่างในแผน Pro",
        advancedAnalytics: "วิเคราะห์ข้อมูลขั้นสูง",
        earlyAccess: "เข้าถึงฟีเจอร์ใหม่ก่อนใคร",
      },
      cta: "เร็วๆ นี้",
    },
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
