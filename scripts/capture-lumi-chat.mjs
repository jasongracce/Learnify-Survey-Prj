// Captures a high-quality recording of the Lumi chat artifact in public/lumi-chat-source.html
// for both English and Thai. The artifact ships a nicely-typeset phone mockup + 23s chat
// animation; we isolate the phone element, scale it up to fill the viewport, and record
// exactly one 23s loop.
//
// Output:
//   public/lumi-chat-en.mp4
//   public/lumi-chat-th.mp4
//
// Usage:
//   node scripts/capture-lumi-chat.mjs        # both
//   node scripts/capture-lumi-chat.mjs en
//   node scripts/capture-lumi-chat.mjs th

import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const URL = "http://localhost:3000/lumi-chat-source.html";
const OUT = path.resolve("public");

// The artifact internally lays out at 402x874 for the phone, then a parent div scales the
// whole scene down via transform: scale(~0.31). We neutralize that parent transform so the
// phone renders at its natural 402x874 size.
const REC_W = 402;
const REC_H = 874;
const LOOP_MS = 23000;

async function captureLang(lang /* "en" | "th" */) {
  const tmpDir = path.resolve(`scripts/.lumi-${lang}-tmp`);
  if (existsSync(tmpDir)) await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: REC_W, height: REC_H },
    deviceScaleFactor: 2,
    recordVideo: { dir: tmpDir, size: { width: REC_W, height: REC_H } },
  });

  const page = await ctx.newPage();
  await page.goto(URL);

  // Wait for the bundler to unpack and render the phone.
  await page.waitForFunction(() => {
    return [...document.querySelectorAll("div")].some((d) => {
      const s = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return r.width > 40 && r.height > 100 && s.borderRadius === "48px";
    });
  }, { timeout: 30000 });

  // Click the language toggle first, let React re-render, then pin + scale the phone.
  await page.evaluate((lang) => {
    const buttons = [...document.querySelectorAll("button")];
    const target = lang === "en"
      ? buttons.find((b) => b.textContent?.trim() === "EN")
      : buttons.find((b) => b.textContent?.trim() === "ไทย");
    target?.click();
  }, lang);
  await page.waitForTimeout(600);

  const result = await page.evaluate(() => {
    const phone = [...document.querySelectorAll("div")].find((d) => {
      const s = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return r.width > 40 && r.height > 100 && s.borderRadius === "48px";
    });
    if (!phone) return { error: "phone not found" };

    // Neutralize every transform up the ancestor chain so the phone renders at its natural
    // 402x874 size — and so position:fixed on the phone is viewport-relative (not relative
    // to a transformed ancestor).
    let el = phone.parentElement;
    while (el) {
      const s = getComputedStyle(el);
      if (s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)") {
        el.style.setProperty("transform", "none", "important");
      }
      el = el.parentElement;
    }

    phone.setAttribute("data-capture-phone", "1");
    const style = document.createElement("style");
    style.textContent = `
      [data-capture-phone] {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        margin: 0 !important;
        z-index: 99999 !important;
        box-shadow: none !important;
      }
      html, body {
        background: #f9f9f7 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    // Hide ancestor siblings so only the phone renders.
    let p = phone;
    while (p.parentElement) {
      [...p.parentElement.children].forEach((sib) => {
        if (sib !== p && !sib.contains(phone)) sib.style.display = "none";
      });
      p = p.parentElement;
    }

    const rect = phone.getBoundingClientRect();
    return { naturalW: rect.width, naturalH: rect.height };
  });

  // Neutralize any transforms re-applied by React on ancestors.
  await page.waitForTimeout(200);

  if (result.error) throw new Error(result.error);
  console.log(`[${lang}] phone natural ${Math.round(result.naturalW)}x${Math.round(result.naturalH)}`);

  // Confirm pinning took effect by checking the bounding box.
  await page.waitForFunction(() => {
    const phone = document.querySelector("[data-capture-phone]");
    if (!phone) return false;
    const r = phone.getBoundingClientRect();
    return r.left === 0 && r.top === 0 && r.width > 300;
  }, { timeout: 10000 });

  // Let the chat animation settle, then record exactly one loop.
  await page.waitForTimeout(1500);

  console.log(`[${lang}] recording ${LOOP_MS}ms`);
  await page.waitForTimeout(LOOP_MS + 500);

  const videoPath = await page.video().path();
  await ctx.close();
  await browser.close();

  const rawWebm = path.join(tmpDir, "raw.webm");
  await rename(videoPath, rawWebm);

  // Trim the last LOOP_MS + small tail to capture exactly one loop, encode mp4.
  const mp4Out = path.join(OUT, `lumi-chat-${lang}.mp4`);
  await new Promise((resolve, reject) => {
    const ff = spawn(
      ffmpegPath,
      [
        "-y",
        "-sseof", String(-(LOOP_MS / 1000 + 0.3)),
        "-i", rawWebm,
        "-t", String(LOOP_MS / 1000),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        "-crf", "20",
        "-preset", "slow",
        mp4Out,
      ],
      { stdio: "inherit" },
    );
    ff.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("ffmpeg exit " + code))));
  });
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`[${lang}] wrote ${mp4Out}`);
}

(async () => {
  const which = process.argv[2] || "both";
  if (which === "en" || which === "both") await captureLang("en");
  if (which === "th" || which === "both") await captureLang("th");
})();
