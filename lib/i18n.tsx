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
      weeklyLumi: string;
      unlimitedLumi: string;
      noAds: string;
      personalizedPaths: string;
      everythingInPro: string;
      advancedAnalytics: string;
      earlyAccess: string;
    };
    cta: string;
  };
  survey: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    cta: string;
  };
  surveyPage: {
    meta: { title: string; backToHome: string };
    progress: { stepLabel: string };
    nav: { back: string; next: string; submit: string; submitting: string };
    welcome: {
      greetingPrefix: string;
      greetingTitle: string;
      nameQuestion: string;
      namePlaceholder: string;
      getStarted: string;
      thanksMessage: string;
      letsGetStarted: string;
    };
    step1: {
      eyebrow: string;
      headline: string;
      q1: { label: string; placeholder: string };
      q2: {
        label: string;
        options: {
          daily: string;
          severalTimesWeek: string;
          weekly: string;
          rarely: string;
          never: string;
        };
      };
      q3: {
        label: string;
        options: {
          homework: string;
          examPrep: string;
          newTopics: string;
          language: string;
          curiosity: string;
          other: string;
        };
        otherPlaceholder: string;
      };
    };
    step2: {
      eyebrow: string;
      headline: string;
      q4: {
        label: string;
        options: {
          curriculum: string;
          ads: string;
          expensive: string;
          lowQuality: string;
          boring: string;
          noPersonalization: string;
          hardInThai: string;
          other: string;
        };
        otherPlaceholder: string;
      };
      q5: { label: string; minLabel: string; maxLabel: string };
      q6: { label: string; placeholder: string };
    };
    step3: {
      eyebrow: string;
      headline: string;
      blurb: string;
      q7: { label: string; minLabel: string; maxLabel: string };
      q8: {
        label: string;
        options: {
          lumi: string;
          activeLearning: string;
          thaiCurriculum: string;
          personalized: string;
          stats: string;
          none: string;
          other: string;
        };
        otherPlaceholder: string;
      };
      q9: {
        label: string;
        options: {
          price: string;
          parents: string;
          alreadyHave: string;
          dontTrustAi: string;
          noDevice: string;
          nothing: string;
          other: string;
        };
        otherPlaceholder: string;
      };
      q10: { label: string; placeholder: string };
    };
    thankYou: {
      heading: string;
      subheading: string;
      emailLabel: string;
      emailPlaceholder: string;
      waitlistCta: string;
      skipCta: string;
      successHeading: string;
      successBody: string;
      skippedBody: string;
      backToHome: string;
    };
    errors: {
      submitFailed: string;
      emailInvalid: string;
      emailDuplicate: string;
      emailFailed: string;
    };
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
        ultra: { badge: "ULTRA", price: "249", tagline: "For going all out" },
      },
      features: {
        activeLearning: "Active Learning Lessons",
        unlimitedLearning: "Unlimited Learning",
        weeklyLumi: "150 Lumi Messages a week",
        unlimitedLumi: "Unlimited Lumi Messages",
        noAds: "No ads",
        personalizedPaths: "Personalized Learning Paths",
        everythingInPro: "Everything in Pro",
        advancedAnalytics: "Advanced Analytics",
        earlyAccess: "Early access to new features",
      },
      cta: "Coming Soon",
    },
    survey: {
      eyebrow: "BETA LAUNCHING SOON",
      headline: "Help shape Learnify's launch",
      subtitle:
        "Take our short survey and tell us what you need from a learning platform built for Thai students. Every answer helps us build the beta right.",
      cta: "Answer Survey",
    },
    surveyPage: {
      meta: {
        title: "Learnify Survey",
        backToHome: "← Back to home",
      },
      progress: { stepLabel: "Step {current} of {total}" },
      nav: {
        back: "← Back",
        next: "Next →",
        submit: "Submit",
        submitting: "Submitting…",
      },
      welcome: {
        greetingPrefix: "Welcome to the",
        greetingTitle: "Learnify Survey",
        nameQuestion: "What's your name?",
        namePlaceholder: "Your name",
        getStarted: "Get Started →",
        thanksMessage: "Hey {name}! Thanks for partaking in the Survey.",
        letsGetStarted: "Let's get started!",
      },
      step1: {
        eyebrow: "CURRENT TOOLS",
        headline: "What do you use now?",
        q1: {
          label: "Which learning tools do you currently use?",
          placeholder: "e.g. Khan Academy, YouTube, QANDA…",
        },
        q2: {
          label: "How often do you use them?",
          options: {
            daily: "Daily",
            severalTimesWeek: "Several times a week",
            weekly: "Weekly",
            rarely: "Rarely",
            never: "Never",
          },
        },
        q3: {
          label: "What do you mainly use them for?",
          options: {
            homework: "School homework",
            examPrep: "Exam prep (O-NET / TGAT / TCAS)",
            newTopics: "Learning new topics",
            language: "Language learning",
            curiosity: "General curiosity",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
      },
      step2: {
        eyebrow: "PAIN POINTS",
        headline: "What's missing?",
        q4: {
          label: "Biggest frustration with your current tools?",
          options: {
            curriculum: "Content doesn't match Thai curriculum",
            ads: "Too many ads",
            expensive: "Too expensive",
            lowQuality: "Low-quality content",
            boring: "Boring / not engaging",
            noPersonalization: "No personalization",
            hardInThai: "Hard to follow in Thai",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
        q5: {
          label: "How well do they match the Thai curriculum?",
          minLabel: "Not at all",
          maxLabel: "Perfectly",
        },
        q6: {
          label: "What do you wish existed that doesn't?",
          placeholder: "Tell us anything you've been wanting",
        },
      },
      step3: {
        eyebrow: "LEARNIFY",
        headline: "What do you think?",
        blurb:
          "Learnify is a Thai-first learning platform built for high-school students — active lessons, Lumi (an AI tutor), and personalized paths that follow the Thai curriculum.",
        q7: {
          label: "How likely are you to try Learnify?",
          minLabel: "Not likely",
          maxLabel: "Definitely will try",
        },
        q8: {
          label: "Which feature excites you most?",
          options: {
            lumi: "AI tutor (Lumi)",
            activeLearning: "Active learning / quiz-based lessons",
            thaiCurriculum: "Thai curriculum focus",
            personalized: "Personalized learning paths",
            stats: "Progress stats",
            none: "None",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
        q9: {
          label: "What would stop you from using it?",
          options: {
            price: "Price",
            parents: "Parents wouldn't pay",
            alreadyHave: "I already have something similar",
            dontTrustAi: "Don't trust AI for learning",
            noDevice: "Don't have reliable device/wifi",
            nothing: "Nothing",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
        q10: {
          label: "Anything else we should know?",
          placeholder: "Open mic — say anything",
        },
      },
      thankYou: {
        heading: "Thanks, {name} — you're helping us build Learnify",
        subheading:
          "Want early access when the beta launches? Drop your email.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        waitlistCta: "Join the waitlist",
        skipCta: "Skip",
        successHeading: "You're on the list",
        successBody: "We'll email you when the beta opens.",
        skippedBody: "Thanks again for your answers.",
        backToHome: "← Back to home",
      },
      errors: {
        submitFailed: "Couldn't submit — please try again.",
        emailInvalid: "Please enter a valid email.",
        emailDuplicate: "Looks like you're already on the list!",
        emailFailed: "Couldn't save your email — please try again.",
      },
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
        ultra: { badge: "ULTRA", price: "249", tagline: "สำหรับการทุ่มสุดตัว" },
      },
      features: {
        activeLearning: "บทเรียนแบบมีส่วนร่วม",
        unlimitedLearning: "เรียนได้ไม่จำกัด",
        weeklyLumi: "150 ข้อความ Lumi ต่อสัปดาห์",
        unlimitedLumi: "ข้อความ Lumi ไม่จำกัด",
        noAds: "ไม่มีโฆษณา",
        personalizedPaths: "เส้นทางการเรียนเฉพาะบุคคล",
        everythingInPro: "ทุกอย่างในแผน Pro",
        advancedAnalytics: "วิเคราะห์ข้อมูลขั้นสูง",
        earlyAccess: "เข้าถึงฟีเจอร์ใหม่ก่อนใคร",
      },
      cta: "เร็วๆ นี้",
    },
    survey: {
      eyebrow: "เบต้าเปิดเร็วๆ นี้",
      headline: "ช่วยกำหนดทิศทางการเปิดตัวของ Learnify",
      subtitle:
        "ตอบแบบสอบถามสั้นๆ แล้วบอกเราว่าคุณต้องการอะไรจากแพลตฟอร์มการเรียนที่สร้างมาเพื่อนักเรียนไทย ทุกคำตอบช่วยให้เราพัฒนาเบต้าได้ตรงจุด",
      cta: "ตอบแบบสอบถาม",
    },
    surveyPage: {
      meta: {
        title: "แบบสอบถาม Learnify",
        backToHome: "← กลับหน้าแรก",
      },
      progress: { stepLabel: "ขั้นที่ {current} จาก {total}" },
      nav: {
        back: "← ย้อนกลับ",
        next: "ถัดไป →",
        submit: "ส่งคำตอบ",
        submitting: "กำลังส่ง…",
      },
      welcome: {
        greetingPrefix: "ยินดีต้อนรับสู่",
        greetingTitle: "แบบสอบถาม Learnify",
        nameQuestion: "คุณชื่ออะไร?",
        namePlaceholder: "ชื่อของคุณ",
        getStarted: "เริ่มต้น →",
        thanksMessage: "สวัสดี {name}! ขอบคุณที่ร่วมทำแบบสอบถามนะ",
        letsGetStarted: "เริ่มกันเลย!",
      },
      step1: {
        eyebrow: "เครื่องมือปัจจุบัน",
        headline: "ตอนนี้คุณใช้อะไรอยู่?",
        q1: {
          label: "คุณใช้เครื่องมือการเรียนรู้อะไรอยู่ในตอนนี้?",
          placeholder: "เช่น Khan Academy, YouTube, QANDA…",
        },
        q2: {
          label: "ใช้บ่อยแค่ไหน?",
          options: {
            daily: "ทุกวัน",
            severalTimesWeek: "หลายครั้งต่อสัปดาห์",
            weekly: "สัปดาห์ละครั้ง",
            rarely: "นานๆ ครั้ง",
            never: "ไม่ได้ใช้",
          },
        },
        q3: {
          label: "ส่วนใหญ่ใช้เพื่ออะไร?",
          options: {
            homework: "การบ้าน",
            examPrep: "เตรียมสอบ (O-NET / TGAT / TCAS)",
            newTopics: "เรียนเรื่องใหม่ๆ",
            language: "ภาษา",
            curiosity: "ความอยากรู้ทั่วไป",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
      },
      step2: {
        eyebrow: "ปัญหาที่เจอ",
        headline: "ขาดอะไรไปบ้าง?",
        q4: {
          label: "อะไรที่ทำให้คุณหงุดหงิดที่สุดกับเครื่องมือในตอนนี้?",
          options: {
            curriculum: "เนื้อหาไม่ตรงหลักสูตรไทย",
            ads: "โฆษณาเยอะเกินไป",
            expensive: "แพงเกินไป",
            lowQuality: "เนื้อหาคุณภาพต่ำ",
            boring: "น่าเบื่อ / ไม่น่าสนใจ",
            noPersonalization: "ไม่มีการปรับให้เฉพาะตัว",
            hardInThai: "ฟังภาษาไทยยาก",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
        q5: {
          label: "เครื่องมือปัจจุบันตรงกับหลักสูตรไทยดีแค่ไหน?",
          minLabel: "ไม่ตรงเลย",
          maxLabel: "ตรงเป๊ะ",
        },
        q6: {
          label: "อยากให้มีอะไรที่ตอนนี้ยังไม่มี?",
          placeholder: "บอกสิ่งที่คุณอยากได้",
        },
      },
      step3: {
        eyebrow: "LEARNIFY",
        headline: "คิดยังไงกับ Learnify?",
        blurb:
          "Learnify คือแพลตฟอร์มการเรียนรู้ที่สร้างเพื่อคนไทยโดยเฉพาะ — บทเรียนแบบ active, Lumi (AI ติวเตอร์) และเส้นทางการเรียนที่ปรับให้เหมาะกับแต่ละคนตามหลักสูตรไทย",
        q7: {
          label: "มีแนวโน้มจะลอง Learnify แค่ไหน?",
          minLabel: "ไม่น่าจะลอง",
          maxLabel: "ลองแน่ๆ",
        },
        q8: {
          label: "ฟีเจอร์ไหนที่ทำให้คุณตื่นเต้นที่สุด?",
          options: {
            lumi: "AI ติวเตอร์ (Lumi)",
            activeLearning: "Active Learning / บทเรียนแบบมีโจทย์",
            thaiCurriculum: "เน้นหลักสูตรไทย",
            personalized: "เส้นทางการเรียนเฉพาะตัว",
            stats: "ติดตามสถิติ",
            none: "ไม่มีเลย",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
        q9: {
          label: "อะไรที่อาจทำให้คุณไม่ใช้ Learnify?",
          options: {
            price: "ราคา",
            parents: "พ่อแม่ไม่จ่าย",
            alreadyHave: "มีอะไรคล้ายๆ อยู่แล้ว",
            dontTrustAi: "ไม่ไว้ใจ AI ในการเรียน",
            noDevice: "ไม่มีอุปกรณ์หรือเน็ตที่ดี",
            nothing: "ไม่มีเลย",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
        q10: {
          label: "อยากบอกอะไรเราอีก?",
          placeholder: "พูดอะไรก็ได้",
        },
      },
      thankYou: {
        heading: "ขอบคุณ {name} — คุณช่วยเราสร้าง Learnify",
        subheading: "อยากเข้าถึงก่อนใครตอนเปิดเบต้าไหม? ใส่อีเมลไว้ได้เลย",
        emailLabel: "อีเมล",
        emailPlaceholder: "you@example.com",
        waitlistCta: "สมัครรอคิว",
        skipCta: "ข้าม",
        successHeading: "คุณอยู่ในคิวแล้ว",
        successBody: "เราจะส่งอีเมลให้ตอนเบต้าเปิด",
        skippedBody: "ขอบคุณอีกครั้งสำหรับคำตอบ",
        backToHome: "← กลับหน้าแรก",
      },
      errors: {
        submitFailed: "ส่งไม่สำเร็จ — ลองอีกครั้ง",
        emailInvalid: "กรุณากรอกอีเมลที่ถูกต้อง",
        emailDuplicate: "ดูเหมือนคุณจะอยู่ในคิวแล้ว!",
        emailFailed: "บันทึกอีเมลไม่สำเร็จ — ลองอีกครั้ง",
      },
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
