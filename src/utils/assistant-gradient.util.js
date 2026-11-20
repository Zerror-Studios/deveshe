/**
 * Shopping assistant visuals: the moving gradient, the orb and the motion
 * maths (DD-PRD-001 FR-1, FR-6, FR-11, FR-14)
 *
 * One painter draws the launcher button and the orb: four soft blobs
 * drifting on layered sines and two sine waves, blended additively, in the
 * store's red and blush (D3), after the reference assistant's button
 * (PRD §6.3). Everything here is maths or draws on the 2D context it is
 * given, with no import, so `node:test` loads it.
 */

// ─── Palette (D3) ─────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

/** Blobs: colour, home position and drift, as fractions of the canvas. */
export const ASSISTANT_BLOBS = [
  {
    color: [254, 0, 0],
    baseX: 0.35,
    baseY: 0.6,
    radius: 0.85,
    ampX: 0.28,
    ampY: 0.22,
    ampR: 0.04,
    speed: 0.9,
    phase: 0,
  },
  {
    color: [250, 220, 222],
    baseX: 0.65,
    baseY: 0.3,
    radius: 0.72,
    ampX: 0.3,
    ampY: 0.26,
    ampR: 0.04,
    speed: 0.63,
    phase: 2.1,
  },
  {
    color: [255, 90, 110],
    baseX: 0.7,
    baseY: 0.65,
    radius: 0.72,
    ampX: 0.26,
    ampY: 0.28,
    ampR: 0.04,
    speed: 1.17,
    phase: 4.3,
  },
  {
    color: [200, 16, 46],
    baseX: 0.3,
    baseY: 0.35,
    radius: 0.63,
    ampX: 0.32,
    ampY: 0.24,
    ampR: 0.03,
    speed: 0.51,
    phase: 1.2,
  },
];

/** Waves: one fills downwards (`direction: 1`), one upwards. */
export const ASSISTANT_WAVES = [
  {
    color: [255, 60, 80],
    amplitude: 0.22,
    frequency: 0.6,
    speed: 0.7,
    phase: 1.4,
    opacity: 0.85,
    yOffset: 0.5,
    direction: 1,
  },
  {
    color: [255, 150, 165],
    amplitude: 0.22,
    frequency: 0.6,
    speed: 0.45,
    phase: 1.4 + Math.PI,
    opacity: 0.75,
    yOffset: 0.5,
    direction: -1,
  },
];

// ─── Maths ────────────────────────────────────────────────────────────────

/** A blob's centre and radius at `time` (seconds), as fractions. */
export const getBlobFrame = (blob, time) => {
  const t = time * blob.speed;
  const dx =
    Math.sin(t + blob.phase) * 0.7 + Math.sin(t * 1.73 + blob.phase * 2.1) * 0.3;
  const dy =
    Math.cos(t * 0.8 + blob.phase + 1.3) * 0.7 +
    Math.cos(t * 2.11 + blob.phase * 1.7 + 0.4) * 0.3;
  const dr =
    Math.sin(t * 0.6 + blob.phase + 2.5) * 0.6 +
    Math.sin(t * 1.47 + blob.phase * 0.9 + 3.1) * 0.4;
  return {
    x: blob.baseX + dx * blob.ampX,
    y: blob.baseY + dy * blob.ampY,
    r: blob.radius + dr * blob.ampR,
  };
};

/** A wave's height (px) at `x` (0..1 across) and `time` (seconds). */
export const getWaveY = (wave, x, time, height) => {
  const t = time * wave.speed;
  const swell = 1 + Math.sin(t * 0.5 + wave.phase) * 0.15;
  const drift = Math.sin(t * 0.4 + wave.phase + 2) * height * 0.06;
  return (
    wave.yOffset * height +
    drift +
    Math.sin(x * TAU * wave.frequency + t * 1.2 + wave.phase) *
      height *
      wave.amplitude *
      swell
  );
};

/** The soft edge (px) of the stage's reveal, inside its radius. */
export const ASSISTANT_RIPPLE_EDGE_PX = 60;

/** FR-6: the ripple radius (px) that covers the screen from (x, y). */
export const getRippleRadius = (x, y, width, height) =>
  Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) * 1.1 +
  ASSISTANT_RIPPLE_EDGE_PX;

/** FR-14: one turn of the input ring, and where it rests. */
export const RING_TURN_S = 8;
export const RING_REST_DEG = 70;

/**
 * FR-14: from `angle` (deg), the next resting angle ahead of it and the
 * time (s) to ease there at the spin's own pace.
 */
export const getRingRest = (angle) => {
  const current = Number.isFinite(angle) ? angle : 0;
  const turns = Math.ceil((current - RING_REST_DEG + 0.001) / 360);
  const target = RING_REST_DEG + turns * 360;
  return { target, duration: ((target - current) / 360) * RING_TURN_S };
};

/** The negative delay (s) that resumes the spin from `angle` (deg). */
export const getRingResumeDelay = (angle) => {
  const current = Number.isFinite(angle) ? angle : 0;
  const turn = ((current % 360) + 360) % 360;
  return -(turn / 360) * RING_TURN_S;
};

// ─── Painting ─────────────────────────────────────────────────────────────

const rgba = ([red, green, blue], alpha) =>
  `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;

function paintBlob(ctx, blob, width, height, time, intensity) {
  const { x, y, r } = getBlobFrame(blob, time);
  const cx = x * width;
  const cy = y * height;
  const radius = Math.max(1, r * Math.max(width, height));
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, rgba(blob.color, 0.77 * intensity));
  gradient.addColorStop(0.35, rgba(blob.color, 0.47 * intensity));
  gradient.addColorStop(0.7, rgba(blob.color, 0.13 * intensity));
  gradient.addColorStop(1, rgba(blob.color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function paintWave(ctx, wave, width, height, time, intensity) {
  const steps = 64;
  ctx.beginPath();
  ctx.moveTo(0, getWaveY(wave, 0, time, height));
  for (let step = 1; step <= steps; step += 1) {
    const x = step / steps;
    ctx.lineTo(x * width, getWaveY(wave, x, time, height));
  }
  const edge = wave.direction === 1 ? height + 20 : -20;
  ctx.lineTo(width, edge);
  ctx.lineTo(0, edge);
  ctx.closePath();

  const samples = Array.from({ length: 8 }, (_, index) =>
    getWaveY(wave, index / 7, time, height),
  );
  const start =
    wave.direction === 1 ? Math.min(...samples) : Math.max(...samples);
  const end = wave.direction === 1 ? start + height * 0.6 : start - height * 0.6;
  const gradient = ctx.createLinearGradient(0, start, 0, end);
  const alpha = wave.opacity * intensity;
  gradient.addColorStop(0, rgba(wave.color, alpha));
  gradient.addColorStop(0.4, rgba(wave.color, alpha * 0.55));
  gradient.addColorStop(1, rgba(wave.color, 0));
  ctx.fillStyle = gradient;
  ctx.fill();
}

/**
 * Paints the gradient over a `width` × `height` area at `time` (s).
 * `intensity` (0..1) dims it; `clear: false` paints over what is there.
 */
export function paintAssistantGradient(
  ctx,
  width,
  height,
  time,
  { intensity = 1, clear = true } = {},
) {
  if (clear) ctx.clearRect(0, 0, width, height);
  const previous = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  for (const blob of ASSISTANT_BLOBS) {
    paintBlob(ctx, blob, width, height, time, intensity);
  }
  for (const wave of ASSISTANT_WAVES) {
    paintWave(ctx, wave, width, height, time, intensity);
  }
  ctx.globalCompositeOperation = previous;
}

/**
 * FR-11: the orb, centred in a `size` × `size` canvas. `level` (0..1)
 * swells it (microphone, reply pulse); `intensity` dims it (sleeping).
 */
export function paintAssistantOrb(
  ctx,
  size,
  time,
  { level = 0, intensity = 1 } = {},
) {
  const center = size / 2;
  const breath = Math.sin(time * 1.2) * 0.015;
  const radius =
    center * 0.72 * (1 + breath + 0.16 * Math.max(0, Math.min(1, level)));
  ctx.clearRect(0, 0, size, size);

  const halo = ctx.createRadialGradient(
    center,
    center,
    radius * 0.8,
    center,
    center,
    radius * 1.34,
  );
  halo.addColorStop(0, `rgba(254, 0, 0, ${0.28 * intensity})`);
  halo.addColorStop(1, "rgba(254, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(center, center, radius * 1.34, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.clip();
  ctx.globalAlpha = 0.55 + 0.45 * intensity;
  const body = ctx.createRadialGradient(
    center - radius * 0.2,
    center - radius * 0.25,
    radius * 0.1,
    center,
    center,
    radius,
  );
  body.addColorStop(0, "rgb(255, 90, 110)");
  body.addColorStop(1, "rgb(200, 16, 46)");
  ctx.fillStyle = body;
  ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
  ctx.translate(center - radius, center - radius);
  paintAssistantGradient(ctx, radius * 2, radius * 2, time, {
    intensity,
    clear: false,
  });
  ctx.restore();

  const shine = ctx.createRadialGradient(
    center - radius * 0.35,
    center - radius * 0.4,
    0,
    center - radius * 0.35,
    center - radius * 0.4,
    radius * 0.7,
  );
  shine.addColorStop(0, `rgba(255, 255, 255, ${0.22 * intensity})`);
  shine.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.fill();
}
