// scripts/convert-areas.ts
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

/**
 * Tries to find a column name by multiple aliases (case-insensitive).
 */
function pick(headers: string[], aliases: string[]): string {
  const lower = headers.map(h => h.toLowerCase());
  for (const a of aliases) {
    const idx = lower.indexOf(a.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  throw new Error(`Missing column. Tried: ${aliases.join(", ")}`);
}

function toNum(x: any) {
  const n = Number(x);
  if (!Number.isFinite(n)) throw new Error(`Non-numeric ID encountered: ${x}`);
  return n;
}

const excelPath = process.argv[2] || "nooloman-areas.xlsx"; // put your file at project root
const outFlat = path.resolve("areas.flat.json");
const outHier = path.resolve("areas.hier.json");

const wb = XLSX.readFile(excelPath);
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[sheetName], { defval: "" });

if (!rows.length) throw new Error("Excel sheet is empty");

const headers = Object.keys(rows[0]);

// Adjust aliases to match your file’s headers if they differ
const STATE_ID   = pick(headers, ["state_id", "StateID", "stateId"]);
const STATE_NAME = pick(headers, ["state_name", "State", "state"]);
const WILAYA_ID  = pick(headers, ["wilaya_id", "WilayaID", "wilayaId"]);
const WILAYA_NAME= pick(headers, ["wilaya_name", "Wilaya", "wilaya"]);
const AREA_ID    = pick(headers, ["area_id", "AreaID", "areaId"]);
const AREA_NAME  = pick(headers, ["area_name", "Area", "area"]);

type Flat = {
  state_id: number;  state: string;
  wilaya_id: number; wilaya: string;
  area_id: number;   area: string;
};

// Build flat list (deduped & sorted)
const flat: Flat[] = [];
const seen = new Set<string>();

for (const r of rows) {
  const item: Flat = {
    state_id:  toNum(r[STATE_ID]),
    state:     String(r[STATE_NAME]).trim(),
    wilaya_id: toNum(r[WILAYA_ID]),
    wilaya:    String(r[WILAYA_NAME]).trim(),
    area_id:   toNum(r[AREA_ID]),
    area:      String(r[AREA_NAME]).trim(),
  };
  const key = `${item.state_id}-${item.wilaya_id}-${item.area_id}`;
  if (!seen.has(key)) {
    seen.add(key);
    flat.push(item);
  }
}

// Sort for stable UI (state -> wilaya -> area)
flat.sort((a,b)=>
  a.state_id - b.state_id ||
  a.wilaya_id - b.wilaya_id ||
  a.area_id - b.area_id
);

// Build hierarchical structure
type Hier = {
  state_id: number; state: string;
  wilayas: { wilaya_id: number; wilaya: string; areas: { area_id: number; area: string }[] }[];
};

const hierMap = new Map<number, Hier>();
for (const f of flat) {
  if (!hierMap.has(f.state_id)) {
    hierMap.set(f.state_id, { state_id: f.state_id, state: f.state, wilayas: [] });
  }
  const st = hierMap.get(f.state_id)!;

  let wil = st.wilayas.find(w => w.wilaya_id === f.wilaya_id);
  if (!wil) {
    wil = { wilaya_id: f.wilaya_id, wilaya: f.wilaya, areas: [] };
    st.wilayas.push(wil);
  }
  if (!wil.areas.find(a => a.area_id === f.area_id)) {
    wil.areas.push({ area_id: f.area_id, area: f.area });
  }
}

// Sort wilayas and areas
const hier = Array.from(hierMap.values()).map(st => ({
  ...st,
  wilayas: st.wilayas
    .sort((a,b)=>a.wilaya_id - b.wilaya_id)
    .map(w => ({ ...w, areas: w.areas.sort((a,b)=>a.area_id - b.area_id) }))
}));

// Write outputs at project root
fs.writeFileSync(outFlat, JSON.stringify(flat, null, 2));
fs.writeFileSync(outHier, JSON.stringify(hier, null, 2));
console.log(`Wrote ${outFlat} and ${outHier} ✅`);
