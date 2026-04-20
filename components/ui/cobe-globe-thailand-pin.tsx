"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

type Props = {
  className?: string;
  speed?: number;
  enabled?: boolean;
};

const THAILAND_LOCATION: [number, number] = [13.75, 100.5];
const MARKER_ID = "thailand";

const THAI_FLAG_GRADIENT = `linear-gradient(
  to bottom,
  #A51931 0%, #A51931 16.67%,
  #F4F5F8 16.67%, #F4F5F8 33.33%,
  #2D2A4A 33.33%, #2D2A4A 66.67%,
  #F4F5F8 66.67%, #F4F5F8 83.33%,
  #A51931 83.33%, #A51931 100%
)`;

function ThaiFlagPin() {
  return (
    <div
      style={{
        position: "relative",
        width: 40,
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.22))",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          boxShadow: "0 0 0 3px #ffffff",
          background: THAI_FLAG_GRADIENT,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          margin: "2px auto 0",
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "9px solid #ffffff",
        }}
      />
    </div>
  );
}

export function GlobeWithThailandPin({
  className = "",
  speed = 0.003,
  enabled = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 9,
        baseColor: [1, 1, 1],
        markerColor: [0.82, 0.1, 0.19],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: [
          { location: THAILAND_LOCATION, size: 0.05, id: MARKER_ID },
        ],
        arcs: [],
        arcColor: [0.5, 0.7, 1],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      });

      function animate() {
        if (enabledRef.current) {
          if (!isPausedRef.current) phi += speed;
          globe!.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
          });
        }
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [speed]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          positionAnchor: `--cobe-${MARKER_ID}`,
          bottom: "anchor(top)",
          left: "anchor(center)",
          translate: "-50% 0",
          marginBottom: 4,
          pointerEvents: "none" as const,
          opacity: `var(--cobe-visible-${MARKER_ID}, 0)`,
          filter: `blur(calc((1 - var(--cobe-visible-${MARKER_ID}, 0)) * 6px))`,
          transition: "opacity 0.3s, filter 0.3s",
        }}
      >
        <ThaiFlagPin />
      </div>
    </div>
  );
}
