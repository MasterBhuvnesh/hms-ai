// ICU deterioration early-warning helpers.
// Deterministic seeded vitals, no Date.now() / Math.random() at module scope.
// Own mulberry32 copy (base seed 0x1C); does NOT share the rng in data/hospital.ts.

// ---------------------------------------------------------------------------
// Local PRNG (own copy, do not import the shared rng from data/hospital.ts)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Base seed for the ICU vitals generator (0x1C). The patient key hash and the
// per-row recheck salt are mixed into this seed, so readings are deterministic
// per patient but change when "Recheck" bumps the salt.
const BASE_SEED = 0x1c;

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IcuVitals = {
  heartRate: number;
  spo2: number;
  systolic: number;
  respRate: number;
  tempF: number;
};

export type IcuBand = "Stable" | "Watch" | "Critical";

// Deterministic vitals for a patient key (e.g. `${bedId}:${patientName}`).
// Ranges: heartRate 55-140, spo2 88-100, systolic 85-180, respRate 10-34,
// tempF 97-104 (one decimal).
export function vitalsFor(patientId: string, salt = 0): IcuVitals {
  const seed = (hashString(patientId) ^ BASE_SEED ^ Math.imul(salt, 0x9e3779b1)) >>> 0;
  const rng = mulberry32(seed);
  const ri = (min: number, max: number): number => Math.floor(rng() * (max - min + 1)) + min;
  return {
    heartRate: ri(55, 140),
    spo2: ri(88, 100),
    systolic: ri(85, 180),
    respRate: ri(10, 34),
    tempF: Math.round((97 + rng() * 7) * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// NEWS-like early-warning score (documented rule set).
//
//   SpO2:      <92 -> +3, <94 -> +2, <96 -> +1
//   HeartRate: >130 -> +3, >110 -> +2, <40 -> +3
//   Systolic:  <90 -> +3, >220 -> +3 (upper bound never fires within the
//              85-180 generator range; kept for NEWS parity)
//   RespRate:  >30 -> +3, >24 -> +2
//   TempF:     >103 -> +1
//
// Band: score >= 7 -> Critical, >= 4 -> Watch, else Stable.
// Score is clamped to 0-12.
// ---------------------------------------------------------------------------

export function scoreVitals(v: IcuVitals): { score: number; band: IcuBand } {
  let score = 0;
  if (v.spo2 < 92) score += 3;
  else if (v.spo2 < 94) score += 2;
  else if (v.spo2 < 96) score += 1;
  if (v.heartRate > 130) score += 3;
  else if (v.heartRate > 110) score += 2;
  if (v.heartRate < 40) score += 3;
  if (v.systolic < 90) score += 3;
  else if (v.systolic > 220) score += 3;
  if (v.respRate > 30) score += 3;
  else if (v.respRate > 24) score += 2;
  if (v.tempF > 103) score += 1;
  score = Math.min(12, Math.max(0, score));
  const band: IcuBand = score >= 7 ? "Critical" : score >= 4 ? "Watch" : "Stable";
  return { score, band };
}
