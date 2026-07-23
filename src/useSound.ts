import { useEffect, useRef, useState } from "react";

/* Tiny synth soundscape — all generated, no audio files. */
class SoundEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  padGain: GainNode | null = null;
  padOscs: OscillatorNode[] = [];
  started = false;

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
  }

  startPad() {
    this.ensure();
    if (!this.ctx || this.started) return;
    this.started = true;
    const ctx = this.ctx;
    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    this.padGain.connect(filter);
    filter.connect(this.master!);

    // warm chord (A major-ish) with slow detune shimmer
    const freqs = [220, 277.18, 329.63, 440];
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.16 / freqs.length + i * 0.005;
      o.connect(g);
      g.connect(this.padGain!);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 1.5 + i;
      lfo.connect(lfoG);
      lfoG.connect(o.detune);
      o.start();
      lfo.start();
      this.padOscs.push(o, lfo);
    });
    // fade in
    this.padGain.gain.setTargetAtTime(0.5, ctx.currentTime, 2.5);
  }

  setMuted(m: boolean) {
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.3);
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol: number, when = 0) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // soft mallet when a flower is added — pentatonic, rises with count
  pluck(step: number) {
    this.ensure();
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const f = scale[step % scale.length] * (step >= scale.length ? 1 : 1);
    this.blip(f, 0.9, "triangle", 0.22);
    this.blip(f * 2, 0.5, "sine", 0.08, 0.01);
  }

  // celebratory shimmer for "Yes"
  cheer() {
    this.ensure();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => this.blip(n, 0.8, "triangle", 0.18, i * 0.09));
  }

  pop() {
    this.blip(660, 0.18, "sine", 0.12);
  }
}

const engine = new SoundEngine();

export function useSound(defaultOn = false) {
  const [enabled, setEnabled] = useState(defaultOn);
  const started = useRef(false);

  useEffect(() => {
    engine.setMuted(!enabled);
    if (enabled && !started.current) {
      started.current = true;
      engine.startPad();
    }
  }, [enabled]);

  return {
    enabled,
    toggle: () => setEnabled((v) => !v),
    enable: () => {
      if (!started.current) {
        started.current = true;
        engine.startPad();
      }
      setEnabled(true);
    },
    pluck: (s: number) => enabled && engine.pluck(s),
    cheer: () => enabled && engine.cheer(),
    pop: () => enabled && engine.pop(),
  };
}
