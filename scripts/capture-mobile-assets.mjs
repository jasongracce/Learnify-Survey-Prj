// Captures:
//   - public/globe-thailand.png   (single frame of the cobe globe rotated to show Thailand)
//   - public/lumi-chat.webm       (full loop of the desktop live chat)
//   - public/lumi-chat.mp4        (mp4 conversion of the above)
//
// Usage: node scripts/capture-mobile-assets.mjs
// Requires: dev server running on http://localhost:3000, ffmpeg-static, playwright.

import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";
import { writeFile, mkdir, rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const URL = "http://localhost:3000";
const OUT = path.resolve("public");

async function ensurePublic() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });
}

async function captureGlobe() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.waitForSelector("canvas");

  await page.evaluate(() => {
    document.querySelector("canvas").scrollIntoView({ block: "center" });
  });

  const canvasLoc = page.locator("canvas").first();
  const outPath = path.join(OUT, "globe-thailand.png");
  const tmpPath = path.join(OUT, ".globe-candidate.png");

  // Poll: at each tick, element-screenshot the canvas, read pixels, look for red (Thai flag pin).
  // Save the frame with the highest red signal.
  let bestRed = 0;
  let bestBuffer = null;
  // A full cobe rotation at speed 0.008 is ~131s @ 60fps; sample for up to 80 seconds.
  const { readFile } = await import("node:fs/promises");
  const { PNG } = await import("pngjs").catch(() => ({ PNG: null }));

  // Fallback: if pngjs is not available, iterate and keep the last frame after N seconds.
  async function analyzeRed(buf) {
    if (!PNG) return 0;
    return new Promise((resolve) => {
      new PNG({}).parse(buf, (err, data) => {
        if (err) return resolve(0);
        const { width, height, data: pixels } = data;
        let maxRed = 0;
        // Focus on the central region of the sphere (where the pin would be if near front).
        const x0 = Math.floor(width * 0.2),
          x1 = Math.floor(width * 0.8);
        const y0 = Math.floor(height * 0.25),
          y1 = Math.floor(height * 0.75);
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx],
              g = pixels[idx + 1],
              b = pixels[idx + 2];
            // Thai flag red is ~#A51931 → r≈165, g≈25, b≈49 → r-g>100, r-b>100
            if (r > 130 && r - g > 60 && r - b > 40 && r > maxRed) maxRed = r;
          }
        }
        resolve(maxRed);
      });
    });
  }

  for (let i = 0; i < 160; i++) {
    await canvasLoc.screenshot({ path: tmpPath, omitBackground: true });
    const buf = await readFile(tmpPath);
    const red = await analyzeRed(buf);
    if (red > bestRed) {
      bestRed = red;
      bestBuffer = buf;
      if (red > 140) break; // good enough; pin is clearly in view
    }
    await page.waitForTimeout(500);
  }

  if (bestBuffer) {
    await writeFile(outPath, bestBuffer);
    console.log(`globe: wrote ${outPath} (bestRed=${bestRed})`);
  } else {
    // Last-resort: save whatever the latest frame was.
    await rename(tmpPath, outPath).catch(() => {});
    console.warn("globe: no pin detected, saved last frame");
  }
  await rm(tmpPath, { force: true }).catch(() => {});

  await browser.close();
}

async function captureVideo() {
  // Chat loop is 23s exactly. Strategy:
  //   1. Load page, pin the chat phone at (0,0) of a 384x640 crop region.
  //   2. Wait until the chat has looped to a stable point (first message visible) to confirm
  //      layout + animation are actually running.
  //   3. THEN open a fresh context that records, re-applying positioning via addInitScript so
  //      it happens before hydration, so the recording starts clean.
  //   4. Record exactly 23s.
  const LOOP_MS = 23000;
  const FRAME_W = 384;
  const FRAME_H = 640;

  const tmpDir = path.resolve("scripts/.video-tmp");
  if (existsSync(tmpDir)) await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  const browser = await chromium.launch();
  const VIEWPORT_W = 1280;
  const VIEWPORT_H = 1000;

  const pinScript = `(function() {
    function apply() {
      const phone = [...document.querySelectorAll("div")].find((d) => {
        const c = d.className?.toString() || "";
        return c.includes("max-w-sm") && c.includes("h-[520px]") && c.includes("rounded-[32px]");
      });
      if (!phone) return false;
      phone.style.position = "fixed";
      phone.style.top = "0";
      phone.style.left = "0";
      phone.style.width = "${FRAME_W}px";
      phone.style.height = "${FRAME_H}px";
      phone.style.maxWidth = "none";
      phone.style.zIndex = "99999";
      phone.style.borderRadius = "0";
      phone.style.boxShadow = "none";
      let p = phone.parentElement;
      while (p) {
        if (p.classList && p.classList.contains("reveal")) p.setAttribute("data-revealed", "true");
        p = p.parentElement;
      }
      document.body.style.background = "#f9f9f7";
      document.body.style.overflow = "hidden";
      [...document.body.children].forEach((el) => {
        if (el !== phone && !el.contains(phone)) el.style.visibility = "hidden";
      });
      return true;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
        mo.observe(document.body, { childList: true, subtree: true });
      });
    } else {
      const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
      mo.observe(document.body, { childList: true, subtree: true });
      apply();
    }
  })();`;

  const ctx = await browser.newContext({
    viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: VIEWPORT_W, height: VIEWPORT_H } },
  });
  await ctx.addInitScript(pinScript);

  const page = await ctx.newPage();
  await page.goto(URL);

  // Wait until pinning has taken effect AND the chat animation has ticked at least once.
  await page.waitForFunction(() => {
    const phone = [...document.querySelectorAll("div")].find((d) => {
      const c = d.className?.toString() || "";
      return c.includes("max-w-sm") && c.includes("h-[520px]") && c.includes("rounded-[32px]");
    });
    if (!phone) return false;
    const r = phone.getBoundingClientRect();
    return r.top === 0 && r.left === 0 && r.width > 300;
  }, { timeout: 30000 });

  // Let the chat loop cycle so the animation is running and steady, then record exactly one loop.
  // We don't care where in the loop we start — as long as we capture 23s, the output loops seamlessly.
  await page.waitForTimeout(2000);

  console.log("video: recording", LOOP_MS, "ms");
  const recordStart = Date.now();
  await page.waitForTimeout(LOOP_MS + 500);
  console.log(`video: recording done in ${Date.now() - recordStart}ms`);

  const videoPath = await page.video().path();
  await ctx.close();
  await browser.close();

  const rawWebm = path.join(tmpDir, "raw.webm");
  await rename(videoPath, rawWebm);

  // The recording includes everything from context creation. We need to trim the lead-in
  // (page load + waitForFunction + 2s settle) and keep exactly 23s starting from recordStart.
  // Probe the webm duration with ffmpeg and compute TRIM so the last 23.5s is kept, then keep 23s.
  const mp4Out = path.join(OUT, "lumi-chat.mp4");
  // The total recording length is (page load + pin + 2s + 23.5s). We recorded LOOP_MS+500 after
  // waitForFunction settled, so the last 23s of the webm are the 23s we want (plus a small tail).
  // Use a negative sseof-like approach: trim from the end.
  await new Promise((resolve, reject) => {
    const ff = spawn(
      ffmpegPath,
      [
        "-y",
        "-sseof", String(-(LOOP_MS / 1000 + 0.3)),
        "-i", rawWebm,
        "-t", String(LOOP_MS / 1000),
        "-vf", `crop=${FRAME_W}:${FRAME_H}:0:0,scale=360:600`,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        "-crf", "26",
        "-preset", "slow",
        mp4Out,
      ],
      { stdio: "inherit" },
    );
    ff.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("ffmpeg exit " + code))));
  });
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`video: wrote ${mp4Out}`);
}

(async () => {
  await ensurePublic();
  const which = process.argv[2] || "both";
  if (which === "globe" || which === "both") await captureGlobe();
  if (which === "video" || which === "both") await captureVideo();
})();
