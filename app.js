/* ============================================================
   Pressure Tank Calculator v6.2
   Caspian Mobadel Amard
   ============================================================ */

/* ============ Globals ============ */
let PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES || {}));
let CATALOG = window.EMBEDDED_CATALOG || {categories:{}};

const HEAD_HISTORY_KEY = 'csp_head_history_v1';
const COIL_HISTORY_KEY = 'csp_coil_history_v1';
const WORKSHOP_KEY = 'csp_workshop_v1';
const ORDER_MODE = {current: 'A'};
let LAST_VOLUME = null;

/* ============ Workshop Defaults ============ */
const DEFAULT_WORKSHOP = {
  maxBaseThickness: 8,
  maxManhole16Thickness: 12,
  maxManhole18Thickness: 15,
  maxManhole20Thickness: 20,
  maxCoilDiameter: 2000,
  maxCoilHeight: 1500,
  minCoilWallClearance: 50,
  maxNakh: 6,
  branchePerNakh: 6,
  defaultGap: 0
};

function loadWorkshop(){
  try {
    const s = localStorage.getItem(WORKSHOP_KEY);
    return s ? Object.assign({}, DEFAULT_WORKSHOP, JSON.parse(s)) : {...DEFAULT_WORKSHOP};
  } catch(e) { return {...DEFAULT_WORKSHOP}; }
}
function saveWorkshop(w){
  try { localStorage.setItem(WORKSHOP_KEY, JSON.stringify(w)); } catch(e) {}
}
let WORKSHOP = loadWorkshop();

/* ============ SVG Icons ============ */
const SVG_ICONS = {
  tank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="10" rx="0.5"/><path d="M2 7 Q6 3 12 3 Q18 3 22 7"/><path d="M2 17 Q6 21 12 21 Q18 21 22 17"/></svg>',
  head:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12 Q12 2 21 12"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
  coil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7 Q9 4 11 7 Q13 10 15 7 Q17 4 19 7"/><path d="M5 12 Q9 9 11 12 Q13 15 15 12 Q17 9 19 12"/><path d="M5 17 Q9 14 11 17 Q13 20 15 17 Q17 14 19 17"/></svg>',
  utube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4 L8 14 Q8 18 12 18 Q16 18 16 14 L16 4"/></svg>',
  base:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6 L4 20 L8 20 L8 12 L16 12 L16 20 L20 20 L20 6"/></svg>',
  pad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="14" width="20" height="5"/></svg>',
  manhole:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4.5"/></svg>',
  flange:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>',
  valve:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7 L12 12 L6 17 Z"/><path d="M18 7 L12 12 L18 17 Z"/></svg>',
  cathode:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="3" x2="12" y2="21"/><line x1="7" y1="7" x2="17" y2="7"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="19" x2="17" y2="19"/></svg>',
  ladder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="7" y1="3" x2="7" y2="21"/><line x1="17" y1="3" x2="17" y2="21"/><line x1="7" y1="6" x2="17" y2="6"/><line x1="7" y1="10" x2="17" y2="10"/><line x1="7" y1="14" x2="17" y2="14"/><line x1="7" y1="18" x2="17" y2="18"/></svg>',
  resin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="9" r="2"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="14" r="2"/><circle cx="17" cy="13" r="2"/></svg>',
  tower:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="3" width="10" height="18" rx="0.5"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>',
  tray:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="2.5"/><rect x="3" y="14" width="18" height="2.5"/></svg>',
  diaphragm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6 Q12 12 4 18"/><path d="M20 6 Q12 12 20 18"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8 L12 3 L21 8 L21 20 L12 20 L3 20 Z"/><path d="M3 8 L12 13 L21 8"/></svg>',
  nozzle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9 L18 9 L18 15 L6 15 Z"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
  pipeIn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12 L10 12 L10 8 L18 8 L18 16 L10 16 L10 12"/></svg>'
};

const MAT_RHO = {'ST37':7850,'S235JR':7850,'A516-70':7850,'Galvanized':7850,'SS304':8000,'SS316':8000};
const MAT_S = {'ST37':13500,'S235JR':15000,'A516-70':20000,'Galvanized':14000,'SS304':16700,'SS316':16700};

const PIPE_OD = {
  'galv_3_4':26.67,'galv_1':33.40,'galv_1_1_4':42.16,'galv_1_1_2':48.26,
  'galv_2':60.33,'galv_2_1_2':73.03,'galv_3':88.90,'galv_4':114.30,
  'SS304_3_4':26.67,'SS304_1':33.40,'SS304_1_1_4':42.16,'SS304_1_1_2':48.26,
  'SS304_2':60.33,'SS304_2_1_2':73.03,'SS304_3':88.90,'SS304_4':114.30,
  'SS309_3_4':26.67,'SS309_1':33.40,'SS309_1_1_4':42.16,'SS309_1_1_2':48.26,
  'SS309_2':60.33,'SS309_2_1_2':73.03,'SS309_3':88.90,'SS309_4':114.30,
  'copper_3_4':22.23,'copper_1':28.58,'copper_1_1_4':34.93
};

/* ============ فرمول‌ها ============ */
const cylVol = (D,H) => Math.PI/4 * D*D * H / 1e6;
const boxVol = (L,W,H) => L*W*H / 1e6;
const dishVT = D => 0.0809 * Math.pow(D,3) / 1e6;
const dishVE = D => Math.PI/24 * Math.pow(D,3) / 1e6;

function totalVol(D,H,head){
  let v = cylVol(D,H);
  if(head==='torisph') v += 2*dishVT(D);
  else if(head==='ellip') v += 2*dishVE(D);
  return v;
}
function diamFromV(V,H,head){
  const k = head==='torisph'?0.0809/1e6 : head==='ellip'?(Math.PI/24/1e6):0;
  let lo=10, hi=20000;
  for(let i=0;i<80;i++){
    const m=(lo+hi)/2;
    const f = 2*k*Math.pow(m,3) + (Math.PI*H/4)*m*m - V*1e6;
    if(f>0) hi=m; else lo=m;
  }
  return (lo+hi)/2;
}
function hFromV(V,D,head){
  let vh=0;
  if(head==='torisph') vh=2*dishVT(D);
  else if(head==='ellip') vh=2*dishVE(D);
  const vc = V-vh;
  if(vc<=0) return 0;
  return vc*1e6/(Math.PI/4*D*D);
}
function calcBoxDims(V, L_in, W_in, H_in){
  const Vmm3 = V * 1e6;
  const result = {L:0, W:0, H:0, mode:'', ratio:0};
  const haveL = L_in > 0, haveW = W_in > 0, haveH = H_in > 0;
  const known = (haveL?1:0) + (haveW?1:0) + (haveH?1:0);
  if(known === 0){
    const side = Math.cbrt(Vmm3);
    result.L = result.W = result.H = side;
    result.mode = 'مکعب منتظم';
  } else if(known === 1){
    if(haveL){ result.L = L_in; result.W = result.H = Math.sqrt(Vmm3 / L_in); result.mode = 'L معلوم'; }
    else if(haveW){ result.W = W_in; result.L = result.H = Math.sqrt(Vmm3 / W_in); result.mode = 'W معلوم'; }
    else { result.H = H_in; result.L = result.W = Math.sqrt(Vmm3 / H_in); result.mode = 'H معلوم'; }
  } else if(known === 2){
    if(haveL && haveW){ result.L = L_in; result.W = W_in; result.H = Vmm3/(L_in*W_in); result.mode = 'L و W'; }
    else if(haveL && haveH){ result.L = L_in; result.H = H_in; result.W = Vmm3/(L_in*H_in); result.mode = 'L و H'; }
    else { result.W = W_in; result.H = H_in; result.L = Vmm3/(W_in*H_in); result.mode = 'W و H'; }
  } else {
    result.L = L_in; result.W = W_in; result.H = H_in;
    result.ratio = (L_in * W_in * H_in / 1e6) / V;
    result.mode = 'همه معلوم';
  }
  return result;
}
function calcBlank(D,h,L,t,type){
  let Db;
  if(type==='shallow'||type==='torisph') Db=Math.sqrt(D*D+4*D*h)+2*L;
  else if(type==='ellip') Db=Math.sqrt(D*D+4*h*h)+2*L;
  else if(type==='hemi') Db=1.414*D+2*L;
  else Db=Math.sqrt(D*D+4*D*h)+2*L;
  const A=Math.PI/4*Math.pow(Db/1000,2);
  return {Db, A, W:A*(t/1000)*7850, perim:Math.PI*Db};
}
function calcThermalArea(branches, pipeSize){
  const L_m = (branches||0) * 6;
  const OD_mm = PIPE_OD[pipeSize] || 33.40;
  return Math.PI * (OD_mm/1000) * L_m;
}
function calcBoxShellWeight(f){
  const W_m = f.w/1000, H_m = f.h/1000, L_m = f.l/1000, t_m = f.t/1000;
  const bent_length = 2 * (W_m + L_m) + 0.06;
  const bent_area = bent_length * H_m;
  const end_area = 2 * (W_m * L_m);
  return (bent_area + end_area) * t_m * MAT_RHO[f.mat || 'ST37'];
}

/* ============ شماتیک SVG مخزن ============ */
function generateTankSVG(D, H, label){
  const scale = Math.min(240 / D, 180 / H);
  const dPx = D * scale;
  const hPx = H * scale;
  const x = 200 - dPx / 2;
  const y = 60;
  const dishH = Math.min(30, dPx * 0.15);
  const yBottom = y + dishH + hPx;
  const yBottomDish = yBottom + dishH;
  const totalH = yBottomDish + 20;
  return `
    <svg viewBox="0 0 400 ${totalH}" style="max-width:400px;width:100%;height:auto">
      <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#3F3A32"/></marker></defs>
      <path d="M${x} ${y+dishH} Q200 ${y-dishH*0.3} ${x+dPx} ${y+dishH} L${x+dPx} ${y+dishH+4} Q200 ${y-dishH*0.3+4} ${x} ${y+dishH+4} Z" fill="#D4C8B0" stroke="#3F3A32" stroke-width="1.5"/>
      <rect x="${x}" y="${y+dishH}" width="${dPx}" height="${hPx}" fill="#F5EFE0" stroke="#3F3A32" stroke-width="2"/>
      <rect x="${x}" y="${y+dishH}" width="${dPx}" height="${hPx*0.15}" fill="#E5DBC4" opacity="0.5"/>
      <line x1="${x}" y1="${y+dishH+hPx*0.5}" x2="${x+dPx}" y2="${y+dishH+hPx*0.5}" stroke="#8B7D5E" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="M${x} ${y+dishH+hPx} Q200 ${y+dishH+hPx+dishH*1.3} ${x+dPx} ${y+dishH+hPx} L${x+dPx} ${y+dishH+hPx+4} Q200 ${y+dishH+hPx+dishH*1.3+4} ${x} ${y+dishH+hPx+4} Z" fill="#D4C8B0" stroke="#3F3A32" stroke-width="1.5"/>
      <line x1="${x}" y1="${yBottomDish + 8}" x2="${x+dPx}" y2="${yBottomDish + 8}" stroke="#3F3A32" stroke-width="1.2" marker-start="url(#arr)" marker-end="url(#arr)"/>
      <text x="200" y="${yBottomDish + 24}" text-anchor="middle" font-family="Courier New" font-size="15" font-weight="900" fill="#E85D04">D = ${Math.round(D)} mm</text>
      <line x1="${x - 20}" y1="${y+dishH}" x2="${x - 20}" y2="${y+dishH+hPx}" stroke="#3F3A32" stroke-width="1.2" marker-start="url(#arr)" marker-end="url(#arr)"/>
      <text x="${x - 30}" y="${y+dishH+hPx/2}" text-anchor="middle" font-family="Courier New" font-size="15" font-weight="900" fill="#E85D04" transform="rotate(-90 ${x - 30} ${y+dishH+hPx/2})">H = ${Math.round(H)} mm</text>
      <text x="200" y="20" text-anchor="middle" font-family="Tahoma" font-size="13" font-weight="800" fill="#1F1A12">${label || ''}</text>
    </svg>
  `;
}

function generateBoxSVG(L, W, H, label){
  const scale = Math.min(200 / L, 160 / H);
  const lPx = L * scale;
  const hPx = H * scale;
  const wOffset = W * scale * 0.4;
  const x = 100;
  const y = 60;
  return `
    <svg viewBox="0 0 400 300" style="max-width:400px;width:100%;height:auto">
      <defs><marker id="arr2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#3F3A32"/></marker></defs>
      <rect x="${x + wOffset}" y="${y - wOffset}" width="${lPx}" height="${hPx}" fill="#E5DBC4" stroke="#3F3A32" stroke-width="1.5"/>
      <path d="M${x} ${y} L${x + wOffset} ${y - wOffset} L${x + wOffset + lPx} ${y - wOffset} L${x + lPx} ${y} Z" fill="#D4C8B0" stroke="#3F3A32" stroke-width="1.5"/>
      <path d="M${x + lPx} ${y} L${x + wOffset + lPx} ${y - wOffset} L${x + wOffset + lPx} ${y - wOffset + hPx} L${x + lPx} ${y + hPx} Z" fill="#C4B8A0" stroke="#3F3A32" stroke-width="1.5"/>
      <rect x="${x}" y="${y}" width="${lPx}" height="${hPx}" fill="#F5EFE0" stroke="#3F3A32" stroke-width="2"/>
      <text x="${x + lPx/2}" y="${y + hPx + 38}" text-anchor="middle" font-family="Courier New" font-size="14" font-weight="900" fill="#E85D04">L = ${Math.round(L)} mm</text>
      <text x="${x - 30}" y="${y + hPx/2}" text-anchor="middle" font-family="Courier New" font-size="14" font-weight="900" fill="#E85D04" transform="rotate(-90 ${x - 30} ${y + hPx/2})">H = ${Math.round(H)} mm</text>
      <text x="${x + lPx + 40}" y="${y + hPx/2 - wOffset/2 - 5}" text-anchor="middle" font-family="Courier New" font-size="12" font-weight="900" fill="#E85D04">W = ${Math.round(W)}</text>
      <text x="200" y="20" text-anchor="middle" font-family="Tahoma" font-size="13" font-weight="800" fill="#1F1A12">${label || ''}</text>
    </svg>
  `;
}

/* ============ شماتیک کویل فنری سه‌بعدی ============ */
function drawCoilSVG(Dtank, Htank, dishH, Dcoil, coilHeight, OD, turns, pitch, clear, fits){
  const vbW = 800, vbH = 700;
  const totalTankH = Htank + 2 * dishH;
  const scale = Math.min(500 / totalTankH, 380 / Dtank, 0.4);
  
  const DtankPx = Dtank * scale;
  const HtankPx = Htank * scale;
  const dishHPx = Math.max(20, dishH * scale);
  const DcoilPx = Dcoil * scale;
  const coilHPx = Math.max(40, coilHeight * scale);
  const clearPx = clear * scale;
  
  const cx = vbW / 2;
  const topDishTopY = 80;
  const weldTopY = topDishTopY + dishHPx;
  const weldBottomY = weldTopY + HtankPx;
  const bottomDishBottomY = weldBottomY + dishHPx;
  
  const tankLeft = cx - DtankPx / 2;
  const tankRight = cx + DtankPx / 2;
  const coilCx = cx;
  const coilR = DcoilPx / 2;
  const coilTopY = weldTopY + clearPx;
  const coilBottomY = coilTopY + coilHPx;
  
  const strokeW = Math.max(4, OD * scale * 1.2);
  const pitchPx = coilHPx / Math.max(turns, 1);
  const tiltA = DcoilPx * 0.15;
  
  let svg = `<svg viewBox="0 0 ${vbW} ${vbH}" width="100%" style="max-width:${vbW}px">`;
  
  // مخزن
  svg += `<path d="M${tankLeft} ${weldTopY} Q${cx} ${topDishTopY - dishHPx * 0.2} ${tankRight} ${weldTopY}" fill="#F5EFE0" stroke="#3F3A32" stroke-width="2"/>`;
  svg += `<rect x="${tankLeft}" y="${weldTopY}" width="${DtankPx}" height="${HtankPx}" fill="#FAF6EB" stroke="#3F3A32" stroke-width="2"/>`;
  svg += `<path d="M${tankLeft} ${weldBottomY} Q${cx} ${bottomDishBottomY + dishHPx * 0.2} ${tankRight} ${weldBottomY}" fill="#F5EFE0" stroke="#3F3A32" stroke-width="2"/>`;
  
  // خطوط جوش
  svg += `<line x1="${tankLeft}" y1="${weldTopY}" x2="${tankRight}" y2="${weldTopY}" stroke="#E85D04" stroke-width="2.5" stroke-dasharray="8 4"/>`;
  svg += `<line x1="${tankLeft}" y1="${weldBottomY}" x2="${tankRight}" y2="${weldBottomY}" stroke="#E85D04" stroke-width="2.5" stroke-dasharray="8 4"/>`;
  svg += `<text x="${tankRight + 12}" y="${weldTopY + 4}" font-family="Tahoma" font-size="10" font-weight="800" fill="#E85D04">جوش بالا</text>`;
  svg += `<text x="${tankRight + 12}" y="${weldBottomY + 4}" font-family="Tahoma" font-size="10" font-weight="800" fill="#E85D04">جوش پایین</text>`;
  
  // فاصله بالا
  svg += `<line x1="${tankRight - 20}" y1="${weldTopY}" x2="${tankRight - 20}" y2="${coilTopY}" stroke="#0369A1" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  svg += `<rect x="${tankRight - 55}" y="${(weldTopY + coilTopY) / 2 - 10}" width="50" height="20" fill="#fff" stroke="#0369A1" stroke-width="1" rx="3"/>`;
  svg += `<text x="${tankRight - 30}" y="${(weldTopY + coilTopY) / 2 + 4}" text-anchor="middle" font-family="Courier New" font-size="10" font-weight="900" fill="#0369A1">${clear} mm</text>`;
  
  // فاصله پایین
  svg += `<line x1="${tankRight - 20}" y1="${coilBottomY}" x2="${tankRight - 20}" y2="${weldBottomY}" stroke="#0369A1" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  svg += `<rect x="${tankRight - 55}" y="${(coilBottomY + weldBottomY) / 2 - 10}" width="50" height="20" fill="#fff" stroke="#0369A1" stroke-width="1" rx="3"/>`;
  svg += `<text x="${tankRight - 30}" y="${(coilBottomY + weldBottomY) / 2 + 4}" text-anchor="middle" font-family="Courier New" font-size="10" font-weight="900" fill="#0369A1">${clear} mm</text>`;
  
  // کویل فنری
  const coilColor = fits ? '#0369A1' : '#DC2626';
  const coilColorDark = fits ? '#075985' : '#991B1B';
  const coilColorLight = fits ? '#7DD3FC' : '#FCA5A5';
  
  const segmentsPerTurn = 48;
  const totalSegments = Math.max(segmentsPerTurn, Math.ceil(turns * segmentsPerTurn));
  const points = [];
  
  for (let i = 0; i <= totalSegments; i++) {
    const t = (i / totalSegments) * turns;
    if (t > turns) break;
    const angle = 2 * Math.PI * t;
    const x = coilCx + coilR * Math.cos(angle);
    const yBase = coilTopY + (t / turns) * coilHPx;
    const y = yBase + tiltA * Math.sin(angle);
    const depth = Math.sin(angle);
    points.push({ x, y, depth, t });
  }
  
  // پشت‌ها
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i], p2 = points[i + 1];
    if (p1.depth < 0.1 && p2.depth < 0.1) continue;
    if (p1.depth < -0.1 || p2.depth < -0.1) continue;
    const avgDepth = (p1.depth + p2.depth) / 2;
    const width = strokeW * (0.5 + 0.3 * avgDepth);
    const opacity = 0.5 + 0.3 * avgDepth;
    svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${coilColorDark}" stroke-width="${width.toFixed(1)}" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>`;
  }
  
  // جلوها
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i], p2 = points[i + 1];
    if (p1.depth > -0.1 && p2.depth > -0.1) continue;
    if (p1.depth > 0.1 || p2.depth > 0.1) continue;
    const avgDepth = (p1.depth + p2.depth) / 2;
    const width = strokeW * (0.85 + 0.3 * -avgDepth);
    svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${coilColor}" stroke-width="${width.toFixed(1)}" stroke-linecap="round"/>`;
    svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${coilColorLight}" stroke-width="${(width * 0.3).toFixed(1)}" stroke-linecap="round" opacity="0.7"/>`;
  }
  
  // ورودی/خروجی
  if (points.length > 0) {
    const inlet = points[0];
    svg += `<circle cx="${inlet.x.toFixed(1)}" cy="${inlet.y.toFixed(1)}" r="${(strokeW * 0.8).toFixed(1)}" fill="${coilColor}" stroke="#fff" stroke-width="2"/>`;
    svg += `<text x="${inlet.x + 15}" y="${inlet.y - 5}" font-family="Tahoma" font-size="11" font-weight="800" fill="#0369A1">ورودی</text>`;
    const outlet = points[points.length - 1];
    svg += `<circle cx="${outlet.x.toFixed(1)}" cy="${outlet.y.toFixed(1)}" r="${(strokeW * 0.8).toFixed(1)}" fill="${coilColor}" stroke="#fff" stroke-width="2"/>`;
    svg += `<text x="${outlet.x + 15}" y="${outlet.y + 15}" font-family="Tahoma" font-size="11" font-weight="800" fill="#0369A1">خروجی</text>`;
  }
  
  // فلش ارتفاع کویل
  const arrowX = tankLeft - 45;
  svg += `<line x1="${arrowX}" y1="${coilTopY}" x2="${arrowX}" y2="${coilBottomY}" stroke="#1F1A12" stroke-width="1.5"/>`;
  svg += `<polygon points="${arrowX},${coilTopY} ${arrowX-5},${coilTopY+10} ${arrowX+5},${coilTopY+10}" fill="#1F1A12"/>`;
  svg += `<polygon points="${arrowX},${coilBottomY} ${arrowX-5},${coilBottomY-10} ${arrowX+5},${coilBottomY-10}" fill="#1F1A12"/>`;
  svg += `<text x="${arrowX - 15}" y="${(coilTopY + coilBottomY) / 2}" font-family="Courier New" font-size="13" font-weight="900" fill="#1F1A12" transform="rotate(-90 ${arrowX - 15} ${(coilTopY + coilBottomY) / 2})" text-anchor="middle">H = ${coilHeight.toFixed(0)} mm</text>`;
  
  // عنوان
  svg += `<text x="${cx}" y="30" text-anchor="middle" font-family="Tahoma" font-size="15" font-weight="800" fill="#1F1A12">کویل ${turns.toFixed(1)} دور × قطر ${Dcoil} mm — ${fits ? '✅ جا می‌شود' : '⚠️ جا نمی‌شود'}</text>`;
  
  // ارتفاع کل مخزن
  const arrowXTank = tankRight + 60;
  svg += `<line x1="${arrowXTank}" y1="${topDishTopY}" x2="${arrowXTank}" y2="${bottomDishBottomY}" stroke="#3F3A32" stroke-width="1.2"/>`;
  svg += `<polygon points="${arrowXTank},${topDishTopY} ${arrowXTank-4},${topDishTopY+8} ${arrowXTank+4},${topDishTopY+8}" fill="#3F3A32"/>`;
  svg += `<polygon points="${arrowXTank},${bottomDishBottomY} ${arrowXTank-4},${bottomDishBottomY-8} ${arrowXTank+4},${bottomDishBottomY-8}" fill="#3F3A32"/>`;
  svg += `<text x="${arrowXTank + 15}" y="${(topDishTopY + bottomDishBottomY) / 2}" font-family="Courier New" font-size="12" font-weight="900" fill="#3F3A32" transform="rotate(90 ${arrowXTank + 15} ${(topDishTopY + bottomDishBottomY) / 2})" text-anchor="middle">H_total = ${Htank + 2*dishH} mm</text>`;
  
  // قطر کویل
  const diamY = coilBottomY + 40;
  if (diamY < vbH - 20) {
    svg += `<line x1="${coilCx - coilR}" y1="${diamY}" x2="${coilCx + coilR}" y2="${diamY}" stroke="#3F3A32" stroke-width="1.2"/>`;
    svg += `<polygon points="${coilCx - coilR},${diamY} ${coilCx - coilR + 8},${diamY-4} ${coilCx - coilR + 8},${diamY+4}" fill="#3F3A32"/>`;
    svg += `<polygon points="${coilCx + coilR},${diamY} ${coilCx + coilR - 8},${diamY-4} ${coilCx + coilR - 8},${diamY+4}" fill="#3F3A32"/>`;
    svg += `<text x="${coilCx}" y="${diamY + 18}" text-anchor="middle" font-family="Courier New" font-size="13" font-weight="900" fill="#E85D04">D_coil = ${Dcoil} mm</text>`;
  }
  
  svg += '</svg>';
  return svg;
}

/* ============ تعریف تجهیزات ============ */
const EQUIPMENT_DEFS = {
  spiral:{name:'منبع اسپیرال',svg:'tank',parts:['shell','head','coil_pipe','manhole','ladder','base','base_pad','inlet_outlet']},
  u_coil:{name:'منبع کوئلی U',svg:'tank',parts:['shell','head','utube','tube_sheet','manhole','base','base_pad','inlet_outlet']},
  softener:{name:'سختی‌گیر',svg:'tank',parts:['shell','head','manhole','ladder','base','base_pad','internal_piping']},
  sand_filter:{name:'فیلتر شنی',svg:'tank',parts:['shell','head','manhole','ladder','base','base_pad','internal_piping']},
  deaerator:{name:'دی‌اریتور',svg:'tower',parts:['shell','head','tower_shell','tower_head','tray','manhole','ladder','base','base_pad']},
  expansion_closed:{name:'منبع انبساط بسته',svg:'tank',parts:['shell','head','manhole','base','base_pad']},
  expansion_open:{name:'منبع انبساط باز',svg:'box',parts:['box_shell','nozzles','base']},
  condensate:{name:'مخزن کندانس',svg:'tank',parts:['shell','head','manhole','base','base_pad','internal_piping']}
};

const COST_ONLY_PARTS = ['flange','bushing','nozzle','cathode','resin','control_valve','diaphragm'];

/* تعریف اجزا */
const PART_DEFS = {
  shell:{name:'پوسته استوانه',icon:'shell',color:'orange',type:'structural',defOn:true,fields:[
    {id:'d',label:'قطر داخلی (mm)',def:1600},{id:'h',label:'ارتفاع (mm)',def:3000},
    {id:'t',label:'ضخامت (mm)',def:6},
    {id:'mat',label:'جنس',type:'select',options:[['ST37','ST37'],['S235JR','S235JR'],['A516-70','A516 Gr70'],['Galvanized','گالوانیزه'],['SS304','استیل ۳۰۴'],['SS316','استیل ۳۱۶']],def:'ST37'}]},
  head:{name:'عدسی‌ها',icon:'head',color:'violet',type:'structural',defOn:true,fields:[
    {id:'d',label:'قطر داخلی (mm)',def:1600},{id:'h',label:'گودی (mm)',def:107},
    {id:'l',label:'طول لبه (mm)',def:40},{id:'t',label:'ضخامت (mm)',def:8},
    {id:'htype',label:'نوع عدسی',type:'select',options:[['shallow','کم‌عمق'],['torisph','تورسفریکال'],['ellip','بیضوی'],['hemi','نیم‌کره']],def:'shallow'},
    {id:'mat',label:'جنس',type:'select',options:[['ST37','ST37'],['S235JR','S235JR'],['A516-70','A516 Gr70'],['Galvanized','گالوانیزه'],['SS304','استیل ۳۰۴']],def:'ST37'},
    {id:'n',label:'تعداد',def:2}]},
  coil_pipe:{name:'کویل مارپیچ',icon:'coil',color:'blue',type:'quantity',defOn:true,fields:[
    {id:'size',label:'سایز لوله',type:'select',options:[
      ['galv_3_4','گالوانیزه ۳/۴'],['galv_1','گالوانیزه ۱'],['galv_1_1_4','گالوانیزه ۱ ۱/۴'],
      ['galv_1_1_2','گالوانیزه ۱ ۱/۲'],['galv_2','گالوانیزه ۲'],['galv_2_1_2','گالوانیزه ۲ ۱/۲'],
      ['galv_3','گالوانیزه ۳'],['galv_4','گالوانیزه ۴'],
      ['SS304_3_4','استیل ۳۰۴ ۳/۴'],['SS304_1','استیل ۳۰۴ ۱'],['SS304_1_1_4','استیل ۳۰۴ ۱ ۱/۴'],
      ['SS304_1_1_2','استیل ۳۰۴ ۱ ۱/۲'],['SS304_2','استیل ۳۰۴ ۲'],['SS304_2_1_2','استیل ۳۰۴ ۲ ۱/۲'],
      ['SS304_3','استیل ۳۰۴ ۳'],['SS304_4','استیل ۳۰۴ ۴']
    ],def:'SS304_1'},
    {id:'branches',label:'مقدار مصرف (شاخه ۶۰۰cm)',def:2.5,hint:'2.5 شاخه = 15 متر'},
    {id:'thermal',label:'سطح حرارتی (m²) — خودکار',def:0,autoCalc:true}]},
  utube:{name:'کویل U شکل',icon:'utube',color:'blue',type:'quantity',defOn:true,fields:[
    {id:'mat',label:'جنس',type:'select',options:[['copper','مس'],['SS304','استیل ۳۰۴'],['SS309','استیل ۳۰۹']],def:'copper'},
    {id:'size',label:'سایز لوله',type:'select',options:[
      ['copper_3_4','مسی ۳/۴'],['copper_1','مسی ۱'],
      ['SS304_3_4','استیل ۳۰۴ ۳/۴'],['SS304_1','استیل ۳۰۴ ۱'],
      ['SS304_1_1_2','استیل ۳۰۴ ۱ ۱/۲'],['SS304_2','استیل ۳۰۴ ۲'],
      ['SS309_3_4','استیل ۳۰۹ ۳/۴'],['SS309_1','استیل ۳۰۹ ۱'],
      ['SS309_1_1_2','استیل ۳۰۹ ۱ ۱/۲'],['SS309_2','استیل ۳۰۹ ۲']
    ],def:'copper_1'},
    {id:'t',label:'ضخامت داخلی لوله (mm)',def:1.5},
    {id:'n',label:'تعداد لوله U',def:4},
    {id:'len',label:'طول هر لوله (mm)',def:6000},
    {id:'thermal',label:'سطح حرارتی (m²)',def:0,autoCalcU:true}]},
  tube_sheet:{name:'صفحه لوله',icon:'flange',color:'blue',type:'structural',defOn:true,fields:[
    {id:'d',label:'قطر صفحه (mm)',def:1550},{id:'t',label:'ضخامت (mm)',def:20},
    {id:'mat',label:'جنس',type:'select',options:[['ST37','ST37'],['A516-70','A516 Gr70'],['SS304','استیل ۳۰۴']],def:'A516-70'}]},
  manhole:{name:'منهول',icon:'manhole',color:'yellow',type:'structural',defOn:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[['16','۱۶ اینچ'],['18','۱۸ اینچ'],['20','۲۰ اینچ']],def:'16'},
    {id:'w',label:'عرض (mm)',def:400},{id:'h',label:'ارتفاع (mm)',def:500},
    {id:'t',label:'ضخامت (mm) — خودکار',def:0,autoManholeThickness:true},
    {id:'n',label:'تعداد',def:1}]},
  ladder:{name:'نردبان',icon:'ladder',color:'green',type:'quantity',defOn:false,fields:[
    {id:'pipe',label:'سایز قوطی',type:'select',options:[['pipe_30x30','۳۰×۳۰'],['pipe_40x40','۴۰×۴۰'],['pipe_50x50','۵۰×۵۰']],def:'pipe_40x40'},
    {id:'branches',label:'مقدار مصرف (شاخه ۶۰۰cm)',def:1.5,hint:'1.5 شاخه = 9 متر'}]},
  base:{name:'پایه (ابعادی)',icon:'base',color:'green',type:'structural',defOn:true,fields:[
    {id:'n',label:'تعداد',def:2},{id:'l',label:'طول (mm)',def:1200},
    {id:'w',label:'عرض (mm)',def:400},{id:'h',label:'ارتفاع (mm)',def:500},
    {id:'t',label:'ضخامت (mm) — حداکثر ۸',def:8,maxVal:8}]},
  base_pad:{name:'پد پایه',icon:'pad',color:'green',type:'structural',defOn:true,fields:[
    {id:'n',label:'تعداد',def:2},{id:'l',label:'طول (mm)',def:500},
    {id:'w',label:'عرض (mm)',def:300},{id:'t',label:'ضخامت (mm)',def:8}]},
  inlet_outlet:{name:'لوله ورودی/خروجی',icon:'pipeIn',color:'blue',type:'quantity_noWeight',defOn:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[
      ['galv_1','گالوانیزه ۱'],['galv_1_1_2','گالوانیزه ۱ ۱/۲'],['galv_2','گالوانیزه ۲'],
      ['galv_3','گالوانیزه ۳'],['galv_4','گالوانیزه ۴'],
      ['SS304_1','استیل ۳۰۴ ۱'],['SS304_2','استیل ۳۰۴ ۲'],['SS304_3','استیل ۳۰۴ ۳'],['SS304_4','استیل ۳۰۴ ۴']
    ],def:'galv_2'},
    {id:'len',label:'طول هر لوله (mm)',def:2000},{id:'n',label:'تعداد',def:2}]},
  internal_piping:{name:'لوله‌کشی داخلی',icon:'pipeIn',color:'blue',type:'quantity_cm',defOn:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[
      ['galv_1','گالوانیزه ۱'],['galv_1_1_2','گالوانیزه ۱ ۱/۲'],['galv_2','گالوانیزه ۲']
    ],def:'galv_1_1_2'},
    {id:'length_cm',label:'طول کل (cm)',def:250,hint:'فقط طول، بدون وزن'}]},
  tower_shell:{name:'پوسته برج',icon:'tower',color:'violet',type:'structural',defOn:true,fields:[
    {id:'d',label:'قطر برج (mm)',def:800},{id:'h',label:'ارتفاع برج (mm)',def:2500},
    {id:'t',label:'ضخامت (mm)',def:4},
    {id:'mat',label:'جنس',type:'select',options:[['SS304','استیل ۳۰۴'],['SS316','استیل ۳۱۶']],def:'SS304'}]},
  tower_head:{name:'عدسی برج',icon:'head',color:'violet',type:'structural',defOn:true,fields:[
    {id:'d',label:'قطر (mm)',def:800},{id:'t',label:'ضخامت (mm)',def:5},
    {id:'mat',label:'جنس',type:'select',options:[['SS304','استیل ۳۰۴'],['SS316','استیل ۳۱۶']],def:'SS304'}]},
  tray:{name:'سینی‌های سوراخ‌دار',icon:'tray',color:'yellow',type:'structural',defOn:true,fields:[{id:'n',label:'تعداد سینی',def:5}]},
  box_shell:{name:'بدنه مکعبی (خم وسط)',icon:'box',color:'orange',type:'structural',defOn:true,fields:[
    {id:'l',label:'طول (mm)',def:1000},{id:'w',label:'عرض (mm)',def:1000},{id:'h',label:'ارتفاع (mm)',def:1000},
    {id:'t',label:'ضخامت (mm)',def:4},
    {id:'mat',label:'جنس',type:'select',options:[['ST37','ST37'],['Galvanized','گالوانیزه']],def:'ST37'}]},
  nozzles:{name:'نازل‌ها',icon:'nozzle',color:'yellow',type:'structural',defOn:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[['1','۱'],['2','۲'],['3','۳'],['4','۴']],def:'2'},
    {id:'n',label:'تعداد',def:4}]},
  cathode:{name:'حفاظت کاتدی',icon:'cathode',color:'orange',type:'cost_only',defOn:true,costOnly:true,fields:[
    {id:'type',label:'نوع آند',type:'select',options:[['zn','آند روی'],['al','آند آلومینیوم'],['mg','آند منیزیم']],def:'zn'},
    {id:'n',label:'تعداد',def:2}]},
  resin:{name:'رزین',icon:'resin',color:'green',type:'cost_only',defOn:true,costOnly:true,fields:[
    {id:'d',label:'قطر بستر (mm)',def:1000},{id:'h',label:'ارتفاع بستر (mm)',def:1200},
    {id:'fill',label:'ضریب',def:0.6}]},
  control_valve:{name:'شیر کنترل',icon:'valve',color:'orange',type:'cost_only',defOn:true,costOnly:true,fields:[
    {id:'type',label:'نوع',type:'select',options:[['auto','اتوماتیک'],['semi','نیمه اتوماتیک'],['manual','دستی']],def:'auto'}]},
  diaphragm:{name:'دیافراگم',icon:'diaphragm',color:'violet',type:'cost_only',defOn:true,costOnly:true,fields:[
    {id:'d',label:'قطر (mm)',def:600},
    {id:'type',label:'نوع',type:'select',options:[['butyl','بوتیل'],['epdm','EPDM']],def:'butyl'}]},
  flange:{name:'فلنج',icon:'flange',color:'blue',type:'cost_only',defOn:false,costOnly:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[['flange_1','۱'],['flange_1_1_2','۱ ۱/۲'],['flange_2','۲'],['flange_3','۳'],['flange_4','۴'],['flange_6','۶'],['flange_8','۸']],def:'flange_2'},
    {id:'n',label:'تعداد',def:4}]},
  bushing:{name:'بوشن',icon:'nozzle',color:'blue',type:'cost_only',defOn:false,costOnly:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[['bush_1','۱'],['bush_1_1_2','۱ ۱/۲'],['bush_2','۲'],['bush_3','۳'],['bush_4','۴']],def:'bush_2'},
    {id:'n',label:'تعداد',def:4}]},
  nozzle:{name:'نازل',icon:'nozzle',color:'blue',type:'cost_only',defOn:false,costOnly:true,fields:[
    {id:'size',label:'سایز',type:'select',options:[['1','۱'],['1_1_2','۱ ۱/۲'],['2','۲'],['3','۳'],['4','۴']],def:'2'},
    {id:'n',label:'تعداد',def:4}]}
};

/* ============ State ============ */
const EQ_STATE = {weight:{}, cost:{}};

function initEqState(mode){
  const eqId = mode==='weight'?'w-eq':'c-eq';
  const eqEl = document.getElementById(eqId);
  if(!eqEl) return;
  const eq = eqEl.value;
  const def = EQUIPMENT_DEFS[eq];
  if(!def) return;

  Object.keys(EQ_STATE[mode]).forEach(k => {
    if(k !== eq && k !== '_lastResult') delete EQ_STATE[mode][k];
  });

  if(!EQ_STATE[mode][eq]){
    EQ_STATE[mode][eq] = {};
    let partsList = [...def.parts];
    if(mode === 'cost') partsList = partsList.concat(COST_ONLY_PARTS);
    partsList.forEach(p => {
      const pd = PART_DEFS[p];
      if(!pd) return;
      if(mode==='weight' && pd.costOnly) return;
      const fields = {};
      pd.fields.forEach(f=>{
        if(f.type==='select' && f.options){
          fields[f.id] = Array.isArray(f.options[0]) ? f.options[0][0] : f.options[0];
        } else fields[f.id] = f.def;
      });
      EQ_STATE[mode][eq][p] = {on: pd.defOn, fields};
    });
  }
}

/* ============ Load Equipment ============ */
function loadEquipment(mode){
  try{
    initEqState(mode);
    const eqId = mode==='weight'?'w-eq':'c-eq';
    const containerId = mode==='weight'?'w-components':'c-components';
    const headerId = mode==='weight'?'w-eq-header':'c-eq-header';
    const eq = document.getElementById(eqId).value;
    const def = EQUIPMENT_DEFS[eq];
    if(!def) return;
    const container = document.getElementById(containerId);
    const headerEl = document.getElementById(headerId);
    const state = EQ_STATE[mode][eq];
    const activeCount = Object.values(state).filter(x=>x.on).length;

    headerEl.innerHTML = `<div class="eq-header">
      <div class="eq-icon">${SVG_ICONS[def.svg]||SVG_ICONS.tank}</div>
      <div class="eq-info">
        <h3>${def.name}</h3>
        <p>${def.parts.length} جزء — ${activeCount} فعال</p>
        <span class="badge">${mode==='weight'?'⚖️ وزن‌دهی':'💰 قیمت‌گذاری'}</span>
      </div>
    </div>`;

    let partsList = mode==='cost' ? [...def.parts, ...COST_ONLY_PARTS] : [...def.parts];

    let html = '';
    partsList.forEach(pid=>{
      const pd = PART_DEFS[pid];
      if(!pd) return;
      if(mode==='weight' && pd.costOnly) return;
      const st = state[pid];
      if(!st) return;
      const colorClass = pd.color ? ' ' + pd.color : '';
      html += `<div class="comp${colorClass}${st.on?' on':''}" data-mode="${mode}" data-pid="${pid}">
        <div class="comp-head" onclick="toggleComp('${mode}','${eq}','${pid}')">
          <div class="comp-icon">${SVG_ICONS[pd.icon]||SVG_ICONS.tank}</div>
          <span class="comp-title">${pd.name}${pd.costOnly?' <span style="font-size:10px;color:var(--blue)">(قیمت)</span>':''}</span>
          <span class="comp-badge ${mode==='weight'?'weight':'cost'}" id="badge-${mode}-${pid}"></span>
          <div class="comp-toggle"></div>
        </div>
        <div class="comp-body">${renderFields(mode, eq, pid, pd, st)}</div>
      </div>`;
    });
    container.innerHTML = html;
  }catch(e){ console.error('loadEquipment:', e); }
}

function renderFields(mode, eq, pid, pd, st){
  const fields = pd.fields||[];
  if(fields.length === 0) return '<div class="fld-hint">بدون پارامتر</div>';
  let html = '<div class="grid-2">';
  fields.forEach(f=>{
    const v = st.fields[f.id];
    if(f.type==='select'){
      let opts = '';
      f.options.forEach(o=>{
        const [val, label] = Array.isArray(o)? o : [o,o];
        opts += `<option value="${val}" ${v==val?'selected':''}>${label}</option>`;
      });
      html += `<div class="fld"><label>${f.label}</label>
        <select onchange="updateField('${mode}','${eq}','${pid}','${f.id}',this.value)">${opts}</select>
        ${f.hint?`<span class="fld-hint">${f.hint}</span>`:''}</div>`;
    } else if(f.autoCalc){
      const branches = st.fields.branches || 0;
      const pipeSize = st.fields.size || 'SS304_1';
      const area = calcThermalArea(branches, pipeSize);
      html += `<div class="fld"><label>${f.label}</label>
        <input type="text" value="${area.toFixed(2)}" readonly style="color:var(--green-2);background:#EDF9F1;border-color:#A8DABC">
        <span class="fld-hint"><b>Auto:</b> π × ${(PIPE_OD[pipeSize]||33.4).toFixed(1)} × ${(branches*6).toFixed(1)}m</span></div>`;
    } else if(f.autoCalcU){
      const n = st.fields.n || 0;
      const lenMm = st.fields.len || 0;
      const pipeSize = st.fields.size || 'copper_1';
      const L_m = (lenMm/1000) * n;
      const OD_mm = PIPE_OD[pipeSize] || 28.58;
      const area = Math.PI * (OD_mm/1000) * L_m;
      html += `<div class="fld"><label>${f.label}</label>
        <input type="text" value="${area.toFixed(2)}" readonly style="color:var(--green-2);background:#EDF9F1;border-color:#A8DABC">
        <span class="fld-hint"><b>Auto:</b> π × ${OD_mm.toFixed(1)} × ${L_m.toFixed(1)}m × ${n}</span></div>`;
    } else if(f.autoManholeThickness){
      // ضخامت خودکار منهول
      const shellState = st; // نیاز به shell نداریم، از capacity استفاده می‌کنیم
      // بررسی ظرفیت کل
      let totalCap = 0;
      if(eq === EQ_STATE._currentEq) {}
      const eqState = EQ_STATE[mode][eq];
      if(eqState && eqState.shell && eqState.shell.on){
        const sf = eqState.shell.fields;
        totalCap = totalFluidVol(sf.d, sf.h);
      }
      const size = st.fields.size || '16';
      const th = getAutoManholeThickness(size, totalCap);
      html += `<div class="fld"><label>${f.label}</label>
        <input type="text" value="${th} mm (auto)" readonly style="color:var(--yellow-2);background:#FFFBEB;border-color:#FCD34D">
        <span class="fld-hint"><b>خودکار بر اساس ظرفیت ${fmt(totalCap,0)} L</b></span></div>`;
    } else if(f.maxVal){
      html += `<div class="fld"><label>${f.label}</label>
        <input type="number" step="any" value="${v}" max="${f.maxVal}" oninput="updateField('${mode}','${eq}','${pid}','${f.id}',Math.min(parseFloat(this.value)||0, ${f.maxVal}))">
        <span class="fld-hint"><b>حداکثر ${f.maxVal} mm</b></span></div>`;
    } else {
      const extra = (pid === 'head' && f.id === 'd') ? `<span class="fld-hint" id="head-suggest-hint"></span>` : '';
      html += `<div class="fld"><label>${f.label}</label>
        <input type="number" step="any" value="${v}" oninput="updateField('${mode}','${eq}','${pid}','${f.id}',parseFloat(this.value)||0)">
        ${f.hint?`<span class="fld-hint">${f.hint}</span>`:''}${extra}</div>`;
    }
  });
  html += '</div>';
  return html;
}

function totalFluidVol(D, H){
  if(!(D>0) || !(H>0)) return 0;
  return totalVol(D, H, 'torisph');
}

function getAutoManholeThickness(size, capacity){
  if(size === '20' || capacity >= 5000) return 20;
  if(size === '18' || capacity >= 3000) return 15;
  if(capacity >= 1500) return 12;
  return 10;
}

function toggleComp(mode, eq, pid){
  const st = EQ_STATE[mode][eq][pid];
  st.on = !st.on;
  const card = document.querySelector(`.comp[data-mode="${mode}"][data-pid="${pid}"]`);
  if(card) card.classList.toggle('on', st.on);
  const out = document.getElementById(mode==='weight'?'w-result':'c-result');
  if(out) out.innerHTML = '';
}

function updateField(mode, eq, pid, fid, value){
  EQ_STATE[mode][eq][pid].fields[fid] = value;
  if(pid === 'coil_pipe' || pid === 'utube'){
    const st = EQ_STATE[mode][eq][pid];
    const pd = PART_DEFS[pid];
    const body = document.querySelector(`.comp[data-mode="${mode}"][data-pid="${pid}"] .comp-body`);
    if(body) body.innerHTML = renderFields(mode, eq, pid, pd, st);
  }
  // اگر منهول تغییر کرد، ضخامت خودکار آپدیت شود
  if(pid === 'manhole' && fid === 'size'){
    const st = EQ_STATE[mode][eq].manhole;
    const pd = PART_DEFS.manhole;
    const body = document.querySelector(`.comp[data-mode="${mode}"][data-pid="manhole"] .comp-body`);
    if(body) body.innerHTML = renderFields(mode, eq, 'manhole', pd, st);
  }
  // پیشنهاد هوشمند عدسی
  if(pid === 'head' && fid === 'd'){
    const sugg = getHeadSuggestions(value);
    const hint = document.getElementById('head-suggest-hint');
    if(hint){
      if(sugg && sugg.count >= 2){
        hint.innerHTML = `<b>Smart:</b> h=${sugg.h}, L=${sugg.L} (from ${sugg.count})`;
        hint.style.color = 'var(--green)';
      } else hint.innerHTML = '';
    }
  }
  const out = document.getElementById(mode==='weight'?'w-result':'c-result');
  if(out) out.innerHTML = '';
}

/* ============ Head History ============ */
function saveHeadToHistory(D, h, L, t, blank, note){
  try {
    let list = JSON.parse(localStorage.getItem(HEAD_HISTORY_KEY) || '[]');
    list.unshift({id:'h_'+Date.now(), D, h, L, t, blank, note:note||'', date:persianDate()});
    if(list.length > 200) list = list.slice(0, 200);
    localStorage.setItem(HEAD_HISTORY_KEY, JSON.stringify(list));
    return true;
  } catch(e) { return false; }
}
function loadHeadHistory(){
  try { return JSON.parse(localStorage.getItem(HEAD_HISTORY_KEY) || '[]'); }
  catch(e) { return []; }
}
function getHeadSuggestions(D){
  const list = loadHeadHistory();
  if(!list.length) return null;
  const similar = list.filter(x => Math.abs(x.D - D) / D < 0.1);
  if(!similar.length) return null;
  const avgH = similar.reduce((s,x)=>s+x.h, 0) / similar.length;
  const avgL = similar.reduce((s,x)=>s+x.L, 0) / similar.length;
  return { h: Math.round(avgH), L: Math.round(avgL), count: similar.length };
}

/* ============ Date Helper ============ */
function persianDate(){
  try {
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year:'numeric', month:'2-digit', day:'2-digit'
    }).format(new Date());
  } catch(e) {
    return new Date().toISOString().slice(0,10);
  }
}

/* ============ Part Weight (اصلاح‌شده) ============ */
function partWeight(part, f, eq){
  const pd = PART_DEFS[part];
  // اگر نوع quantity باشد → وزن محاسبه نمی‌شود
  if(pd && (pd.type === 'quantity' || pd.type === 'quantity_noWeight' || pd.type === 'quantity_cm')) return 0;
  if(pd && pd.costOnly) return 0;

  switch(part){
    case 'shell': return Math.PI*(f.d/1000)*(f.h/1000)*(f.t/1000)*MAT_RHO[f.mat||'ST37'];
    case 'head': return calcBlank(f.d, f.h||f.d*0.15, f.l||40, f.t, f.htype||'shallow').W * (f.n||2);
    case 'tube_sheet': return Math.PI/4*(f.d/1000)*(f.d/1000)*(f.t/1000)*MAT_RHO[f.mat||'ST37'];
    case 'base': {
      // محدودیت ضخامت ۸ mm
      const t = Math.min(f.t, WORKSHOP.maxBaseThickness);
      const area = 2*(f.l/1000)*(f.h/1000) + (f.l/1000)*(f.w/1000);
      return area * (t/1000) * MAT_RHO['ST37'] * (f.n||2);
    }
    case 'base_pad': return (f.l/1000)*(f.w/1000)*(f.t/1000)*MAT_RHO['ST37'] * (f.n||2);
    case 'manhole': {
      // ضخامت خودکار
      const eqState = EQ_STATE.weight[eq] || EQ_STATE.cost[eq];
      let cap = 0;
      if(eqState && eqState.shell && eqState.shell.on){
        cap = totalFluidVol(eqState.shell.fields.d, eqState.shell.fields.h);
      }
      const autoT = getAutoManholeThickness(f.size, cap);
      const t = f.t > 0 ? f.t : autoT;
      const vol = (f.w/1000)*(f.h/1000)*(t/1000);
      const base = vol*MAT_RHO['A516-70'];
      const extra = f.size==='16'?80:f.size==='18'?100:120;
      return (base + extra) * (f.n||1);
    }
    case 'tower_shell': return Math.PI*(f.d/1000)*(f.h/1000)*(f.t/1000)*MAT_RHO[f.mat||'SS304'];
    case 'tower_head': return calcBlank(f.d, f.d*0.15, 30, f.t, 'shallow').W;
    case 'tray': return (f.n||5)*25;
    case 'box_shell': return calcBoxShellWeight(f);
    case 'nozzles': return (f.n||4)*3;
    case 'flange': return (f.n||1)*3;
    case 'bushing': return (f.n||1)*1;
    case 'nozzle': return (f.n||1)*3;
    case 'cathode': return 0;
    case 'resin': return 0;
    case 'control_valve': return 0;
    case 'diaphragm': return 0;
    default: return 0;
  }
}

/* ============ محاسبه مقدار مصرفی ============ */
function partQuantity(part, f){
  switch(part){
    case 'coil_pipe': {
      const branches = f.branches || 0;
      const L_m = branches * 6;
      return {qty: L_m, unit: 'm', label: 'طول کویل', extra: `${branches} شاخه`};
    }
    case 'utube': {
      const L_m = ((f.len || 0) / 1000) * (f.n || 1);
      return {qty: L_m, unit: 'm', label: 'طول لوله U', extra: `${f.n} عدد × ${f.len}mm`};
    }
    case 'ladder': {
      const branches = f.branches || 0;
      const L_m = branches * 6;
      return {qty: L_m, unit: 'm', label: 'طول نردبان', extra: `${branches} شاخه`};
    }
    case 'inlet_outlet': {
      const L_m = ((f.len || 0) / 1000) * (f.n || 2);
      return {qty: L_m, unit: 'm', label: 'طول لوله', extra: `${f.n} عدد`};
    }
    case 'internal_piping': {
      const L_cm = f.length_cm || 0;
      return {qty: L_cm, unit: 'cm', label: 'طول لوله‌کشی', extra: ''};
    }
    default: return null;
  }
}

function estimateVolume(eq, state){
  if(state.shell && state.shell.on){
    const f = state.shell.fields;
    if(f.d>0 && f.h>0) return totalVol(f.d, f.h, 'torisph');
  }
  if(state.box_shell && state.box_shell.on){
    const f = state.box_shell.fields;
    return f.l*f.w*f.h/1e6;
  }
  return 0;
}

/* ============ محاسبه وزن ============ */
function calcWeight(){
  try{
    const eq = document.getElementById('w-eq').value;
    const def = EQUIPMENT_DEFS[eq];
    const state = EQ_STATE.weight[eq];
    const out = document.getElementById('w-result');
    if(!def || !state){ out.innerHTML = '<div class="info-box red"><b>Error</b></div>'; return; }

    let total = 0;
    const structural = [];
    const quantities = [];
    
    def.parts.forEach(pid=>{
      const st = state[pid];
      if(!st || !st.on) return;
      const pd = PART_DEFS[pid];
      if(!pd) return;
      
      const w = partWeight(pid, st.fields, eq);
      const q = partQuantity(pid, st.fields);
      
      if(w > 0){
        total += w;
        structural.push({pid, name: pd.name, w});
        const badge = document.getElementById(`badge-weight-${pid}`);
        if(badge) badge.textContent = fmt(w,1)+' kg';
      } else if(q){
        quantities.push({pid, name: pd.name, ...q});
        const badge = document.getElementById(`badge-weight-${pid}`);
        if(badge) badge.textContent = fmt(q.qty, 1) + ' ' + q.unit;
      }
    });

    const extras = total * 0.08;
    const grand = total + extras;
    const volume = estimateVolume(eq, state);
    const workingVol = volume * 0.85;

    let html = `<div class="res-summary">
      <div class="lbl">وزن سازه‌ای خالص</div>
      <div class="val">${fmt(grand,1)}</div>
      <div class="unit">kg (${fmt(grand/1000,3)} تن)</div>
    </div>`;

    // بخش ۱: وزن سازه‌ای
    html += `<div class="info-box orange" style="margin-top:14px">
      <b>⚖️ وزن سازه‌ای (فولاد)</b>`;
    structural.forEach(d=>{
      html += `<div class="res-row"><span class="lbl">${d.name}</span><span class="val">${fmt(d.w,1)} kg</span></div>`;
    });
    html += `<div class="res-row"><span class="lbl">جوش، رنگ، متعلقات (۸٪)</span><span class="val">${fmt(extras,1)} kg</span></div>`;
    html += `<div class="res-row big" style="border-top:2px solid var(--border-soft);margin-top:6px;padding-top:12px">
      <span class="lbl" style="color:var(--text);font-weight:800">مجموع وزن سازه</span>
      <span class="val" style="color:var(--orange-2)">${fmt(grand,1)} kg</span>
    </div></div>`;

    // بخش ۲: مقدار مصرفی
    if(quantities.length > 0){
      html += `<div class="info-box" style="margin-top:14px">
        <b>📏 مقدار مصرفی (لوله و پروفیل)</b>`;
      quantities.forEach(d=>{
        html += `<div class="res-row qty">
          <span class="lbl">${d.label} — ${d.name}${d.extra?` (${d.extra})`:''}</span>
          <span class="val">${fmt(d.qty, 1)} ${d.unit}</span>
        </div>`;
      });
      html += `<div class="res-row" style="font-size:11.5px;color:var(--text-3);border-top:1px solid var(--border-soft);padding-top:8px">
        <span>ℹ️ این اقلام در وزن سازه لحاظ نمی‌شوند</span>
      </div></div>`;
    }

    // بخش ۳: حجم و وزن آب
    if(volume>0){
      html += `<div class="info-box green" style="margin-top:14px">
        <b>💧 حجم و وزن آب</b>
        <div class="res-row"><span class="lbl">حجم هندسی</span><span class="val">${fmt(volume,0)} L</span></div>
        <div class="res-row"><span class="lbl">حجم کاری (۸۵٪)</span><span class="val">${fmt(workingVol,0)} L</span></div>
        <div class="res-row big"><span class="lbl" style="font-weight:800;color:var(--text)">وزن پر از آب</span><span class="val" style="color:var(--green-2);font-size:20px">${fmt(grand+volume,0)} kg</span></div>
      </div>`;
    }

    out.innerHTML = html;

    EQ_STATE.weight._lastResult = {eq, def, structural, quantities, extras, grand, volume, workingVol};
  }catch(e){
    console.error('calcWeight:', e);
    document.getElementById('w-result').innerHTML = '<div class="info-box red">Error: '+e.message+'</div>';
  }
}

/* ============ Part Cost ============ */
function findSheetPrice(mat, t){
  const keys = Object.keys(PRICES.sheets||{});
  const c = keys.filter(k=>k.startsWith(mat+'_'));
  if(!c.length) return 80000;
  let best=null;
  for(const k of c){
    const tk = parseFloat(k.split('_')[1]);
    const d = Math.abs(tk - t);
    if(!best || d < best.d) best = {d, p: PRICES.sheets[k]};
  }
  return best.p;
}

function partCost(part, f, eq){
  switch(part){
    case 'shell': return partWeight('shell',f,eq)*findSheetPrice(f.mat||'ST37',f.t)*1.15;
    case 'head': return partWeight('head',f,eq)*findSheetPrice(f.mat||'ST37',f.t)*1.35;
    case 'coil_pipe': return (f.branches||0)*((PRICES.pipes||{})[f.size]||0);
    case 'utube': return ((f.len||0)/1000/6)*((PRICES.pipes||{})[f.size]||0)*(f.n||1);
    case 'tube_sheet': return partWeight('tube_sheet',f,eq)*findSheetPrice(f.mat||'A516-70',f.t||10)*1.3;
    case 'base': return partWeight('base',f,eq)*55000;
    case 'base_pad': return partWeight('base_pad',f,eq)*55000;
    case 'manhole': {
      const mp = PRICES.manholes||{};
      const price = f.size==='16'?mp.manhole_16:f.size==='18'?mp.manhole_18:mp.manhole_20;
      return (price||0)*(f.n||1);
    }
    case 'ladder': return partWeight('ladder',f,eq)*((PRICES.equipmentParts?.ladder?.price_per_kg)||80000);
    case 'cathode': {
      const c = PRICES.equipmentParts?.cathodic || {};
      return (f.type==='zn'?c.anode_zn:f.type==='al'?c.anode_al:c.anode_mg)*(f.n||1);
    }
    case 'inlet_outlet': return ((f.len||0)/1000/6)*((PRICES.pipes||{})[f.size]||0)*(f.n||2);
    case 'internal_piping': return (f.length_cm / 100) * ((PRICES.pipes||{})[f.size]||0) / 6;
    case 'resin': return partWeight('resin',f,eq)*((PRICES.equipmentParts?.softener?.resin_kg)||180000);
    case 'control_valve': {
      const s = PRICES.equipmentParts?.softener||{};
      return f.type==='auto'?s.control_valve_auto:f.type==='semi'?s.control_valve_semi:s.control_valve_manual;
    }
    case 'tower_shell': return partWeight('tower_shell',f,eq)*findSheetPrice(f.mat||'SS304',f.t)*1.15;
    case 'tower_head': return partWeight('tower_head',f,eq)*findSheetPrice(f.mat||'SS304',f.t)*1.35;
    case 'tray': return (f.n||5)*1800000;
    case 'diaphragm': {
      const e = PRICES.equipmentParts?.expansion||{};
      return f.type==='butyl'?e.diaphragm_butyl:e.diaphragm_epdm;
    }
    case 'box_shell': return partWeight('box_shell',f,eq)*findSheetPrice(f.mat||'ST37',f.t)*1.15;
    case 'nozzles': return (f.n||4)*780000;
    case 'flange': return (f.n||1)*((PRICES.flanges||{})[f.size]||0);
    case 'bushing': return (f.n||1)*((PRICES.bushings||{})[f.size]||0);
    case 'nozzle': {
      const map = {'1':'flange_1','1_1_2':'flange_1_1_2','2':'flange_2','3':'flange_3','4':'flange_4'};
      return (f.n||1)*((PRICES.flanges||{})[map[f.size]]||780000);
    }
    default: return 0;
  }
}

function calcCost(){
  try{
    const eq = document.getElementById('c-eq').value;
    const def = EQUIPMENT_DEFS[eq];
    const state = EQ_STATE.cost[eq];
    const out = document.getElementById('c-result');
    const pp = parseFloat(document.getElementById('c-profit').value)||25;
    if(!def || !state){ out.innerHTML = '<div class="info-box red"><b>Error</b></div>'; return; }

    let total = 0;
    const details = [];
    let partsList = [...def.parts, ...COST_ONLY_PARTS];
    partsList.forEach(pid=>{
      const st = state[pid];
      if(!st || !st.on) return;
      const pd = PART_DEFS[pid];
      if(!pd) return;
      const c = partCost(pid, st.fields, eq);
      const w = partWeight(pid, st.fields, eq);
      total += c;
      details.push({pid, name: pd.name, c, w, isCostOnly: !!pd.costOnly});
      const badge = document.getElementById(`badge-cost-${pid}`);
      if(badge) badge.textContent = fmtT(c);
    });

    const structuralWeight = details.filter(d => !d.isCostOnly && d.w > 0).reduce((s,d)=>s+d.w, 0);
    const weldHours = structuralWeight / 20;
    const weldCost = weldHours * (PRICES.welder_hr||280000);
    const fitterCost = weldHours * 0.5 * (PRICES.fitter_hr||200000);
    const electrode = structuralWeight * 0.02 * (PRICES.electrode_kg||320000);
    const paintArea = structuralWeight * 0.05;
    const paintCost = paintArea * ((PRICES.paint_epoxy_m2||180000)+(PRICES.paint_zinc_m2||220000));
    const subtotal = total + weldCost + fitterCost + electrode + paintCost;
    const consumables = subtotal * ((PRICES.consumables_pct||8)/100);
    const transport = structuralWeight * (PRICES.transport_per_kg||350);
    const beforeProfit = subtotal + consumables + transport;
    const final = beforeProfit * (1 + pp/100);

    let html = `<div class="res-summary">
      <div class="lbl">Final Price</div>
      <div class="val">${fmtT(final)}</div>
      <div class="unit">تومان (+${pp}٪ سود)</div>
    </div>
    <div class="info-box orange">`;
    details.forEach(d=>{
      html += `<div class="res-row cost"><span class="lbl">${d.name}</span><span class="val">${fmtT(d.c)}</span></div>`;
    });
    html += `<div class="res-row"><span class="lbl">جوشکاری (${fmt(weldHours,1)} ساعت)</span><span class="val">${fmtT(weldCost)}</span></div>`;
    html += `<div class="res-row"><span class="lbl">مونتاژ</span><span class="val">${fmtT(fitterCost)}</span></div>`;
    html += `<div class="res-row"><span class="lbl">الکترود</span><span class="val">${fmtT(electrode)}</span></div>`;
    html += `<div class="res-row"><span class="lbl">رنگ</span><span class="val">${fmtT(paintCost)}</span></div>`;
    html += `<div class="res-row"><span class="lbl">مصرفی</span><span class="val">${fmtT(consumables)}</span></div>`;
    html += `<div class="res-row"><span class="lbl">حمل</span><span class="val">${fmtT(transport)}</span></div>`;
    html += `<div class="res-row big" style="border-top:2px solid var(--border-soft);margin-top:6px;padding-top:12px"><span class="lbl" style="color:var(--text)"><b>جمع هزینه</b></span><span class="val">${fmtT(beforeProfit)}</span></div>`;
    html += `<div class="res-row big"><span class="lbl">سود (${pp}%)</span><span class="val">${fmtT(beforeProfit*pp/100)}</span></div>`;
    html += `</div>`;
    out.innerHTML = html;

    EQ_STATE.cost._lastResult = {eq, def, details, structuralWeight, subtotal, beforeProfit, final, pp, weldHours, weldCost, fitterCost, electrode, paintCost, consumables, transport};
  }catch(e){
    console.error('calcCost:', e);
    document.getElementById('c-result').innerHTML = '<div class="info-box red">Error: '+e.message+'</div>';
  }
}

/* ============ طراحی کویل ============ */
function updateCoilDesign(){
  try {
    const Dtank = parseFloat(document.getElementById('coil-Dtank').value) || 0;
    const Htank = parseFloat(document.getElementById('coil-Htank').value) || 0;
    const dishH = parseFloat(document.getElementById('coil-dish').value) || 0;
    const clear = parseFloat(document.getElementById('coil-clear').value) || 0;
    const Dcoil = parseFloat(document.getElementById('coil-Dcoil').value) || 0;
    const OD = parseFloat(document.getElementById('coil-pipe').value) || 33.4;
    const B_total = parseInt(document.getElementById('coil-branches').value) || 1;
    const gap = parseFloat(document.getElementById('coil-gap').value) || 0;
    
    // اعتبارسنجی
    if(!(Dtank>0 && Htank>0 && Dcoil>0)){ 
      document.getElementById('coil-schematic').innerHTML = '<div class="info-box red">اطلاعات را کامل وارد کن</div>';
      return;
    }
    
    // محاسبات
    const L_total_m = B_total * 6;
    const L_total_mm = L_total_m * 1000;
    const circumference = Math.PI * Dcoil;
    const turns = L_total_mm / circumference;
    const pitch = OD + gap;
    const coilHeight = turns * pitch;
    const availableSpace = Htank - 2 * clear;
    const fits = coilHeight <= availableSpace;
    const thermalArea = Math.PI * (OD/1000) * L_total_m;
    const ID = OD - 3;
    const innerVol = Math.PI/4 * Math.pow(ID/1000, 2) * L_total_m * 1000;
    
    // بررسی فاصله دیواره
    const wallClear = (Dtank - Dcoil) / 2;
    const wallOK = wallClear >= WORKSHOP.minCoilWallClearance;
    
    // شماتیک
    document.getElementById('coil-schematic').innerHTML = drawCoilSVG(Dtank, Htank, dishH, Dcoil, coilHeight, OD, turns, pitch, clear, fits);
    
    // info
    document.getElementById('coil-info').innerHTML = `
      <div class="info-box green">
        <div class="res-row"><span class="lbl">قطر مخزن</span><span class="val">${Dtank} mm</span></div>
        <div class="res-row"><span class="lbl">ارتفاع بدنه</span><span class="val">${Htank} mm</span></div>
        <div class="res-row"><span class="lbl">قطر کویل</span><span class="val">${Dcoil} mm</span></div>
        <div class="res-row"><span class="lbl">فاصله از دیواره</span><span class="val" style="color:${wallOK?'var(--green-2)':'var(--red)'}">${wallClear.toFixed(1)} mm</span></div>
        <div class="res-row"><span class="lbl">سایز لوله (OD)</span><span class="val">${OD} mm</span></div>
        <div class="res-row"><span class="lbl">تعداد شاخه</span><span class="val">${B_total}</span></div>
        <div class="res-row"><span class="lbl">طول کل لوله</span><span class="val">${L_total_m.toFixed(1)} m</span></div>
        <div class="res-row"><span class="lbl">تعداد دور</span><span class="val">${turns.toFixed(2)}</span></div>
        <div class="res-row"><span class="lbl">گام</span><span class="val">${pitch.toFixed(2)} mm</span></div>
        <div class="res-row big"><span class="lbl"><b>ارتفاع کویل</b></span><span class="val" style="color:var(--orange-2)">${coilHeight.toFixed(0)} mm</span></div>
        <div class="res-row big"><span class="lbl"><b>فضای موجود</b></span><span class="val" style="color:var(--blue)">${availableSpace.toFixed(0)} mm</span></div>
        <div class="res-row"><span class="lbl">سطح حرارتی</span><span class="val">${thermalArea.toFixed(2)} m²</span></div>
        <div class="res-row"><span class="lbl">حجم داخل کویل</span><span class="val">${innerVol.toFixed(1)} L</span></div>
      </div>
    `;
    
    // warning
    let warnHtml = '';
    if(!fits){
      const shortage = coilHeight - availableSpace;
      warnHtml += `<div class="info-box red"><b>⚠️ کویل جا نمی‌شود!</b> ${shortage.toFixed(0)} mm کم است.<br>
        راه‌حل: قطر کویل بیشتر یا تعداد شاخه کمتر یا گام کمتر.</div>`;
    }
    if(!wallOK){
      warnHtml += `<div class="info-box red"><b>⚠️ فاصله از دیواره خیلی کم است!</b> ${wallClear.toFixed(1)} mm (حداقل ${WORKSHOP.minCoilWallClearance} mm)</div>`;
    }
    if(fits && wallOK){
      const remaining = availableSpace - coilHeight;
      warnHtml += `<div class="info-box green"><b>✅ طراحی درست است!</b> فاصله اضافی: ${remaining.toFixed(0)} mm</div>`;
    }
    document.getElementById('coil-warning').innerHTML = warnHtml;
    
    // ذخیره آخرین طراحی
    window._lastCoilDesign = {Dtank, Htank, dishH, clear, Dcoil, OD, B_total, gap, turns, coilHeight, thermalArea, innerVol, fits};
  } catch(e) {
    console.error('updateCoilDesign:', e);
  }
}

function saveCoilDesign(){
  if(!window._lastCoilDesign){ alert('ابتدا طراحی کن'); return; }
  const d = window._lastCoilDesign;
  const name = prompt('نام طراحی:', `کویل ${d.Dcoil}mm × ${d.turns.toFixed(1)}دور`);
  if(!name) return;
  try {
    let list = JSON.parse(localStorage.getItem(COIL_HISTORY_KEY) || '[]');
    list.unshift({id:'coil_'+Date.now(), name, date:persianDate(), data:d});
    if(list.length > 100) list = list.slice(0, 100);
    localStorage.setItem(COIL_HISTORY_KEY, JSON.stringify(list));
    alert('ذخیره شد!');
  } catch(e) { alert('خطا'); }
}

/* ============ Excel BOM Export ============ */
function exportToExcel(type){
  const data = type==='weight' ? EQ_STATE.weight._lastResult : EQ_STATE.cost._lastResult;
  if(!data){ alert('ابتدا محاسبه کن'); return; }
  const {eq, def} = data;
  const date = persianDate();

  let csv = '\uFEFF';
  csv += `BOM Report — ${def.name}\n`;
  csv += `Type: ${type==='weight'?'Weight':'Cost'}\n`;
  csv += `Date: ${date}\n`;
  csv += `Company: Caspian Mobadel Amard\n\n`;

  if(type === 'weight'){
    csv += '=== STRUCTURAL WEIGHT ===\n';
    csv += 'No,Part Name,Weight (kg)\n';
    data.structural.forEach((d,i)=>{
      csv += `${i+1},"${d.name}",${d.w.toFixed(2)}\n`;
    });
    csv += `\nTotal Weight (with 8% extra),${data.grand.toFixed(2)}\n`;
    
    if(data.quantities && data.quantities.length){
      csv += `\n=== QUANTITIES ===\n`;
      csv += 'No,Part Name,Quantity,Unit\n';
      data.quantities.forEach((d,i)=>{
        csv += `${i+1},"${d.name}",${d.qty.toFixed(2)},${d.unit}\n`;
      });
    }
    
    if(data.volume > 0){
      csv += `\n=== WATER ===\n`;
      csv += `Geometric Volume (L),${data.volume.toFixed(0)}\n`;
      csv += `Working Volume 85% (L),${data.workingVol.toFixed(0)}\n`;
      csv += `Filled Weight (kg),${(data.grand + data.volume).toFixed(0)}\n`;
    }
  } else {
    csv += 'No,Part Name,Weight (kg),Cost (Toman)\n';
    data.details.forEach((d,i)=>{
      csv += `${i+1},"${d.name}",${d.w.toFixed(2)},${d.c.toFixed(0)}\n`;
    });
    csv += `\nSubtotal Parts,,,${data.details.reduce((s,d)=>s+d.c,0).toFixed(0)}\n`;
    csv += `Welding (${data.weldHours.toFixed(1)} hr),,,${data.weldCost.toFixed(0)}\n`;
    csv += `Fitting,,,${data.fitterCost.toFixed(0)}\n`;
    csv += `Electrode,,,${data.electrode.toFixed(0)}\n`;
    csv += `Paint,,,${data.paintCost.toFixed(0)}\n`;
    csv += `Consumables,,,${data.consumables.toFixed(0)}\n`;
    csv += `Transport,,,${data.transport.toFixed(0)}\n`;
    csv += `Subtotal (before profit),,,${data.beforeProfit.toFixed(0)}\n`;
    csv += `Profit (${data.pp}%),,,${(data.beforeProfit*data.pp/100).toFixed(0)}\n`;
    csv += `FINAL PRICE,,,${data.final.toFixed(0)}\n`;
  }

  csv += `\nGenerated by Pressure Tank Calculator\n`;

  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `BOM_${def.name.replace(/\s+/g,'_')}_${date.replace(/\//g,'-')}.csv`;
  a.click();
}

/* ============ PDF Export ============ */
function exportPDF(type){
  const eqId = type==='weight'?'w-eq':'c-eq';
  const resId = type==='weight'?'w-result':'c-result';
  const eq = document.getElementById(eqId).value;
  const def = EQUIPMENT_DEFS[eq];
  const resEl = document.getElementById(resId);
  if(!def || !resEl.innerHTML){ alert('ابتدا محاسبه کن'); return; }

  const date = persianDate();
  const data = type==='weight' ? EQ_STATE.weight._lastResult : EQ_STATE.cost._lastResult;
  if(!data){ alert('ابتدا محاسبه کن'); return; }

  let tableRows = '';
  if(type === 'weight'){
    data.structural.forEach((d,i)=>{
      tableRows += `<tr><td style="text-align:center">${i+1}</td><td style="text-align:right">${d.name}</td><td style="text-align:center">${fmt(d.w,1)}</td></tr>`;
    });
  } else {
    data.details.forEach((d,i)=>{
      tableRows += `<tr><td style="text-align:center">${i+1}</td><td style="text-align:right">${d.name}</td><td style="text-align:center">${fmt(d.w,1)}</td><td style="text-align:center">${fmtT(d.c)}</td></tr>`;
    });
  }

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>گزارش ${def.name}</title>
<style>
@page{size:A4;margin:15mm 12mm}
body{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;font-size:12px;color:#1F1A12;margin:0;padding:0}
.header{display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:3px solid #E85D04;margin-bottom:16px}
.header h1{color:#BF4800;font-size:20px;margin:0 0 4px}
.header p{color:#7A6D57;font-size:10px;margin:0;letter-spacing:1px}
.info-bar{background:#FFF5EB;border:1px solid #F5D5B0;border-radius:8px;padding:12px;margin-bottom:16px;display:flex;justify-content:space-between}
.info-bar b{color:#BF4800}
.section-title{font-size:13px;font-weight:800;margin:16px 0 8px;padding-right:8px;border-right:4px solid #E85D04}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th{background:#F5EFE0;font-weight:800;font-size:11px;padding:8px;border:1px solid #D4C8B0}
td{padding:7px;border:1px solid #D4C8B0;font-size:11.5px;font-family:'Courier New',monospace;font-weight:700}
.summary-box{background:linear-gradient(135deg,#1F1A12,#3A2F22);color:#fff;padding:16px;border-radius:10px;text-align:center;margin:16px 0}
.summary-box .lbl{font-size:10px;letter-spacing:2px;color:#B8A78A;text-transform:uppercase}
.summary-box .val{font-family:'Courier New',monospace;font-size:28px;font-weight:900;color:#E85D04;margin:8px 0}
.summary-box .unit{font-size:11px;color:#E0D5BC}
.extra-table{width:100%;border-collapse:collapse;margin-bottom:16px}
.extra-table td{padding:8px 12px;border-bottom:1px dashed #D4C8B0;font-size:11.5px}
.extra-table td:first-child{color:#7A6D57;text-align:right}
.extra-table td:last-child{text-align:center;font-weight:800;font-family:'Courier New',monospace;width:150px}
.extra-table tr.total{background:#FFF5EB}
.extra-table tr.total td{font-weight:900;color:#BF4800;font-size:13px;padding:10px}
.footer{margin-top:24px;padding-top:12px;border-top:2px solid #E85D04;text-align:center;font-size:10px;color:#7A6D57}
.footer b{color:#BF4800}
</style></head><body>
<div class="header">
  <div><h1>Pressure Tank Calculator</h1><p>CASPIAN MOBADEL AMARD</p></div>
  <div style="text-align:left;font-size:10px;color:#7A6D57;line-height:1.6">
    <div><b>تاریخ:</b> ${date}</div>
    <div><b>شماره:</b> PT-${Date.now().toString().slice(-6)}</div>
  </div>
</div>
<div class="info-bar">
  <span><b>تجهیز:</b> ${def.name}</span>
  <span><b>نوع:</b> ${type==='weight'?'وزن‌دهی':'قیمت‌گذاری'}</span>
</div>
`);

  if(type === 'weight'){
    win.document.write(`
      <div class="section-title">⚖️ وزن سازه‌ای</div>
      <table><thead><tr><th style="width:40px">#</th><th>نام جزء</th><th style="width:100px">وزن (kg)</th></tr></thead>
      <tbody>${tableRows}</tbody></table>
      <div class="summary-box">
        <div class="lbl">Total Structural Weight</div>
        <div class="val">${fmt(data.grand,1)}</div>
        <div class="unit">kg — ${fmt(data.grand/1000,3)} ton</div>
      </div>
    `);
    
    if(data.quantities && data.quantities.length){
      win.document.write(`
        <div class="section-title">📏 مقدار مصرفی</div>
        <table><thead><tr><th>نام</th><th>مقدار</th><th>جزئیات</th></tr></thead><tbody>
        ${data.quantities.map(d=>`<tr><td style="text-align:right">${d.name}</td><td>${fmt(d.qty,1)} ${d.unit}</td><td>${d.extra||'—'}</td></tr>`).join('')}
        </tbody></table>
      `);
    }
    
    if(data.volume > 0){
      win.document.write(`
        <div class="section-title">💧 حجم و وزن آب</div>
        <table class="extra-table">
          <tr><td>حجم هندسی</td><td>${fmt(data.volume,0)} L</td></tr>
          <tr><td>حجم کاری (۸۵٪)</td><td>${fmt(data.workingVol,0)} L</td></tr>
          <tr class="total"><td>وزن پر از آب</td><td>${fmt(data.grand + data.volume,0)} kg</td></tr>
        </table>
      `);
    }
  } else {
    win.document.write(`
      <div class="section-title">💰 قیمت‌گذاری</div>
      <table><thead><tr><th style="width:40px">#</th><th>نام</th><th style="width:80px">وزن</th><th style="width:120px">قیمت</th></tr></thead>
      <tbody>${tableRows}</tbody></table>
      <table class="extra-table">
        <tr><td>جوشکاری (${fmt(data.weldHours,1)} hr)</td><td>${fmtT(data.weldCost)}</td></tr>
        <tr><td>مونتاژ</td><td>${fmtT(data.fitterCost)}</td></tr>
        <tr><td>الکترود</td><td>${fmtT(data.electrode)}</td></tr>
        <tr><td>رنگ</td><td>${fmtT(data.paintCost)}</td></tr>
        <tr><td>مصرفی</td><td>${fmtT(data.consumables)}</td></tr>
        <tr><td>حمل</td><td>${fmtT(data.transport)}</td></tr>
        <tr class="total"><td>جمع هزینه</td><td>${fmtT(data.beforeProfit)}</td></tr>
        <tr><td>سود (${data.pp}٪)</td><td>${fmtT(data.beforeProfit*data.pp/100)}</td></tr>
        <tr class="total" style="background:linear-gradient(90deg,#FFF5EB,#FFE8CC)"><td>💰 قیمت نهایی</td><td style="font-size:15px">${fmtT(data.final)}</td></tr>
      </table>
    `);
  }

  win.document.write(`
    <div class="footer">
      <b>Caspian Mobadel Amard</b> — Pressure Tank Calculator v6.2<br>
      محاسبات پیش‌طراحی — برای ساخت نهایی، نقشه مهندسی الزامی است.
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(()=>win.print(), 600);
}

/* ============ Tab 1: Volume ============ */
function renderSchematic(){
  const t = document.getElementById('v-type').value;
  const box = document.getElementById('v-schematic');
  if(!box) return;
  if(t === 'box'){
    const W = val('v-d'), L = val('v-l'), H = val('v-w');
    if(W>0 && L>0 && H>0){
      const V = boxVol(L,W,H);
      box.innerHTML = `<div class="schematic">${generateBoxSVG(L, W, H, `مکعبی — ${fmt(V,1)} لیتر`)}</div>`;
    } else box.innerHTML = '';
    return;
  }
  const D = val('v-d'), H = val('v-h');
  if(D>0 && H>0){
    const head = t==='cyl-dish'?'torisph':'flat';
    const V = totalVol(D,H,head);
    box.innerHTML = `<div class="schematic">${generateTankSVG(D, H, `مخزن — ${fmt(V,1)} لیتر`)}</div>`;
  } else box.innerHTML = '';
}

function calcVol(){
  const t = document.getElementById('v-type').value;
  const out = document.getElementById('v-res');
  if(t==='box'){
    const W=val('v-d'), L=val('v-l'), H=val('v-w');
    if(!(W>0&&L>0&&H>0)){out.innerHTML='<div class="info-box red"><b>خطا</b> — همه ابعاد را وارد کن</div>';return;}
    const V = boxVol(L,W,H);
    const working = V * 0.85;
    LAST_VOLUME = {type:'box', L, W, H, V, working};
    out.innerHTML = `<div class="res-summary">
      <div class="lbl">Total Volume</div>
      <div class="val">${fmt(V,1)}</div>
      <div class="unit">لیتر (${fmt(V/1000,3)} m³)</div>
    </div>
    <div class="info-box green">
      <b>💡 هوشمند:</b><br>
      حجم کاری توصیه‌شده (۸۵٪) = <b>${fmt(working,1)} لیتر</b><br>
      وزن آب = <b>${fmt(V,0)} کیلوگرم</b>
    </div>`;
    return;
  }
  const D=val('v-d'), H=val('v-h');
  if(!(D>0&&H>0)){out.innerHTML='<div class="info-box red"><b>خطا</b> — قطر و ارتفاع</div>';return;}
  const head = t==='cyl-dish'?'torisph':'flat';
  const V = totalVol(D,H,head);
  const working = V * 0.85;
  const nearest = findNearestCatalogModel(V);
  LAST_VOLUME = {type:'cyl', D, H, head, V, working};
  
  let html = `<div class="res-summary">
    <div class="lbl">Total Volume</div>
    <div class="val">${fmt(V,1)}</div>
    <div class="unit">لیتر (${fmt(V/1000,3)} m³)</div>
  </div>
  <div class="info-box green">
    <b>💡 هوشمند:</b><br>
    حجم کاری (۸۵٪) = <b>${fmt(working,1)} لیتر</b><br>
    وزن آب = <b>${fmt(V,0)} کیلوگرم</b>
  </div>`;
  
  if(nearest){
    html += `<div class="info-box">
      <b>نزدیک‌ترین مدل کاتالوگ:</b><br>
      ${nearest.model} — ${nearest.capacity} L — قطر ${nearest.D}mm
    </div>`;
  }
  out.innerHTML = html;
}

function saveLastVolume(){
  if(!LAST_VOLUME){ alert('ابتدا محاسبه کن'); return; }
  const name = prompt('نام:', LAST_VOLUME.type === 'box' 
    ? `مکعب ${LAST_VOLUME.V.toFixed(0)}L` 
    : `مخزن ${LAST_VOLUME.V.toFixed(0)}L`);
  if(!name) return;
  if(saveCalculation('volume', name, LAST_VOLUME, {V: LAST_VOLUME.V, working: LAST_VOLUME.working})){
    alert('ذخیره شد!');
  }
}

/* ============ Tab 2: Dimensions ============ */
function toggleDimMode(){
  const t = document.getElementById('d-type').value;
  const cylF = document.getElementById('dim-cyl-fields');
  const boxF = document.getElementById('dim-box-fields');
  if(t === 'box'){ cylF.style.display = 'none'; boxF.style.display = 'block'; }
  else { cylF.style.display = 'block'; boxF.style.display = 'none'; }
}

function calcDim(){
  const V = val('d-v');
  const t = document.getElementById('d-type').value;
  const out = document.getElementById('d-res');
  if(!(V>0)){ out.innerHTML = '<div class="info-box red">ظرفیت را وارد کن</div>'; return; }

  if(t === 'box'){
    const L_in = val('d-box-l') || 0;
    const W_in = val('d-box-w') || 0;
    const H_in = val('d-box-h') || 0;
    const result = calcBoxDims(V, L_in, W_in, H_in);
    if(result.mode === 'همه معلوم'){
      const V_calc = result.L * result.W * result.H / 1e6;
      const diff = (V_calc - V) / V * 100;
      out.innerHTML = `<div class="info-box">
        <div class="res-row"><span class="lbl">طول</span><span class="val">${fmt(result.L,0)} mm</span></div>
        <div class="res-row"><span class="lbl">عرض</span><span class="val">${fmt(result.W,0)} mm</span></div>
        <div class="res-row"><span class="lbl">ارتفاع</span><span class="val">${fmt(result.H,0)} mm</span></div>
        <div class="res-row big"><span class="lbl"><b>حجم محاسبه</b></span><span class="val" style="color:${Math.abs(diff)>5?'var(--red)':'var(--green-2)'}">${fmt(V_calc,1)} L</span></div>
      </div>`;
      return;
    }
    out.innerHTML = `<div class="res-summary green">
      <div class="lbl">${result.mode}</div>
      <div class="val">${fmt(result.L,0)}×${fmt(result.W,0)}×${fmt(result.H,0)}</div>
      <div class="unit">mm</div>
    </div>
    <div class="info-box green">
      <div class="res-row"><span class="lbl">طول</span><span class="val">${fmt(result.L,1)} mm</span></div>
      <div class="res-row"><span class="lbl">عرض</span><span class="val">${fmt(result.W,1)} mm</span></div>
      <div class="res-row"><span class="lbl">ارتفاع</span><span class="val">${fmt(result.H,1)} mm</span></div>
      <div class="res-row"><span class="lbl">محیط خم</span><span class="val">${fmt(2*(result.L + result.W),0)} mm</span></div>
      <div class="res-row"><span class="lbl">مساحت کل ورق</span><span class="val">${fmt((2*(result.L + result.W)*result.H + 2*result.L*result.W)/1e6,3)} m²</span></div>
    </div>
    <div class="schematic">${generateBoxSVG(result.L, result.W, result.H, `مکعب ${fmt(V,0)}L`)}</div>`;
    return;
  }

  const D = val('d-d') || 0;
  const H = val('d-h') || 0;
  const head = t === 'cyl-dish' ? 'torisph' : 'flat';
  let html = '';
  if(D>0 && H>0){
    const Vc = totalVol(D,H,head);
    html += `<div class="info-box"><div class="res-row"><span class="lbl">حجم</span><span class="val">${fmt(Vc,1)} L</span></div></div>`;
  } else if(D>0){
    const Hc = hFromV(V,D,head);
    html += `<div class="res-summary blue"><div class="lbl">Height</div><div class="val">${fmt(Hc,0)}</div><div class="unit">mm</div></div>
    <div class="schematic">${generateTankSVG(D, Hc, `مخزن ${fmt(V,0)}L`)}</div>`;
  } else if(H>0){
    const Dc = diamFromV(V,H,head);
    html += `<div class="res-summary blue"><div class="lbl">Diameter</div><div class="val">${fmt(Dc,0)}</div><div class="unit">mm</div></div>
    <div class="schematic">${generateTankSVG(Dc, H, `مخزن ${fmt(V,0)}L`)}</div>`;
  } else {
    let best=null;
    for(let n=1;n<=10;n++){
      const Hf=n*1500;
      const Df=diamFromV(V,Hf,head);
      const C=Math.PI*Df, m=Math.ceil(C/6000), waste=n*(m*6000-C);
      const pct=waste/(n*m*6000)*100;
      if(!best||pct<best.pct) best={n,H:Hf,D:Df,pct};
    }
    html += `<div class="res-summary blue"><div class="lbl">بهینه</div><div class="val">${fmt(best.D,0)} × ${fmt(best.H,0)}</div><div class="unit">D × H (mm)</div></div>
    <div class="schematic">${generateTankSVG(best.D, best.H, `مخزن ${fmt(V,0)}L`)}</div>`;
  }
  out.innerHTML = html;
}

/* ============ Tab 3: Sheet Optimization ============ */
function optSheets(){
  const V=val('s-v');
  const wSel=document.getElementById('s-w').value;
  const customW = parseFloat(document.getElementById('s-w-custom')?.value) || 150;
  const L=val('s-l')||6000;
  const maxN=parseInt(document.getElementById('s-max').value)||10;
  const forcedH = val('s-forced-h') || 0;
  const out=document.getElementById('s-res');
  if(!(V>0)){out.innerHTML='<div class="info-box red">ظرفیت را وارد کن</div>';return;}

  let widthsCm;
  if(wSel === 'both') widthsCm = [150, 152];
  else if(wSel === 'custom') widthsCm = [customW];
  else widthsCm = [parseFloat(wSel)];

  const rows=[];
  for(const wCm of widthsCm){
    const w = wCm * 10;
    let nStart = 1, nEnd = maxN;
    if(forcedH > 0){
      const nExact = Math.ceil(forcedH / w);
      nStart = nExact; nEnd = nExact;
    }
    for(let n=nStart;n<=nEnd;n++){
      const H=n*w;
      const D=diamFromV(V,H,'torisph');
      const C=Math.PI*D;
      const m=Math.ceil(C/L);
      const sheets=n*m;
      const waste=n*(m*L-C);
      const pct=waste/(sheets*L)*100;
      rows.push({wCm,n,H,D,C,m,sheets,waste,pct});
    }
  }
  rows.sort((a,b)=>Math.abs(a.pct-b.pct)>0.01?a.pct-b.pct:a.sheets-b.sheets);

  let html = '<div style="overflow-x:auto"><table><thead><tr><th>عرض</th><th>کورس</th><th>ارتفاع</th><th>قطر</th><th>ورق</th><th>پرت</th></tr></thead><tbody>';
  rows.slice(0,15).forEach(r=>{
    html += `<tr><td>${r.wCm} cm</td><td>${r.n}</td><td>${fmt(r.H,0)}</td><td>${fmt(r.D,1)}</td><td>${r.m}</td><td>${fmt(r.pct,1)}%</td></tr>`;
  });
  html += '</tbody></table></div>';
  out.innerHTML = html;
}

function compareFourScenarios(){
  const V = val('s-v');
  const L = val('s-l') || 6000;
  const out = document.getElementById('cs-res');
  if(!(V>0)){ out.innerHTML = '<div class="info-box red">ظرفیت</div>'; return; }

  const widths = [1500, 1520, 2000, 2500];
  const labels = ['ورق 150 cm', 'ورق 152 cm', 'ورق 200 cm', 'ورق 250 cm'];
  const results = [];

  widths.forEach((w, idx) => {
    let best = null;
    for(let n=1;n<=15;n++){
      const Hf = n*w;
      const Df = diamFromV(V, Hf, 'torisph');
      const C = Math.PI*Df;
      const m = Math.ceil(C/L);
      const sheets = n*m;
      const waste = n*(m*L - C);
      const pct = waste / (sheets*L) * 100;
      if(!best || pct < best.pct) best = {n, H:Hf, D:Df, C, m, sheets, waste, pct, w};
    }
    results.push({label: labels[idx], ...best});
  });

  const bestIdx = results.reduce((best_i, r, i, arr) => r.pct < arr[best_i].pct ? i : best_i, 0);
  let html = '<div class="compare-wrap four" style="margin-top:12px">';
  results.forEach((r, i) => {
    const isBest = i === bestIdx;
    const cls = isBest ? 'compare-col best-col' : 'compare-col';
    html += `<div class="${cls}">
      <h4>${isBest?'✅ ':''}${r.label}</h4>
      <div class="compare-row"><span class="lbl">کورس</span><span class="val">${r.n}</span></div>
      <div class="compare-row"><span class="lbl">ارتفاع</span><span class="val">${fmt(r.H,0)}</span></div>
      <div class="compare-row"><span class="lbl">قطر</span><span class="val">${fmt(r.D,1)}</span></div>
      <div class="compare-row"><span class="lbl">ورق</span><span class="val">${r.sheets}</span></div>
      <div class="compare-row"><span class="lbl">پرت</span><span class="val">${fmt(r.pct,1)}%</span></div>
    </div>`;
  });
  html += '</div>';
  html += `<div class="info-box green" style="margin-top:12px"><b>🏆 پیشنهاد:</b> ${results[bestIdx].label} — پرت ${fmt(results[bestIdx].pct,1)}%</div>`;
  out.innerHTML = html;
}

/* ============ Tab 6: Head Calculations ============ */
function applyHeadPreset(){
  const type = document.getElementById('h-type').value;
  if(type==='custom') return;
  const D = val('h-d');
  if(!(D>0)) return;
  let h = 0;
  if(type==='shallow') h = D/15;
  else if(type==='torisph') h = D*0.194;
  else if(type==='ellip') h = D*0.25;
  else if(type==='hemi') h = D*0.5;
  document.getElementById('h-h').value = h.toFixed(1);
}

function calcBlankHandler(){
  const D = val('h-d'), h = val('h-h'), L = val('h-l')||0, t = val('h-t')||6;
  const type = document.getElementById('h-type').value;
  const mat = document.getElementById('h-mat').value;
  const out = document.getElementById('h-res');
  if(!(D>0&&h>0)){out.innerHTML='<div class="info-box red">قطر و گودی</div>';return;}
  const res = calcBlank(D,h,L,t,type);
  const price = findSheetPrice(mat, t);
  const cost = res.W * price * 1.35;
  const sugg = getHeadSuggestions(D);
  let smart = '';
  if(sugg && sugg.count >= 2){
    smart = `<div class="info-box green" style="margin-top:10px"><b>Smart:</b> از ${sugg.count} عدسی مشابه — h=${sugg.h}mm, L=${sugg.L}mm</div>`;
  }
  out.innerHTML = `<div class="res-summary green">
    <div class="lbl">Blank Diameter</div>
    <div class="val">${fmt(res.Db,0)}</div>
    <div class="unit">mm — سطح ${fmt(res.A,3)} m² — وزن ${fmt(res.W,1)} kg</div>
  </div>
  <div class="info-box green">
    <div class="res-row auto"><span class="lbl">قطر گسترده</span><span class="val">${fmt(res.Db,1)} mm</span></div>
    <div class="res-row auto"><span class="lbl">سطح گسترده</span><span class="val">${fmt(res.A,3)} m²</span></div>
    <div class="res-row auto"><span class="lbl">وزن عدسی</span><span class="val">${fmt(res.W,1)} kg</span></div>
    <div class="res-row"><span class="lbl">هزینه ساخت (+35%)</span><span class="val">${fmtT(cost)}</span></div>
  </div>${smart}`;
}

function calcBodyHeightFromTotal(){
  const H_total = parseFloat(document.getElementById('ht-total').value) || 0;
  const h_dish = parseFloat(document.getElementById('ht-dish').value) || 0;
  const n_dish = parseInt(document.getElementById('ht-ndish').value) || 0;
  const out = document.getElementById('ht-res');
  if(!(H_total>0)){ out.innerHTML = '<div class="info-box red">ارتفاع کل</div>'; return; }
  const H_body = H_total - n_dish * h_dish;
  if(H_body <= 0){ out.innerHTML = '<div class="info-box red">ارتفاع عدسی بیشتر از کل</div>'; return; }
  out.innerHTML = `<div class="res-summary blue">
    <div class="lbl">Body Height</div>
    <div class="val">${fmt(H_body,0)}</div>
    <div class="unit">mm</div>
  </div>
  <div class="info-box">
    <div class="res-row"><span class="lbl">ارتفاع کل</span><span class="val">${fmt(H_total,0)} mm</span></div>
    <div class="res-row"><span class="lbl">گودی هر عدسی</span><span class="val">${fmt(h_dish,0)} mm</span></div>
    <div class="res-row"><span class="lbl">تعداد عدسی</span><span class="val">${n_dish}</span></div>
    <div class="res-row big"><span class="lbl"><b>ارتفاع بدنه</b></span><span class="val">${fmt(H_body,0)} mm</span></div>
  </div>`;
}

function saveHeadCalc(){
  const D=val('h-d'), h=val('h-h'), L=val('h-l')||0, t=val('h-t')||6;
  if(!(D>0&&h>0))return;
  const res = calcBlank(D,h,L,t,document.getElementById('h-type').value);
  const note = prompt('Note:', '');
  if(saveHeadToHistory(D, h, L, t, Math.round(res.Db), note)){
    renderMemory();
    alert('ذخیره شد! (' + loadHeadHistory().length + ' ورودی)');
  }
}

/* ============ Tab 8: Order Reverse ============ */
function setOrderMode(mode){
  ORDER_MODE.current = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  document.querySelectorAll('.mode-body').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('ro-fields-' + mode);
  if(el) el.classList.add('active');
}

function getSheetWidthFromEl(selId, customId){
  const sel = document.getElementById(selId);
  if(!sel) return 1500;
  if(sel.value === 'custom'){
    const c = document.getElementById(customId);
    return (parseFloat(c?.value) || 150) * 10;
  }
  return parseFloat(sel.value) * 10;
}

function calcOrderReverse(){
  const V = parseFloat(document.getElementById('ro-v').value) || 0;
  const out = document.getElementById('ro-res');
  const mode = ORDER_MODE.current;
  if(!(V>0)){ out.innerHTML = '<div class="info-box red">ظرفیت را وارد کن</div>'; return; }

  if(mode === 'B'){
    const H_input = parseFloat(document.getElementById('ro-h').value) || 0;
    const sheetWidth = getSheetWidthFromEl('ro-w-b', 'ro-w-b-custom');
    if(!(H_input>0)){ out.innerHTML = '<div class="info-box red">ارتفاع</div>'; return; }
    renderOrderResult(V, H_input, sheetWidth);
    return;
  }
  if(mode === 'C'){
    const D_input = parseFloat(document.getElementById('ro-d').value) || 0;
    const sheetWidth = getSheetWidthFromEl('ro-w-c', 'ro-w-c-custom');
    if(!(D_input>0)){ out.innerHTML = '<div class="info-box red">قطر</div>'; return; }
    const minVolForD = 2 * dishVT(D_input);
    if(V < minVolForD * 1.02){
      out.innerHTML = `<div class="info-box red"><b>خطا:</b> حداقل حجم با این قطر ${fmt(minVolForD,1)} L</div>`;
      return;
    }
    const H_req = hFromV(V, D_input, 'torisph');
    if(!(H_req > 0)){ out.innerHTML = '<div class="info-box red">ممکن نیست</div>'; return; }
    renderOrderResult(V, H_req, sheetWidth);
    return;
  }
  const sheetWidth = getSheetWidthFromEl('ro-w-a', 'ro-w-a-custom');
  let best = null;
  for(let n=1;n<=15;n++){
    const Hf = n * sheetWidth;
    const Df = diamFromV(V, Hf, 'torisph');
    const C = Math.PI * Df;
    const m = Math.ceil(C / 6000);
    const waste = n*(m*6000 - C);
    const pct = waste / (n*m*6000) * 100;
    if(!best || pct < best.pct) best = {n, H:Hf, D:Df, C, m, waste, pct};
  }
  renderOrderResult(V, best.H, sheetWidth);
}

function renderOrderResult(V, H_input, sheetWidth){
  const out = document.getElementById('ro-res');
  const w = sheetWidth;
  const D_req = diamFromV(V, H_input, 'torisph');
  const n_courses = Math.ceil(H_input / w);
  const H_actual = n_courses * w;
  const D_actual = diamFromV(V, H_actual, 'torisph');
  const C_actual = Math.PI * D_actual;
  const n_sheets_per_course = Math.ceil(C_actual / 6000);
  const totalSheetArea = n_courses * n_sheets_per_course * (w/1000) * 6;
  const usedArea = n_courses * C_actual * (w/1000) / 1e6;
  const wastePct = (1 - usedArea / totalSheetArea) * 100;
  const nearestModel = findNearestCatalogModel(V);
  const alt_n = n_courses + 1;
  const alt_H = alt_n * w;
  const alt_D = diamFromV(V, alt_H, 'torisph');

  let html = `<div class="res-summary green">
    <div class="lbl">Required Diameter</div>
    <div class="val">${fmt(D_req,1)}</div>
    <div class="unit">mm (برای H=${fmt(H_input,0)}mm)</div>
  </div>
  <div class="schematic">${generateTankSVG(D_actual, H_actual, `مخزن ${fmt(V,0)}L`)}</div>
  <div class="info-box green">
    <div class="res-row"><span class="lbl">ارتفاع مشتری</span><span class="val">${fmt(H_input,0)} mm</span></div>
    <div class="res-row big"><span class="lbl"><b>قطر لازم</b></span><span class="val">${fmt(D_req,1)} mm</span></div>
    <div class="res-row"><span class="lbl">عرض ورق</span><span class="val">${(w/10).toFixed(1)} cm</span></div>
    <div class="res-row"><span class="lbl">کورس</span><span class="val">${n_courses}</span></div>
    <div class="res-row"><span class="lbl">ارتفاع نهایی</span><span class="val">${fmt(H_actual,0)} mm</span></div>
    <div class="res-row"><span class="lbl">قطر نهایی</span><span class="val">${fmt(D_actual,1)} mm</span></div>
    <div class="res-row"><span class="lbl">ورق/کورس</span><span class="val">${n_sheets_per_course}</span></div>
    <div class="res-row"><span class="lbl">پرت</span><span class="val">${fmt(wastePct,1)}%</span></div>
  </div>`;
  if(nearestModel){
    html += `<div class="info-box"><b>نزدیک‌ترین مدل:</b> ${nearestModel.model} — ${nearestModel.capacity}L</div>`;
  }
  out.innerHTML = html;
}

function findNearestCatalogModel(V){
  if(!CATALOG || !CATALOG.categories) return null;
  let best = null;
  for(const catKey in CATALOG.categories){
    const cat = CATALOG.categories[catKey];
    if(!cat.rows) continue;
    cat.rows.forEach(r => {
      const cap = parseFloat(r[1]);
      if(!cap) return;
      const diff = Math.abs(cap - V);
      if(!best || diff < best.diff){
        best = {diff, model: r[0], capacity: cap, D: r[cat.mainD] || '', H: r[cat.mainH] || ''};
      }
    });
  }
  return (best && best.diff / V < 0.3) ? best : null;
}

/* ============ Memory ============ */
function saveCalculation(type, name, inputs, outputs){
  try{
    let list = JSON.parse(localStorage.getItem('csp_calcs')||'[]');
    list.unshift({id:'c_'+Date.now(), type, name, date:persianDate(), inputs, outputs});
    if(list.length>100) list=list.slice(0,100);
    localStorage.setItem('csp_calcs', JSON.stringify(list));
    return true;
  }catch(e){return false;}
}
function loadCalculations(){try{return JSON.parse(localStorage.getItem('csp_calcs')||'[]');}catch(e){return [];}}
function renderMemory(){
  const list = loadCalculations();
  const el = document.getElementById('mem-list');
  if(!el) return;
  const headHist = loadHeadHistory();
  const coilHist = (()=>{try{return JSON.parse(localStorage.getItem(COIL_HISTORY_KEY)||'[]');}catch(e){return [];}})();
  let html = '';
  if(headHist.length){
    html += '<div class="section-title">تاریخچه عدسی</div>';
    headHist.slice(0,15).forEach(h=>{
      html += `<div class="save-row"><div class="info"><b>D=${h.D} / h=${h.h} / L=${h.L}</b><br>گسترده ${h.blank}mm — ${h.date}</div>
        <button onclick="delHead('${h.id}')">حذف</button></div>`;
    });
  }
  if(coilHist.length){
    html += '<div class="section-title">تاریخچه کویل</div>';
    coilHist.slice(0,15).forEach(c=>{
      const d = c.data;
      html += `<div class="save-row"><div class="info"><b>${c.name}</b><br>قطر ${d.Dcoil}mm — ${d.turns.toFixed(1)} دور — ${d.coilHeight.toFixed(0)}mm — ${c.date}</div>
        <button onclick="delCoil('${c.id}')">حذف</button></div>`;
    });
  }
  if(list.length){
    html += '<div class="section-title">محاسبات ذخیره‌شده</div>';
    list.forEach(c=>{
      html += `<div class="save-row"><div class="info"><b>${c.name}</b><br>${c.type} — ${c.date}</div>
        <button onclick="delCalc('${c.id}')">حذف</button></div>`;
    });
  }
  if(!list.length && !headHist.length && !coilHist.length){
    html = '<div class="empty-state">محاسبه‌ای ذخیره نشده</div>';
  }
  el.innerHTML = html;
}
function delCalc(id){
  if(!confirm('حذف؟'))return;
  let list = loadCalculations().filter(c=>c.id!==id);
  localStorage.setItem('csp_calcs', JSON.stringify(list));
  renderMemory();
}
function delHead(id){
  if(!confirm('حذف؟'))return;
  let list = loadHeadHistory().filter(c=>c.id!==id);
  localStorage.setItem(HEAD_HISTORY_KEY, JSON.stringify(list));
  renderMemory();
}
function delCoil(id){
  if(!confirm('حذف؟'))return;
  let list = (()=>{try{return JSON.parse(localStorage.getItem(COIL_HISTORY_KEY)||'[]');}catch(e){return [];}})();
  list = list.filter(c=>c.id!==id);
  localStorage.setItem(COIL_HISTORY_KEY, JSON.stringify(list));
  renderMemory();
}
function clearMemory(){
  if(!confirm('همه پاک شوند؟'))return;
  localStorage.removeItem('csp_calcs');
  localStorage.removeItem(HEAD_HISTORY_KEY);
  localStorage.removeItem(COIL_HISTORY_KEY);
  renderMemory();
}
function exportMemory(){
  const list = loadCalculations();
  const heads = loadHeadHistory();
  const coils = (()=>{try{return JSON.parse(localStorage.getItem(COIL_HISTORY_KEY)||'[]');}catch(e){return [];}})();
  let csv = 'Type,Name/Model,Date\n';
  list.forEach(c=>{csv += `"calc","${c.name}","${c.date}"\n`;});
  heads.forEach(h=>{csv += `"head","D=${h.D}/h=${h.h}/L=${h.L}/blank=${h.blank}","${h.date}"\n`;});
  coils.forEach(c=>{const d=c.data;csv += `"coil","${c.name}/D=${d.Dcoil}/turns=${d.turns.toFixed(1)}","${c.date}"\n`;});
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'calculations.csv';
  a.click();
}

/* ============ Prices ============ */
function renderPriceEditor(){
  const c = document.getElementById('price-editor');
  if(!c) return;
  let html = '';
  html += '<div class="price-section-title">ورق‌ها (تومان/kg)</div>';
  for(const k in PRICES.sheets) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="sheets" data-key="${k}" value="${PRICES.sheets[k]}"></div>`;
  html += '<div class="price-section-title">لوله‌ها (تومان/شاخه ۶متر)</div>';
  for(const k in PRICES.pipes) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="pipes" data-key="${k}" value="${PRICES.pipes[k]}"></div>`;
  html += '<div class="price-section-title">بوشن</div>';
  for(const k in PRICES.bushings) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="bushings" data-key="${k}" value="${PRICES.bushings[k]}"></div>`;
  html += '<div class="price-section-title">فلنج</div>';
  for(const k in PRICES.flanges) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="flanges" data-key="${k}" value="${PRICES.flanges[k]}"></div>`;
  
  // تنظیمات کارگاه
  html += '<div class="price-section-title">⚙️ تنظیمات کارگاه</div>';
  html += `<div class="price-row"><label>حداکثر ضخامت پایه (mm)</label><input type="number" id="ws-maxBaseThickness" value="${WORKSHOP.maxBaseThickness}" step="1"></div>`;
  html += `<div class="price-row"><label>حداکثر ضخامت منهول ۱۶" (mm)</label><input type="number" id="ws-maxManhole16Thickness" value="${WORKSHOP.maxManhole16Thickness}" step="1"></div>`;
  html += `<div class="price-row"><label>حداکثر ضخامت منهول ۱۸" (mm)</label><input type="number" id="ws-maxManhole18Thickness" value="${WORKSHOP.maxManhole18Thickness}" step="1"></div>`;
  html += `<div class="price-row"><label>حداکثر ضخامت منهول ۲۰" (mm)</label><input type="number" id="ws-maxManhole20Thickness" value="${WORKSHOP.maxManhole20Thickness}" step="1"></div>`;
  html += `<div class="price-row"><label>حداقل فاصله کویل از دیواره (mm)</label><input type="number" id="ws-minCoilWallClearance" value="${WORKSHOP.minCoilWallClearance}" step="5"></div>`;
  html += `<button class="btn blue" onclick="saveWorkshopSettings()" style="margin-top:8px">💾 ذخیره تنظیمات کارگاه</button>`;
  
  c.innerHTML = html;
}

function saveWorkshopSettings(){
  WORKSHOP.maxBaseThickness = parseFloat(document.getElementById('ws-maxBaseThickness').value) || 8;
  WORKSHOP.maxManhole16Thickness = parseFloat(document.getElementById('ws-maxManhole16Thickness').value) || 12;
  WORKSHOP.maxManhole18Thickness = parseFloat(document.getElementById('ws-maxManhole18Thickness').value) || 15;
  WORKSHOP.maxManhole20Thickness = parseFloat(document.getElementById('ws-maxManhole20Thickness').value) || 20;
  WORKSHOP.minCoilWallClearance = parseFloat(document.getElementById('ws-minCoilWallClearance').value) || 50;
  saveWorkshop(WORKSHOP);
  alert('تنظیمات ذخیره شد');
}

function savePricesLocal(){
  document.querySelectorAll('#price-editor input[data-cat]').forEach(inp=>{
    const cat = inp.dataset.cat, key = inp.dataset.key;
    const v = parseFloat(inp.value)||0;
    if(PRICES[cat]) PRICES[cat][key]=v;
  });
  try{localStorage.setItem('csp_prices', JSON.stringify({version:'local_'+Date.now(), data:PRICES}));}catch(e){}
  showStatus('success','ذخیره شد');
}
function resetPrices(){
  if(!confirm('بازگشت؟'))return;
  localStorage.removeItem('csp_prices');
  PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES));
  renderPriceEditor();
  showStatus('success','بازنشانی شد');
}
function exportPrices(){
  const b = new Blob([JSON.stringify(PRICES,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'prices.json';
  a.click();
}
function showStatus(t,m){
  const s = document.getElementById('price-status');
  if(!s) return;
  s.innerHTML = `<div class="info-box ${t==='success'?'green':'yellow'}">${m}</div>`;
  setTimeout(()=>{ if(s) s.innerHTML=''; }, 3000);
}

/* ============ Catalog ============ */
function initCatalog(){
  const sel = document.getElementById('cat-category');
  if(!sel) return;
  sel.innerHTML = '<option value="">— انتخاب دسته —</option>';
  for(const k in CATALOG.categories){
    const o = document.createElement('option');
    o.value = k;
    o.textContent = CATALOG.categories[k].name;
    sel.appendChild(o);
  }
}

function renderCatalog(){
  const k = document.getElementById('cat-category').value;
  const search = (document.getElementById('cat-search').value||'').trim();
  const info = document.getElementById('cat-info'), tbl = document.getElementById('cat-table');
  if(!tbl) return;
  if(!k){tbl.innerHTML='<div class="empty-state">دسته را انتخاب کن</div>'; if(info) info.innerHTML=''; return;}
  const cat = CATALOG.categories[k];
  if(!cat) return;
  let rows = cat.rows;
  if(search){
    const s = search.toLowerCase();
    rows = rows.filter(r => r.some(v => String(v).toLowerCase().includes(s)));
  }
  let mIdx = -1;
  const n = parseFloat(search);
  if(!isNaN(n) && /^\d+$/.test(search)){
    let bd = Infinity;
    rows.forEach((r,i)=>{
      const cap = parseFloat(r[1])||0;
      const d = Math.abs(cap-n);
      if(cap>0 && d<bd){bd=d; mIdx=i;}
    });
  }
  let h = '<div style="overflow-x:auto"><table><thead><tr>';
  cat.columns.forEach(c => h += `<th>${c}</th>`);
  h += '<th>عملیات</th></tr></thead><tbody>';
  rows.forEach((r,i)=>{
    const isM = i===mIdx;
    h += `<tr class="${isM?'best':''}">`;
    r.forEach(v => h += `<td>${v!=null?v:'—'}</td>`);
    const D = r[cat.mainD] !== undefined ? r[cat.mainD] : '';
    const H = r[cat.mainH] !== undefined ? r[cat.mainH] : '';
    const data = JSON.stringify({model:r[0], D:D, H:H, cat:k}).replace(/"/g,'&quot;');
    h += `<td><button class="cat-use-btn" onclick="useFromCat(this)" data-info="${data}">استفاده</button></td></tr>`;
  });
  h += '</tbody></table></div>';
  tbl.innerHTML = h;
  if(info) info.innerHTML = `<div class="info-box"><b>${cat.name}</b> — ${rows.length} مدل</div>`;
}

function useFromCat(btn){
  try{
    const info = JSON.parse(btn.dataset.info);
    const D = parseFloat(info.D);
    const H = parseFloat(info.H);
    const modelName = info.model || '';
    let eqType = 'spiral';
    if(modelName.includes('SG-HE-SC-')) eqType = 'spiral';
    else if(modelName.includes('SG-HE-C-')) eqType = 'u_coil';
    else if(modelName.includes('SG-S-')) eqType = 'softener';
    else if(modelName.includes('SG-F-')) eqType = 'sand_filter';
    else if(modelName.includes('SG-DE-')) eqType = 'deaerator';
    else if(modelName.includes('SG-OE-')) eqType = 'expansion_open';
    else if(modelName.includes('SG-CE-')) eqType = 'expansion_closed';
    else if(modelName.includes('SG-CT-')) eqType = 'condensate';

    Object.keys(EQ_STATE.weight).forEach(k => {if(k !== '_lastResult') delete EQ_STATE.weight[k];});
    Object.keys(EQ_STATE.cost).forEach(k => {if(k !== '_lastResult') delete EQ_STATE.cost[k];});

    document.getElementById('w-eq').value = eqType;
    document.getElementById('c-eq').value = eqType;
    initEqState('weight');
    initEqState('cost');

    ['weight','cost'].forEach(mode=>{
      const st = EQ_STATE[mode][eqType];
      if(!st) return;
      if(st.shell && !isNaN(D) && !isNaN(H)){
        st.shell.fields.d = D; st.shell.fields.h = H;
      }
      if(st.box_shell && !isNaN(D) && !isNaN(H)){
        st.box_shell.fields.l = D; st.box_shell.fields.h = H;
      }
    });

    loadEquipment('weight');
    loadEquipment('cost');
    showStatus('success', `${modelName} بارگذاری شد`);

    setTimeout(()=>{
      const tab = document.querySelector('[data-tab="t4"]');
      if(tab) tab.click();
    }, 400);
  }catch(e){ console.error(e); alert('خطا: ' + e.message); }
}

/* ============ Firebase ============ */
async function syncFromFirebase(){
  if(typeof loadPricesFromFirebase !== 'function'){ alert('Firebase فعال نیست'); return; }
  const remote = await loadPricesFromFirebase();
  if(remote){PRICES = Object.assign({},window.EMBEDDED_PRICES,remote); renderPriceEditor(); showStatus('success','دریافت شد');}
  else showStatus('warn','داده نیست');
}
async function syncToFirebase(){
  if(typeof savePricesToFirebase !== 'function'){ alert('Firebase فعال نیست'); return; }
  PRICES.version = 'cloud_'+Date.now();
  const ok = await savePricesToFirebase(PRICES);
  showStatus(ok?'success':'warn', ok?'ارسال شد':'خطا');
}

/* ============ Helpers ============ */
function fmt(n,d=2){if(!isFinite(n)||n==null)return'—';return Number(n).toLocaleString('en-US',{maximumFractionDigits:d});}
function fmtT(n){
  if(!isFinite(n))return'—';
  if(n>=1e9)return fmt(n/1e9,3)+' B';
  if(n>=1e6)return fmt(n/1e6,2)+' M';
  if(n>=1e3)return fmt(n/1e3,1)+' K';
  return fmt(n,0);
}
function val(id){const e=document.getElementById(id);return e?parseFloat(e.value)||0:0;}

function initLogo(){
  const img = document.getElementById('logo-img');
  if(!img) return;
  img.onerror = function(){
    const parent = img.parentElement;
    if(parent){
      parent.innerHTML = '<svg viewBox="0 0 100 100" fill="none"><rect x="15" y="38" width="70" height="40" rx="6" stroke="#fff" stroke-width="3"/><path d="M15 48 Q50 28 85 48" stroke="#fff" stroke-width="3"/><text x="50" y="68" font-family="Arial" font-size="16" font-weight="900" fill="#fff" text-anchor="middle">PT</text></svg>';
    }
  };
}

/* ============ Bootstrap ============ */
window.addEventListener('load', async () => {
  if(window._appInitialized){ console.warn('App already initialized'); return; }
  window._appInitialized = true;

  console.log('🚀 App starting v6.2...');
  console.log('CATALOG:', Object.keys(CATALOG.categories||{}).length);

  if(typeof initFirebase === 'function'){
    try{ await initFirebase(); }catch(e){ console.warn('Firebase skipped'); }
  }
  try{
    const s = localStorage.getItem('csp_prices');
    if(s) PRICES = Object.assign({}, window.EMBEDDED_PRICES, JSON.parse(s).data);
  }catch(e){}

  initLogo();

  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      const panel = document.getElementById(t.dataset.tab);
      if(panel) panel.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });

  const vt = document.getElementById('v-type');
  if(vt) vt.addEventListener('change', e=>{
    const b = e.target.value==='box';
    const fl = document.getElementById('f-v-l');
    const fw = document.getElementById('f-v-w');
    const fh = document.getElementById('f-v-h');
    if(fl) fl.style.display = b?'block':'none';
    if(fw) fw.style.display = b?'block':'none';
    if(fh) fh.style.display = b?'none':'block';
    renderSchematic();
  });

  ['v-d','v-h','v-l','v-w'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', renderSchematic);
  });

  const sw = document.getElementById('s-w');
  if(sw) sw.addEventListener('change', e=>{
    const cw = document.getElementById('s-custom-wrap');
    if(cw) cw.style.display = e.target.value === 'custom' ? 'block' : 'none';
  });

  ['ro-w-a','ro-w-b','ro-w-c'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('change', e => {
      const wrapId = id + '-custom-wrap';
      const wrap = document.getElementById(wrapId);
      if(wrap) wrap.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
  });

  // کویل — آپدیت زنده
  ['coil-Dtank','coil-Htank','coil-dish','coil-clear','coil-Dcoil','coil-pipe','coil-branches','coil-gap'].forEach(id => {
    const el = document.getElementById(id);
    if(el) { el.addEventListener('input', updateCoilDesign); el.addEventListener('change', updateCoilDesign); }
  });

  renderPriceEditor();
  initCatalog();
  renderMemory();
  loadEquipment('weight');
  loadEquipment('cost');
  
  // کویل اولیه
  setTimeout(()=>{ if(document.getElementById('coil-schematic')) updateCoilDesign(); }, 200);

  console.log('✅ App ready v6.2');
});

window.calcWeight = calcWeight;
window.calcCost = calcCost;
window.useFromCat = useFromCat;
window.toggleComp = toggleComp;
window.updateField = updateField;
window.loadEquipment = loadEquipment;
window.calcVol = calcVol;
window.calcDim = calcDim;
window.toggleDimMode = toggleDimMode;
window.optSheets = optSheets;
window.compareFourScenarios = compareFourScenarios;
window.applyHeadPreset = applyHeadPreset;
window.calcBlankHandler = calcBlankHandler;
window.calcBodyHeightFromTotal = calcBodyHeightFromTotal;
window.setOrderMode = setOrderMode;
window.calcOrderReverse = calcOrderReverse;
window.saveHeadCalc = saveHeadCalc;
window.saveLastVolume = saveLastVolume;
window.updateCoilDesign = updateCoilDesign;
window.saveCoilDesign = saveCoilDesign;
window.saveWorkshopSettings = saveWorkshopSettings;
window.exportPDF = exportPDF;
window.exportToExcel = exportToExcel;
window.delCalc = delCalc;
window.delHead = delHead;
window.delCoil = delCoil;
window.clearMemory = clearMemory;
window.exportMemory = exportMemory;
window.savePricesLocal = savePricesLocal;
window.resetPrices = resetPrices;
window.exportPrices = exportPrices;
window.renderCatalog = renderCatalog;
window.syncFromFirebase = syncFromFirebase;
window.syncToFirebase = syncToFirebase;
