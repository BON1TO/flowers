import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  kind: "bokeh" | "petal";
  hue: number;
  alpha: number;
}

const PETAL_COLORS = ["#ff9dc0", "#f7a8c4", "#ffc0d3", "#f386a9", "#ffd1e0", "#e58bb0"];

export function Atmosphere({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;

    const parts: Particle[] = [];
    const nBokeh = reduced ? 10 : Math.round(26 * intensity);
    const nPetal = reduced ? 0 : Math.round(22 * intensity);

    for (let i = 0; i < nBokeh; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 6 + Math.random() * 26,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.35,
        rot: 0,
        vr: 0,
        kind: "bokeh",
        hue: 0,
        alpha: 0.06 + Math.random() * 0.16,
      });
    }
    for (let i = 0; i < nPetal; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 5 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.5 + Math.random() * 1.1,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.04,
        kind: "petal",
        hue: Math.floor(Math.random() * PETAL_COLORS.length),
        alpha: 0.5 + Math.random() * 0.4,
      });
    }

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = PETAL_COLORS[p.hue];
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r, -p.r, p.r, p.r * 0.6, 0, p.r);
      ctx.bezierCurveTo(-p.r, p.r * 0.6, -p.r, -p.r, 0, -p.r);
      ctx.fill();
      ctx.restore();
    };

    const drawBokeh = (p: Particle) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
      g.addColorStop(0.5, `rgba(255,214,230,${p.alpha * 0.7})`);
      g.addColorStop(1, "rgba(255,214,230,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.kind === "petal") {
          p.vx += Math.sin(p.y * 0.01) * 0.006; // gentle sway
          if (p.y > h + 20) {
            p.y = -20;
            p.x = Math.random() * w;
          }
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          drawPetal(p);
        } else {
          if (p.y < -40) {
            p.y = h + 40;
            p.x = Math.random() * w;
          }
          drawBokeh(p);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    if (!reduced) tick();
    else {
      // static-ish single frame
      for (const p of parts) (p.kind === "petal" ? drawPetal : drawBokeh)(p);
    }

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [intensity, reduced]);

  return (
    <div className="atmosphere" aria-hidden>
      <div className="sky" />
      <div className="sun-glow" />
      <div className="sun-rays" />
      <canvas ref={canvasRef} className="particles" />
      <div className="vignette" />
    </div>
  );
}
