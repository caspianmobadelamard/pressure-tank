// app.js — منطق کامل برنامه

// ============================================================
// متغیرهای سراسری
// ============================================================
let PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES || {}));
let CATALOG = window.EMBEDDED_CATALOG || {categories:{}};
let USER_MODIFIED = false;

// ============================================================
// SVG Icons — نمادهای مهندسی
// ============================================================
const SVG_ICONS = {
  shell: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="0.5"/><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="17" x2="21" y2="17"/></svg>',
  head: '<svg viewBox="0 0 24 24"><path d="M3 12 Q12 4 21 12"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
  coil: '<svg viewBox="0 0 24 24"><path d="M6 6 Q10 3 12 7 Q14 11 18 8 Q22 5 20 10 Q18 15 14 13 Q10 11 8 15 Q6 19 4 15"/></svg>',
  base: '<svg viewBox="0 0 24 24"><path d="M4 8 L6 20 L10 20 L10 12 L14 12 L14 20 L18 20 L20 8 Z"/></svg>',
  pad: '<svg viewBox="0 0 24 24"><rect x="3" y="15" width="18" height="4"/><line x1="5" y1="19" x2="5" y2="21"/><line x1="19" y1="19" x2="19" y2="21"/></svg>',
  manhole: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.3"/><line x1="12" y1="6" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="18"/></svg>',
  nozzle: '<svg viewBox="0 0 24 24"><path d="M10 4 L14 4 L14 10 L18 10 L18 14 L14 14 L14 20 L10 20 L10 14 L6 14 L6 10 L10 10 Z"/></svg>',
  cathode: '<svg viewBox="0 0 24 24"><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="14" x2="16" y2="14"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  ladder: '<svg viewBox="0 0 24 24"><line x1="8" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="16" y2="21"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
  resin: '<svg viewBox="0 0 24 24"><circle cx="8" cy="10" r="2"/><circle cx="14" cy="8" r="2"/><circle cx="10" cy="15" r="2"/><circle cx="16" cy="14" r="2"/><circle cx="12" cy="12" r="2"/></svg>',
  brine: '<svg viewBox="0 0 24 24"><path d="M7 4 L17 4 L17 20 L7 20 Z"/><line x1="7" y1="10" x2="17" y2="10"/></svg>',
  valve: '<svg viewBox="0 0 24 24"><path d="M6 6 L12 12 L6 18 Z"/><path d="M18 6 L12 12 L18 18 Z"/><line x1="12" y1="12" x2="12" y2="4"/><circle cx="12" cy="3" r="1.5"/></svg>',
  tank: '<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="1"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M6 4 L18 4 L18 20 L6 20 Z"/><line x1="6" y1="9" x2="18" y2="9"/><line x1="6" y1="13" x2="18" y2="13"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
  plate: '<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="4"/><circle cx="7" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="12" r="1"/></svg>',
  tower: '<svg viewBox="0 0 24 24"><path d="M8 4 L16 4 L16 20 L8 20 Z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>',
  tray: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="3"/><circle cx="6" cy="9.5" r="0.7"/><circle cx="10" cy="9.5" r="0.7"/><circle cx="14" cy="9.5" r="0.7"/><circle cx="18" cy="9.5" r="0.7"/><rect x="3" y="14" width="18" height="3"/><circle cx="6" cy="15.5" r="0.7"/><circle cx="10" cy="15.5" r="0.7"/><circle cx="14" cy="15.5" r="0.7"/><circle cx="18" cy="15.5" r="0.7"/></svg>',
  spray: '<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="2"/><line x1="12" y1="8" x2="8" y2="14"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="12" y1="8" x2="16" y2="14"/><circle cx="8" cy="17" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="16" cy="17" r="1"/></svg>',
  demister: '<svg viewBox="0 0 24 24"><path d="M4 12 Q8 8 12 12 Q16 16 20 12"/><path d="M4 16 Q8 12 12 16 Q16 20 20 16"/></svg>',
  gauge: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><line x1="12" y1="12" x2="15" y2="8"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  pump: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 7 L12 12 L15 14"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  diaphragm: '<svg viewBox="0 0 24 24"><path d="M4 6 Q12 14 4 18"/><path d="M20 6 Q12 14 20 18"/></svg>',
  safety: '<svg viewBox="0 0 24 24"><path d="M12 4 L20 20 L4 20 Z"/><line x1="12" y1="10" x2="12" y2="15"/><circle cx="12" cy="17.5" r="0.8" fill="currentColor"/></svg>'
};

// ============================================================
// تعریف تجهیزات و اجزا
// ============================================================
const MAT_RHO = {'ST37':7850,'S235JR':7850,'A516-70':7850,'Galvanized':7850,'SS304':8000,'SS316':8000};
const MAT_S = {'ST37':13500,'S235JR':15000,'A516-70':20000,'Galvanized':14000,'SS304':16700,'SS316':16700};

const EQUIPMENT_DEFS = {
  spiral: {
    name: 'منبع اسپیرال',
    svg: 'tank',
    parts: ['shell','head','coil_pipe','base','base_pad','manhole','cathode','ladder']
  },
  u_coil: {
    name: 'منبع کوئلی U شکل',
    svg: 'tank',
    parts: ['shell','head','utube','tube_sheet','base','base_pad','manhole']
  },
  softener: {
    name: 'سختی‌گیر',
    svg: 'tank',
    parts: ['shell','head','resin','brine_tank','distributor','control_valve','base']
  },
  sand_filter: {
    name: 'فیلتر شنی / کربنی',
    svg: 'filter',
    parts: ['shell','head','filter_bed','perforated_plate','filter_nozzles','manhole','base','ladder']
  },
  deaerator: {
    name: 'دی‌اریتور',
    svg: 'tower',
    parts: ['shell','head','tower_shell','tower_head','tray','spray_system','steam_diffuser','demister','level_ctrl','safety_valve','base','manhole']
  },
  expansion_closed: {
    name: 'منبع انبساط بسته',
    svg: 'tank',
    parts: ['shell','head','diaphragm','safety_valve','air_valve','base']
  },
  expansion_open: {
    name: 'منبع انبساط باز',
    svg: 'box',
    parts: ['box_shell','nozzles','base']
  },
  condensate: {
    name: 'مخزن کندانس',
    svg: 'tank',
    parts: ['shell','head','gauge_glass','level_ctrl','makeup_valve','condensate_pump','demister','base','manhole']
  }
};

// ============================================================
// فرمول‌های پایه
// ============================================================
const cylVol = (D,H) => Math.PI/4*D*D*H/1000;
const dishVT = D => 0.0809*Math.pow(D,3)/1000;
const dishVE = D => Math.PI/6*Math.pow(D,3)/1000/2;
const dishAT = D => 1.084*Math.PI/4*D*D;

function totalVol(D,H,head){
  let v = cylVol(D,H);
  if(head==='torisph') v += 2*dishVT(D);
  else if(head==='ellip') v += 2*dishVE(D);
  return v;
}
function diamFromV(V,H,head){
  const k = head==='torisph'?0.0809/1000 : head==='ellip'?(Math.PI/6/2/1000):0;
  let lo=10, hi=1000;
  for(let i=0;i<80;i++){
    const m=(lo+hi)/2;
    const f = 2*k*Math.pow(m,3) + (Math.PI*H/4)*m*m - V*1000;
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
  return vc*1000/(Math.PI/4*D*D);
}
const sT = (P,R,mat)=>{const p=P*14.5038; const S=MAT_S[mat]||20000; return (p*R)/(S-0.6*p)+1.5;};
const hT = (P,D,mat)=>{const p=P*14.5038; const S=MAT_S[mat]||20000; return 0.885*p*D/(S-0.1*p)+1.5;};

// سطح گسترده عدسی (فرمول صنعتی کم‌عمق)
function calcBlank(D, h, L, t, type){
  let Db;
  if(type==='shallow' || type==='torisph') Db = Math.sqrt(D*D + 4*D*h) + 2*L;
  else if(type==='ellip') Db = Math.sqrt(D*D + 4*h*h) + 2*L;
  else if(type==='hemi') Db = 1.414*D + 2*L;
  else Db = Math.sqrt(D*D + 4*D*h) + 2*L;
  const A = Math.PI/4*Math.pow(Db/1000,2);
  const W = A*(t/1000)*7850;
  return {Db, A, W, perim: Math.PI*Db};
}

// ============================================================
// وزن و قیمت اجزا
// ============================================================
function partWeight(part, f){
  switch(part){
    case 'shell': {
      const D=f.d/100, H=f.h/100, t=f.t/1000;
      return Math.PI*D*H*t*MAT_RHO[f.mat||'ST37'];
    }
    case 'head': {
      const D=f.d, t=f.t, h=f.h||D*0.15, L=f.l||40;
      const res = calcBlank(D,h,L,t,f.htype||'shallow');
      return res.W * (f.n||2);
    }
    case 'coil_pipe': {
      const L=f.len||0;
      const pipeKey = f.size;
      const wkg = (PRICES.pipeWeights||{})[pipeKey] || 2;
      return L * wkg;
    }
    case 'utube': {
      const L=f.len||0;
      const pipeKey = f.size;
      const wkg = (PRICES.pipeWeights||{})[pipeKey] || 2;
      return L * wkg * (f.n||1);
    }
    case 'tube_sheet': {
      const D=f.d/100, t=f.t/1000;
      return Math.PI/4*D*D*t*MAT_RHO[f.mat||'ST37'];
    }
    case 'base': {
      const l=f.l||1, w=f.w||0.3, h=f.h||0.5, t=f.t||8;
      const one = l*w*h*(t/1000)*MAT_RHO['ST37'];
      return one * (f.n||2);
    }
    case 'base_pad': {
      const kg = (PRICES.equipmentParts?.vessel?.base_pad_weight_kg)||3;
      return kg * (f.n||2);
    }
    case 'manhole': {
      const kg = f.size==='16'?120:f.size==='18'?150:180;
      return kg * (f.n||1);
    }
    case 'ladder': {
      const lpm = (PRICES.equipmentParts?.ladder?.weight_per_m)||15;
      return lpm * (f.len||0);
    }
    case 'box_shell': {
      const l=f.l/100, w=f.w/100, h=f.h/100, t=f.t/1000;
      const area = 2*(l*w + w*h + l*h);
      return area*t*MAT_RHO[f.mat||'ST37'];
    }
    case 'tower_shell': {
      const D=f.d/100, H=f.h/100, t=f.t/1000;
      return Math.PI*D*H*t*MAT_RHO[f.mat||'SS304'];
    }
    case 'tower_head': {
      const D=f.d, t=f.t;
      return calcBlank(D, D*0.15, 30, t, 'shallow').W;
    }
    case 'filter_bed': {
      const D=f.d/100, H=f.h/100;
      const V = Math.PI/4*D*D*H;
      const dSand = f.dens||1400;
      return V*dSand*(f.fill||0.7);
    }
    case 'resin': {
      const D=f.d/100, H=f.h/100;
      const V = Math.PI/4*D*D*H;
      return V*750*(f.fill||0.6);
    }
    case 'diaphragm': {
      const D=f.d;
      const A = Math.PI/4*Math.pow(D/1000,2);
      const kgPerM2 = f.type==='butyl'?2.5:f.type==='epdm'?3.5:2.5;
      return A*kgPerM2;
    }
    // اجزای ثابت (وزن تقریبی)
    case 'cathode': return (f.n||1)*5;
    case 'brine_tank': return 40;
    case 'distributor': return 25;
    case 'control_valve': return 15;
    case 'perforated_plate': return 30;
    case 'filter_nozzles': return (f.n||50)*0.2;
    case 'tray': return (f.n||5)*25;
    case 'spray_system': return 18;
    case 'steam_diffuser': return 22;
    case 'demister': return 12;
    case 'level_ctrl': return 4;
    case 'safety_valve': return 6;
    case 'air_valve': return 1;
    case 'gauge_glass': return 2;
    case 'makeup_valve': return 5;
    case 'condensate_pump': return 85;
    case 'nozzles': return 8;
    return 0;
  }
}

function partCost(part, f){
  const P = PRICES;
  switch(part){
    case 'shell': {
      const w = partWeight('shell',f);
      const price = findSheetPrice(f.mat||'ST37', f.t);
      return w*price*1.15; // 15% waste
    }
    case 'head': {
      const w = partWeight('head',f);
      const price = findSheetPrice(f.mat||'ST37', f.t);
      return w*price*1.35; // 35% markup
    }
    case 'coil_pipe': {
      const L = f.len||0;
      const pipeKey = f.size;
      const pricePerM = (P.pipes||{})[pipeKey] / 6 || 0;
      return L * pricePerM;
    }
    case 'utube': {
      const L = f.len||0;
      const pipeKey = f.size;
      const pricePerM = (P.pipes||{})[pipeKey] / 6 || 0;
      return L * pricePerM * (f.n||1);
    }
    case 'tube_sheet': {
      const w = partWeight('tube_sheet',f);
      const price = findSheetPrice(f.mat||'ST37', f.t||10);
      return w * price * 1.3;
    }
    case 'base': {
      const w = partWeight('base',f);
      return w * 55000 * (f.n||2);
    }
    case 'base_pad': {
      const padPrice = (P.equipmentParts?.vessel?.base_pad_each)||250000;
      return padPrice * (f.n||2);
    }
    case 'manhole': {
      const mp = P.manholes||{};
      const price = f.size==='16'?mp.manhole_16:f.size==='18'?mp.manhole_18:mp.manhole_20;
      return (price||0) * (f.n||1);
    }
    case 'ladder': {
      const w = partWeight('ladder',f);
      const pkg = (P.equipmentParts?.ladder?.price_per_kg)||80000;
      return w * pkg;
    }
    case 'box_shell': {
      const w = partWeight('box_shell',f);
      const price = findSheetPrice(f.mat||'ST37', f.t);
      return w*price*1.15;
    }
    case 'tower_shell': {
      const w = partWeight('tower_shell',f);
      const price = findSheetPrice(f.mat||'SS304', f.t);
      return w*price*1.15;
    }
    case 'tower_head': {
      const w = partWeight('tower_head',f);
      const price = findSheetPrice(f.mat||'SS304', f.t);
      return w*price*1.35;
    }
    case 'filter_bed': {
      const w = partWeight('filter_bed',f);
      const pricePerKg = (P.equipmentParts?.sandFilter?.sand_kg)||25000;
      return w*pricePerKg;
    }
    case 'resin': {
      const w = partWeight('resin',f);
      const pricePerKg = (P.equipmentParts?.softener?.resin_kg)||180000;
      return w*pricePerKg;
    }
    case 'diaphragm': {
      const w = partWeight('diaphragm',f);
      const price = f.type==='butyl'?(P.equipmentParts?.expansion?.diaphragm_butyl):
                    f.type==='epdm'?(P.equipmentParts?.expansion?.diaphragm_epdm):3200000;
      return price;
    }
    // اجزای ثابت (قیمت ثابت)
    case 'cathode': {
      const price = f.type==='zn'?(P.equipmentParts?.cathodic?.anode_zn):350000;
      return price*(f.n||1);
    }
    case 'brine_tank': return (P.equipmentParts?.softener?.brine_tank)||4500000;
    case 'distributor': return (P.equipmentParts?.softener?.distributor)||2500000;
    case 'control_valve': {
      if(f.type==='auto') return (P.equipmentParts?.softener?.control_valve_auto)||12000000;
      if(f.type==='semi') return (P.equipmentParts?.softener?.control_valve_semi)||7500000;
      return (P.equipmentParts?.softener?.control_valve_manual)||3500000;
    }
    case 'perforated_plate': return (P.equipmentParts?.sandFilter?.perforated_plate)||2500000;
    case 'filter_nozzles': return (f.n||50)*((P.equipmentParts?.sandFilter?.nozzle_each)||250000);
    case 'tray': return (f.n||5)*((P.equipmentParts?.deaerator?.tray_each)||1800000);
    case 'spray_system': return (P.equipmentParts?.deaerator?.spray_system)||6500000;
    case 'steam_diffuser': return (P.equipmentParts?.deaerator?.steam_diffuser)||4500000;
    case 'demister': return (P.equipmentParts?.deaerator?.demister)||3200000;
    case 'level_ctrl': return (P.equipmentParts?.deaerator?.level_controller)||5800000;
    case 'safety_valve': return (P.equipmentParts?.deaerator?.safety_valve)||2500000;
    case 'air_valve': return (P.equipmentParts?.expansion?.air_valve)||650000;
    case 'gauge_glass': return (P.equipmentParts?.condensate?.gauge_glass)||850000;
    case 'makeup_valve': return (P.equipmentParts?.condensate?.makeup_valve)||2200000;
    case 'condensate_pump': return (P.equipmentParts?.condensate?.condensate_pump)||15000000;
    case 'nozzles': return (f.n||4)*780000;
    return 0;
  }
}

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

// ============================================================
// تعریف فیلدهای هر جزء
// ============================================================
const PART_DEFS = {
  shell: {
    name: 'پوسته استوانه',
    icon: 'shell',
    defOn: true,
    fields: [
      {id:'d', label:'قطر داخلی (cm)', def:160},
      {id:'h', label:'ارتفاع/طول (cm)', def:300},
      {id:'t', label:'ضخامت (mm)', def:6},
      {id:'mat', label:'جنس ورق', type:'select', options:['ST37','S235JR','A516-70','Galvanized','SS304','SS316'], def:'ST37'}
    ]
  },
  head: {
    name: 'عدسی‌ها',
    icon: 'head',
    defOn: true,
    fields: [
      {id:'d', label:'قطر داخلی (mm)', def:1600},
      {id:'h', label:'گودی (mm)', def:240},
      {id:'l', label:'طول لبه (mm)', def:40},
      {id:'t', label:'ضخامت (mm)', def:8},
      {id:'htype', label:'نوع عدسی', type:'select', options:[['shallow','کم‌عمق'],['torisph','تورسفریکال'],['ellip','بیضوی'],['hemi','نیم‌کره']], def:'shallow'},
      {id:'mat', label:'جنس', type:'select', options:['ST37','S235JR','A516-70','Galvanized','SS304','SS316'], def:'ST37'},
      {id:'n', label:'تعداد', def:2}
    ]
  },
  coil_pipe: {
    name: 'لوله کویل مارپیچ',
    icon: 'coil',
    defOn: true,
    fields: [
      {id:'size', label:'سایز لوله', type:'select', options:[
        ['copper_1_2','مسی ۱/۲'],['copper_3_4','مسی ۳/۴'],['copper_1','مسی ۱'],['copper_1_1_4','مسی ۱ ۱/۴'],
        ['galv_1','گالوانیزه ۱'],['galv_1_1_2','گالوانیزه ۱ ۱/۲'],['galv_2','گالوانیزه ۲'],
        ['SS304_1','استیل ۳۰۴ ۱'],['SS304_1_1_2','استیل ۳۰۴ ۱ ۱/۲'],['SS304_2','استیل ۳۰۴ ۲']
      ], def:'copper_1'},
      {id:'len', label:'طول لوله (m)', def:30}
    ]
  },
  utube: {
    name: 'کویل U شکل',
    icon: 'coil',
    defOn: true,
    fields: [
      {id:'size', label:'سایز لوله U', type:'select', options:[
        ['galv_1_2','گالوانیزه ۱/۲'],['galv_3_4','گالوانیزه ۳/۴'],['galv_1','گالوانیزه ۱'],
        ['SS304_1_2','استیل ۳۰۴ ۱/۲'],['SS304_3_4','استیل ۳۰۴ ۳/۴'],['SS304_1','استیل ۳۰۴ ۱'],
        ['SS309_1_2','استیل ۳۰۹ ۱/۲'],['SS309_3_4','استیل ۳۰۹ ۳/۴'],['SS309_1','استیل ۳۰۹ ۱']
      ], def:'SS304_3_4'},
      {id:'n', label:'تعداد لوله U', def:4},
      {id:'len', label:'طول هر لوله (m)', def:6}
    ]
  },
  tube_sheet: {
    name: 'صفحه لوله (Tube Sheet)',
    icon: 'plate',
    defOn: true,
    fields: [
      {id:'d', label:'قطر صفحه (cm)', def:155},
      {id:'t', label:'ضخامت (mm)', def:20},
      {id:'mat', label:'جنس', type:'select', options:['ST37','S235JR','A516-70','SS304','SS316'], def:'A516-70'}
    ]
  },
  base: {
    name: 'پایه‌ها (Saddle / Leg)',
    icon: 'base',
    defOn: true,
    fields: [
      {id:'n', label:'تعداد پایه', def:2},
      {id:'l', label:'طول پایه (m)', def:1.2},
      {id:'w', label:'عرض پایه (m)', def:0.4},
      {id:'h', label:'ارتفاع پایه (m)', def:0.5},
      {id:'t', label:'ضخامت ورق (mm)', def:10}
    ]
  },
  base_pad: {
    name: 'پد پایه',
    icon: 'pad',
    defOn: true,
    fields: [
      {id:'n', label:'تعداد', def:2}
    ]
  },
  manhole: {
    name: 'منهول',
    icon: 'manhole',
    defOn: true,
    fields: [
      {id:'size', label:'سایز', type:'select', options:[['16','۱۶ اینچ'],['18','۱۸ اینچ'],['20','۲۰ اینچ']], def:'16'},
      {id:'n', label:'تعداد', def:1}
    ]
  },
  headhole: {
    name: 'هدهول',
    icon: 'manhole',
    defOn: false,
    fields: [
      {id:'size', label:'سایز', type:'select', options:[['6','۶ اینچ'],['8','۸ اینچ']], def:'6'},
      {id:'n', label:'تعداد', def:1}
    ]
  },
  handhole: {
    name: 'هندهول',
    icon: 'manhole',
    defOn: false,
    fields: [
      {id:'size', label:'سایز', type:'select', options:[['4','۴ اینچ'],['5','۵ اینچ']], def:'4'},
      {id:'n', label:'تعداد', def:1}
    ]
  },
  cathode: {
    name: 'حفاظت کاتدی',
    icon: 'cathode',
    defOn: false,
    fields: [
      {id:'type', label:'نوع آند', type:'select', options:[['zn','آند روی'],['al','آند آلومینیوم'],['mg','آند منیزیم']], def:'zn'},
      {id:'n', label:'تعداد', def:2}
    ]
  },
  ladder: {
    name: 'نردبان و پلتفرم',
    icon: 'ladder',
    defOn: false,
    fields: [
      {id:'len', label:'طول نردبان (m)', def:5}
    ]
  },
  resin: {
    name: 'رزین تبادل یونی',
    icon: 'resin',
    defOn: true,
    fields: [
      {id:'d', label:'قطر بستر (cm)', def:100},
      {id:'h', label:'ارتفاع بستر (cm)', def:120},
      {id:'fill', label:'ضریب پر شدن', def:0.6}
    ]
  },
  brine_tank: {
    name: 'مخزن نمک',
    icon: 'brine',
    defOn: true,
    fields: []
  },
  distributor: {
    name: 'سیستم توزیع',
    icon: 'nozzle',
    defOn: true,
    fields: []
  },
  control_valve: {
    name: 'شیر کنترل',
    icon: 'valve',
    defOn: true,
    fields: [
      {id:'type', label:'نوع', type:'select', options:[['auto','اتوماتیک'],['semi','نیمه اتوماتیک'],['manual','دستی']], def:'auto'}
    ]
  },
  filter_bed: {
    name: 'بستر فیلتر (شن/کربن)',
    icon: 'filter',
    defOn: true,
    fields: [
      {id:'d', label:'قطر بستر (cm)', def:120},
      {id:'h', label:'ارتفاع بستر (cm)', def:150},
      {id:'dens', label:'چگالی (kg/m³)', def:1400},
      {id:'fill', label:'ضریب پر شدن', def:0.7}
    ]
  },
  perforated_plate: {
    name: 'صفحه مشبک',
    icon: 'plate',
    defOn: true,
    fields: []
  },
  filter_nozzles: {
    name: 'نازل‌های جمع‌آوری',
    icon: 'nozzle',
    defOn: true,
    fields: [
      {id:'n', label:'تعداد نازل', def:50}
    ]
  },
  tower_shell: {
    name: 'پوسته برج',
    icon: 'tower',
    defOn: true,
    fields: [
      {id:'d', label:'قطر برج (cm)', def:80},
      {id:'h', label:'ارتفاع برج (cm)', def:250},
      {id:'t', label:'ضخامت (mm)', def:4},
      {id:'mat', label:'جنس', type:'select', options:['SS304','SS316'], def:'SS304'}
    ]
  },
  tower_head: {
    name: 'عدسی برج',
    icon: 'head',
    defOn: true,
    fields: [
      {id:'d', label:'قطر (mm)', def:800},
      {id:'t', label:'ضخامت (mm)', def:5},
      {id:'mat', label:'جنس', type:'select', options:['SS304','SS316'], def:'SS304'}
    ]
  },
  tray: {
    name: 'سینی‌های سوراخ‌دار',
    icon: 'tray',
    defOn: true,
    fields: [
      {id:'n', label:'تعداد سینی', def:5}
    ]
  },
  spray_system: {
    name: 'سیستم اسپری',
    icon: 'spray',
    defOn: true,
    fields: []
  },
  steam_diffuser: {
    name: 'دیفیوزر بخار',
    icon: 'nozzle',
    defOn: true,
    fields: []
  },
  demister: {
    name: 'جداکننده قطرات (Demister)',
    icon: 'demister',
    defOn: true,
    fields: []
  },
  level_ctrl: {
    name: 'کنترلر سطح',
    icon: 'gauge',
    defOn: true,
    fields: []
  },
  safety_valve: {
    name: 'شیر اطمینان',
    icon: 'safety',
    defOn: true,
    fields: []
  },
  air_valve: {
    name: 'شیر هوا',
    icon: 'valve',
    defOn: true,
    fields: []
  },
  diaphragm: {
    name: 'دیافراگم',
    icon: 'diaphragm',
    defOn: true,
    fields: [
      {id:'d', label:'قطر (mm)', def:600},
      {id:'type', label:'نوع', type:'select', options:[['butyl','بوتیل'],['epdm','EPDM']], def:'butyl'}
    ]
  },
  gauge_glass: {
    name: 'شیشه سطح',
    icon: 'gauge',
    defOn: true,
    fields: []
  },
  makeup_valve: {
    name: 'شیر آب جبرانی',
    icon: 'valve',
    defOn: true,
    fields: []
  },
  condensate_pump: {
    name: 'پمپ کندانس',
    icon: 'pump',
    defOn: true,
    fields: []
  },
  box_shell: {
    name: 'بدنه مکعبی',
    icon: 'shell',
    defOn: true,
    fields: [
      {id:'l', label:'طول (cm)', def:100},
      {id:'w', label:'عرض (cm)', def:100},
      {id:'h', label:'ارتفاع (cm)', def:100},
      {id:'t', label:'ضخامت (mm)', def:4},
      {id:'mat', label:'جنس', type:'select', options:['ST37','S235JR','Galvanized'], def:'ST37'}
    ]
  },
  nozzles: {
    name: 'نازل‌های ورودی/خروجی',
    icon: 'nozzle',
    defOn: true,
    fields: [
      {id:'n', label:'تعداد نازل', def:4}
    ]
  }
};

// ============================================================
// ذخیره state انتخاب تجهیزات
// ============================================================
const EQ_STATE = {weight:{}, cost:{}};

function initEqState(mode){
  const eq = document.getElementById(mode==='weight'?'w-eq':'c-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  if(!def) return;
  if(!EQ_STATE[mode][eq]){
    EQ_STATE[mode][eq] = {};
    def.parts.forEach(p => {
      const pd = PART_DEFS[p];
      if(!pd) return;
      const fields = {};
      pd.fields.forEach(f=>{
        if(f.type==='select' && f.options){
          fields[f.id] = f.options[0][0] || f.options[0];
        } else {
          fields[f.id] = f.def;
        }
      });
      EQ_STATE[mode][eq][p] = {on: pd.defOn, fields: fields};
    });
  }
}

// ============================================================
// نمایش تجهیز و اجزا
// ============================================================
function loadEquipment(mode){
  initEqState(mode);
  const eq = document.getElementById(mode==='weight'?'w-eq':'c-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  if(!def) return;
  const container = document.getElementById(mode==='weight'?'w-components':'c-components');
  const headerEl = document.getElementById(mode==='weight'?'w-eq-header':'c-eq-header');

  // Header
  headerEl.innerHTML = `<div class="eq-header">
    ${SVG_ICONS[def.svg]||SVG_ICONS.tank}
    <div class="info">
      <h3>${def.name}</h3>
      <p>${def.parts.length} جزء قابل تنظیم</p>
    </div>
  </div>`;

  // Components
  let html = '';
  def.parts.forEach(pid=>{
    const pd = PART_DEFS[pid];
    if(!pd) return;
    const st = EQ_STATE[mode][eq][pid];
    const on = st.on;
    html += `<div class="comp-card ${on?'enabled':''}" data-mode="${mode}" data-eq="${eq}" data-pid="${pid}" data-part="${pid}">
      <div class="comp-head" onclick="toggleComp('${mode}','${eq}','${pid}')">
        <div class="comp-title">
          ${SVG_ICONS[pd.icon]||SVG_ICONS.tank}
          <span>${pd.name}</span>
        </div>
        <div class="comp-toggle">
          <span class="comp-weight-badge" id="badge-${mode}-${pid}"></span>
          <input type="checkbox" ${on?'checked':''} onclick="event.stopPropagation();toggleComp('${mode}','${eq}','${pid}')">
        </div>
      </div>
      <div class="comp-body ${on?'open':''}">
        ${renderFields(mode, eq, pid, pd, st)}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function renderFields(mode, eq, pid, pd, st){
  let html = '';
  const fields = pd.fields||[];
  // دو ستون
  if(fields.length === 0) return '<div class="hint">بدون پارامتر — قیمت ثابت</div>';
  html += '<div class="row">';
  fields.forEach(f=>{
    const v = st.fields[f.id];
    if(f.type==='select'){
      let opts = '';
      const options = f.options.map(o=> Array.isArray(o)? o : [o,o]);
      options.forEach(([val,label])=>{
        opts += `<option value="${val}" ${v==val?'selected':''}>${label}</option>`;
      });
      html += `<div class="field"><label>${f.label}</label>
        <select onchange="updateField('${mode}','${eq}','${pid}','${f.id}',this.value)">${opts}</select>
      </div>`;
    } else {
      html += `<div class="field"><label>${f.label}</label>
        <input type="number" step="any" value="${v}" oninput="updateField('${mode}','${eq}','${pid}','${f.id}',parseFloat(this.value)||0)">
      </div>`;
    }
  });
  html += '</div>';
  return html;
}

function toggleComp(mode, eq, pid){
  const st = EQ_STATE[mode][eq][pid];
  st.on = !st.on;
  const card = document.querySelector(`.comp-card[data-mode="${mode}"][data-part="${pid}"]`);
  if(card){
    card.classList.toggle('enabled', st.on);
    card.querySelector('input[type=checkbox]').checked = st.on;
    card.querySelector('.comp-body').classList.toggle('open', st.on);
  }
  // پاک کردن نتیجه قبلی
  document.getElementById(mode==='weight'?'w-result':'c-result').innerHTML = '';
}

function updateField(mode, eq, pid, fid, value){
  EQ_STATE[mode][eq][pid].fields[fid] = value;
  document.getElementById(mode==='weight'?'w-result':'c-result').innerHTML = '';
}

// ============================================================
// محاسبه وزن کل
// ============================================================
function calcWeight(){
  const eq = document.getElementById('w-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  const state = EQ_STATE.weight[eq];
  const out = document.getElementById('w-result');
  if(!def){ out.innerHTML = '<div class="result red"><div class="item"><span class="lbl">تجهیز یافت نشد</span></div></div>'; return; }

  let total = 0;
  let rows = '';
  const details = [];
  def.parts.forEach(pid=>{
    const st = state[pid];
    if(!st || !st.on) return;
    const pd = PART_DEFS[pid];
    if(!pd) return;
    const w = partWeight(pid, st.fields);
    total += w;
    details.push({name: pd.name, w: w});
    // آپدیت badge
    const badge = document.getElementById(`badge-weight-${pid}`);
    if(badge){ badge.textContent = fmt(w,1)+' kg'; badge.classList.add('active'); }
  });

  // جوشکاری، رنگ، متعلقات جانبی (۸٪)
  const extras = total * 0.08;
  const grandTotal = total + extras;
  const volume = estimateVolume(eq, state);

  let html = `<div class="summary-box"><div class="label">وزن خالی کل</div><div class="value">${fmt(grandTotal,1)} kg</div><div class="sub">${fmt(grandTotal/1000,3)} تن</div></div>`;
  html += `<div class="result">`;
  details.forEach(d=>{
    html += `<div class="item"><span class="lbl">${d.name}</span><span class="val">${fmt(d.w,1)} kg</span></div>`;
  });
  html += `<div class="item"><span class="lbl">جوش، رنگ، متعلقات (۸٪)</span><span class="val">${fmt(extras,1)} kg</span></div>`;
  if(volume > 0){
    html += `<div class="item big"><span class="lbl">حجم آب داخل</span><span class="val">${fmt(volume,0)} لیتر</span></div>`;
    html += `<div class="item big"><span class="lbl">وزن پر از آب</span><span class="val">${fmt(grandTotal + volume,0)} kg</span></div>`;
  }
  html += `</div>`;
  out.innerHTML = html;
}

function estimateVolume(eq, state){
  // تلاش برای تخمین حجم بر اساس پوسته
  if(state.shell && state.shell.on){
    const f = state.shell.fields;
    const D = f.d, H = f.h;
    if(D>0 && H>0) return totalVol(D, H, 'torisph');
  }
  if(state.box_shell && state.box_shell.on){
    const f = state.box_shell.fields;
    return f.l*f.w*f.h/1000;
  }
  return 0;
}

// ============================================================
// محاسبه قیمت کل
// ============================================================
function calcCost(){
  const eq = document.getElementById('c-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  const state = EQ_STATE.cost[eq];
  const out = document.getElementById('c-result');
  const pp = parseFloat(document.getElementById('c-profit').value)||25;
  if(!def){ out.innerHTML = '<div class="result red"><div class="item"><span class="lbl">تجهیز یافت نشد</span></div></div>'; return; }

  let total = 0;
  const details = [];
  def.parts.forEach(pid=>{
    const st = state[pid];
    if(!st || !st.on) return;
    const pd = PART_DEFS[pid];
    if(!pd) return;
    const c = partCost(pid, st.fields);
    total += c;
    details.push({name: pd.name, c: c, w: partWeight(pid, st.fields)});
  });

  // محاسبه جوشکاری و مونتاژ
  const totalWeight = details.reduce((s,d)=>s+d.w, 0);
  const weldHours = totalWeight / 20; // هر ۲۰ کیلو = ۱ ساعت جوش
  const weldCost = weldHours * (PRICES.welder_hr||280000);
  const fitterCost = weldHours * 0.5 * (PRICES.fitter_hr||200000);
  const electrode = totalWeight * 0.02 * (PRICES.electrode_kg||320000);
  const paintArea = totalWeight * 0.05;
  const paintCost = paintArea * ((PRICES.paint_epoxy_m2||180000) + (PRICES.paint_zinc_m2||220000));

  const subtotal1 = total + weldCost + fitterCost + electrode + paintCost;
  const consumables = subtotal1 * ((PRICES.consumables_pct||8)/100);
  const transport = totalWeight * (PRICES.transport_per_kg||350);
  const beforeProfit = subtotal1 + consumables + transport;
  const final = beforeProfit * (1 + pp/100);

  let html = `<div class="summary-box blue"><div class="label">قیمت نهایی</div><div class="value">${fmtT(final)}</div><div class="sub">تومان</div></div>`;
  html += `<div class="result blue">`;
  details.forEach(d=>{
    html += `<div class="item"><span class="lbl">${d.name}</span><span class="val">${fmtT(d.c)}</span></div>`;
  });
  html += `<div class="divider"></div>`;
  html += `<div class="item"><span class="lbl">جوشکاری (${fmt(weldHours,1)} hr)</span><span class="val">${fmtT(weldCost)}</span></div>`;
  html += `<div class="item"><span class="lbl">مونتاژ</span><span class="val">${fmtT(fitterCost)}</span></div>`;
  html += `<div class="item"><span class="lbl">الکترود</span><span class="val">${fmtT(electrode)}</span></div>`;
  html += `<div class="item"><span class="lbl">رنگ</span><span class="val">${fmtT(paintCost)}</span></div>`;
  html += `<div class="item"><span class="lbl">مصرفی جانبی (${PRICES.consumables_pct}٪)</span><span class="val">${fmtT(consumables)}</span></div>`;
  html += `<div class="item"><span class="lbl">حمل (${fmt(totalWeight,0)}kg)</span><span class="val">${fmtT(transport)}</span></div>`;
  html += `<div class="divider"></div>`;
  html += `<div class="item big"><span class="lbl">جمع هزینه</span><span class="val">${fmtT(beforeProfit)}</span></div>`;
  html += `<div class="item big"><span class="lbl">سود (${pp}٪)</span><span class="val">${fmtT(beforeProfit*pp/100)}</span></div>`;
  html += `<div class="item big" style="border-top:2px solid var(--blue);padding-top:12px"><span class="lbl">💰 قیمت نهایی</span><span class="val" style="font-size:20px">${fmtT(final)}</span></div>`;
  html += `</div>`;
  out.innerHTML = html;

  // آپدیت badge
  details.forEach((d, i)=>{
    const pid = def.parts.filter(p=>state[p] && state[p].on)[i];
    const badge = document.getElementById(`badge-cost-${pid}`);
    if(badge){ badge.textContent = fmtT(d.c); badge.classList.add('active'); }
  });
}

// ============================================================
// تب‌های محاسبات ساده
// ============================================================
function calcVol(){
  const t = document.getElementById('v-type').value;
  const out = document.getElementById('v-res');
  if(t==='box'){
    const W=val('v-d'), L=val('v-l'), H=val('v-w');
    if(!(W>0&&L>0&&H>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">همه ابعاد را پر کنید</span></div></div>'; return; }
    const V=W*L*H/1000;
    out.innerHTML = `<div class="result"><div class="item big"><span class="lbl">حجم</span><span class="val">${fmt(V)} L</span></div><div class="item"><span class="lbl">سطح</span><span class="val">${fmt(2*(W*L+W*H+L*H)/10000,2)} m²</span></div></div>`;
    return;
  }
  const D=val('v-d'), H=val('v-h');
  if(!(D>0&&H>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">قطر و ارتفاع</span></div></div>'; return; }
  const head = t==='cyl-dish'?'torisph':'flat';
  const vB = cylVol(D,H), vH = head==='torisph'?2*dishVT(D):0;
  const V = vB+vH;
  const aB = Math.PI*D*H/10000;
  const aH = head==='torisph'?2*dishAT(D)/10000:2*(Math.PI/4*D*D)/10000;
  out.innerHTML = `<div class="result">
    <div class="item"><span class="lbl">حجم بدنه</span><span class="val">${fmt(vB)} L</span></div>
    <div class="item"><span class="lbl">حجم عدسی‌ها</span><span class="val">${fmt(vH)} L</span></div>
    <div class="item big"><span class="lbl">حجم کل</span><span class="val">${fmt(V)} L</span></div>
    <div class="item"><span class="lbl">سطح کل</span><span class="val">${fmt(aB+aH,2)} m²</span></div>
  </div>`;
}

function calcDim(){
  const V=val('d-v'), D=val('d-d')||0, H=val('d-h')||0;
  const head = document.getElementById('d-type').value==='cyl-dish'?'torisph':'flat';
  const out = document.getElementById('d-res');
  if(!(V>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">ظرفیت</span></div></div>'; return; }
  let html = '<div class="result">';
  if(D>0&&H>0){
    const Vc = totalVol(D,H,head);
    html += `<div class="item big"><span class="lbl">حجم</span><span class="val">${fmt(Vc)} L</span></div>`;
    html += `<div class="item"><span class="lbl">اختلاف</span><span class="val">${fmt(Vc-V,1)} L</span></div>`;
  } else if(D>0){
    const Hc = hFromV(V,D,head);
    html += `<div class="item big"><span class="lbl">ارتفاع</span><span class="val">${fmt(Hc,1)} cm</span></div>`;
  } else if(H>0){
    const Dc = diamFromV(V,H,head);
    html += `<div class="item big"><span class="lbl">قطر</span><span class="val">${fmt(Dc,1)} cm</span></div>`;
  } else {
    let best=null;
    for(let n=1;n<=10;n++){
      const Hf=n*150, Df=diamFromV(V,Hf,head);
      const C=Math.PI*Df, m=Math.ceil(C/600), waste=n*(m*600-C);
      const pct=waste/(n*m*600)*100;
      if(!best||pct<best.pct) best={n,H:Hf,D:Df,pct};
    }
    html += `<div class="item big"><span class="lbl">ارتفاع</span><span class="val">${fmt(best.H,0)} cm</span></div>`;
    html += `<div class="item big"><span class="lbl">قطر</span><span class="val">${fmt(best.D,1)} cm</span></div>`;
    html += `<div class="item"><span class="lbl">پرت</span><span class="val">${fmt(best.pct,1)}٪</span></div>`;
  }
  out.innerHTML = html+'</div>';
}

function optSheets(){
  const V=val('s-v'), wSel=document.getElementById('s-w').value, L=val('s-l')||600, maxN=parseInt(document.getElementById('s-max').value)||10;
  const out=document.getElementById('s-res');
  if(!(V>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">ظرفیت</span></div></div>'; return; }
  const widths = wSel==='both'?[150,152]:[parseFloat(wSel)];
  const rows=[];
  for(const w of widths) for(let n=1;n<=maxN;n++){
    const H=n*w, D=diamFromV(V,H,'torisph'), C=Math.PI*D;
    const m=Math.ceil(C/L), sheets=n*m, waste=n*(m*L-C), pct=waste/(sheets*L)*100;
    rows.push({w,n,H,D,C,m,sheets,waste,pct});
  }
  rows.sort((a,b)=>Math.abs(a.pct-b.pct)>0.01?a.pct-b.pct:a.sheets-b.sheets);
  const best={};
  for(const w of widths){const s=rows.filter(r=>r.w===w); if(s.length) best[w]=s[0];}
  let html = '<div class="table-wrap"><table><thead><tr><th>عرض</th><th>کورس</th><th>ارتفاع</th><th>قطر</th><th>ورق</th><th>کل</th><th>پرت٪</th></tr></thead><tbody>';
  rows.slice(0,15).forEach(r=>{
    const isB = best[r.w]&&best[r.w].n===r.n;
    html += `<tr class="${isB?'best':''}"><td>${r.w}${isB?' ★':''}</td><td>${r.n}</td><td>${fmt(r.H,0)}</td><td>${fmt(r.D,1)}</td><td>${r.m}</td><td>${r.sheets}</td><td>${fmt(r.pct,1)}</td></tr>`;
  });
  html += '</tbody></table></div>';
  out.innerHTML = html;
}

// ============================================================
// عدسی
// ============================================================
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

function calcBlank(){
  const D = val('h-d'), h = val('h-h'), L = val('h-l')||0, t = val('h-t')||6;
  const type = document.getElementById('h-type').value;
  const mat = document.getElementById('h-mat').value;
  const out = document.getElementById('h-res');
  if(!(D>0 && h>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">قطر و گودی</span></div></div>'; return; }
  const res = calcBlank(D,h,L,t,type);
  const price = findSheetPrice(mat, t);
  const cost = res.W * price * 1.35;
  out.innerHTML = `<div class="result">
    <div class="item big"><span class="lbl">قطر گسترده</span><span class="val">${fmt(res.Db,1)} mm</span></div>
    <div class="item big"><span class="lbl">سطح گسترده</span><span class="val">${fmt(res.A,3)} m²</span></div>
    <div class="item big"><span class="lbl">وزن عدسی</span><span class="val">${fmt(res.W,1)} kg</span></div>
    <div class="item"><span class="lbl">محیط لبه</span><span class="val">${fmt(res.perim,1)} mm</span></div>
    <div class="divider"></div>
    <div class="item"><span class="lbl">قیمت ورق</span><span class="val">${fmt(price,0)}</span></div>
    <div class="item big"><span class="lbl">هزینه ساخت (با ۳۵٪)</span><span class="val">${fmtT(cost)}</span></div>
  </div>`;
}

function saveHeadCalc(){
  const D = val('h-d'), h = val('h-h'), L = val('h-l')||0, t = val('h-t')||6;
  const type = document.getElementById('h-type').value;
  if(!(D>0 && h>0)){ showStatus('danger','اطلاعات کامل نیست'); return; }
  const res = calcBlank(D,h,L,t,type);
  const name = prompt('نام:', 'عدسی '+D+'mm');
  if(!name) return;
  if(saveCalculation('head', name, {D,h,L,t,type}, res)){
    showStatus('success','✅ ذخیره شد');
    renderMemory();
  }
}

// ============================================================
// حافظه
// ============================================================
function saveCalculation(type, name, inputs, outputs){
  try{
    const key = 'csp_calcs';
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({id:'c_'+Date.now(), type, name, date: new Date().toLocaleDateString('fa-IR'), inputs, outputs});
    if(list.length > 100) list = list.slice(0,100);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  }catch(e){ return false; }
}
function loadCalculations(){
  try{ return JSON.parse(localStorage.getItem('csp_calcs')||'[]'); }catch(e){ return []; }
}
function deleteCalculation(id){
  try{
    let list = loadCalculations();
    list = list.filter(c=>c.id!==id);
    localStorage.setItem('csp_calcs', JSON.stringify(list));
    return true;
  }catch(e){ return false; }
}
function renderMemory(){
  const list = loadCalculations();
  const search = (document.getElementById('mem-search').value||'').toLowerCase();
  const filtered = search ? list.filter(c=>c.name.toLowerCase().includes(search)) : list;
  const el = document.getElementById('mem-list');
  if(!filtered.length){ el.innerHTML='<div class="empty-state">محاسبه‌ای ذخیره نشده</div>'; return; }
  let html = '';
  filtered.forEach(c=>{
    html += `<div class="save-row">
      <div class="info"><b>${c.name}</b><br><span style="color:var(--mt)">${c.type} — ${c.date}</span></div>
      <button class="load" onclick="loadCalc('${c.id}')">بارگذاری</button>
      <button class="del" onclick="delCalc('${c.id}')">حذف</button>
    </div>`;
  });
  el.innerHTML = html;
}
function loadCalc(id){
  const c = loadCalculations().find(x=>x.id===id);
  if(!c) return;
  if(c.type==='head'){
    document.getElementById('h-d').value = c.inputs.D;
    document.getElementById('h-h').value = c.inputs.h;
    document.getElementById('h-l').value = c.inputs.L;
    document.getElementById('h-t').value = c.inputs.t;
    document.getElementById('h-type').value = c.inputs.type;
    document.querySelector('[data-tab="t6"]').click();
    calcBlank();
  }
  showStatus('success','✅ بارگذاری شد');
}
function delCalc(id){
  if(!confirm('حذف شود؟')) return;
  deleteCalculation(id);
  renderMemory();
}
function clearMemory(){
  if(!confirm('همه پاک شوند؟')) return;
  localStorage.removeItem('csp_calcs');
  renderMemory();
}
function exportMemory(){
  const list = loadCalculations();
  if(!list.length){ showStatus('warn','لیست خالی'); return; }
  let csv = 'نام,نوع,تاریخ\n';
  list.forEach(c=>{ csv += `"${c.name}","${c.type}","${c.date}"\n`; });
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'calculations.csv';
  a.click();
}

// ============================================================
// قیمت‌ها
// ============================================================
function renderPriceEditor(){
  const c = document.getElementById('price-editor');
  if(!c) return;
  let html = '';
  html += '<div class="price-section-title">ورق‌ها (تومان/kg)</div>';
  for(const k in PRICES.sheets){
    html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="sheets" data-key="${k}" value="${PRICES.sheets[k]}"></div>`;
  }
  html += '<div class="price-section-title">لوله‌ها (تومان/شاخه ۶متری)</div>';
  for(const k in PRICES.pipes){
    html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="pipes" data-key="${k}" value="${PRICES.pipes[k]}"></div>`;
  }
  html += '<div class="price-section-title">بوشن‌ها</div>';
  for(const k in PRICES.bushings){
    html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="bushings" data-key="${k}" value="${PRICES.bushings[k]}"></div>`;
  }
  html += '<div class="price-section-title">فلنج‌ها</div>';
  for(const k in PRICES.flanges){
    html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="flanges" data-key="${k}" value="${PRICES.flanges[k]}"></div>`;
  }
  html += '<div class="price-section-title">منهول / هدهول / هندهول</div>';
  for(const k in PRICES.manholes) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="manholes" data-key="${k}" value="${PRICES.manholes[k]}"></div>`;
  for(const k in PRICES.headholes) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="headholes" data-key="${k}" value="${PRICES.headholes[k]}"></div>`;
  for(const k in PRICES.handholes) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="handholes" data-key="${k}" value="${PRICES.handholes[k]}"></div>`;
  html += '<div class="price-section-title">عایق (رول)</div>';
  for(const k in PRICES.insulation) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="insulation" data-key="${k}" value="${PRICES.insulation[k]}"></div>`;
  html += '<div class="price-section-title">کاور (ورق)</div>';
  for(const k in PRICES.covers) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="covers" data-key="${k}" value="${PRICES.covers[k]}"></div>`;
  html += '<div class="price-section-title">دستمزد و مصرفی</div>';
  const others = ['welder_hr','fitter_hr','painter_hr','electrode_kg','paint_epoxy_m2','paint_zinc_m2','consumables_pct','transport_per_kg','dish_markup_pct'];
  const labels = {welder_hr:'جوشکار/ساعت',fitter_hr:'مونتاژکار/ساعت',painter_hr:'رنگ‌کار/ساعت',electrode_kg:'الکترود',paint_epoxy_m2:'اپوکسی/m²',paint_zinc_m2:'زینک/m²',consumables_pct:'مصرفی (٪)',transport_per_kg:'حمل/kg',dish_markup_pct:'کارمزد عدسی (٪)'};
  for(const k of others){
    html += `<div class="price-row"><label>${labels[k]}</label><input type="number" data-cat="_root" data-key="${k}" value="${PRICES[k]}"></div>`;
  }
  c.innerHTML = html;
}

function savePricesLocal(modified){
  document.querySelectorAll('#price-editor input').forEach(inp=>{
    const cat = inp.dataset.cat;
    const key = inp.dataset.key;
    const v = parseFloat(inp.value)||0;
    if(cat==='_root'){ PRICES[key]=v; }
    else if(PRICES[cat]){ PRICES[cat][key]=v; }
  });
  PRICES.version = 'local_' + Date.now();
  try{
    localStorage.setItem('csp_prices', JSON.stringify({version:PRICES.version, modified:!!modified, data:PRICES, savedAt:Date.now()}));
  }catch(e){}
  showStatus('success','✅ ذخیره محلی');
}

function resetPrices(){
  if(!confirm('بازگشت به پیش‌فرض؟')) return;
  localStorage.removeItem('csp_prices');
  PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES));
  renderPriceEditor();
  showStatus('success','↺ بازگشت');
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
  s.innerHTML = `<div class="notice ${t}">${m}</div>`;
  setTimeout(()=>{ s.innerHTML=''; }, 4000);
}

// ============================================================
// کاتالوگ
// ============================================================
function initCatalog(){
  const sel = document.getElementById('cat-category'); if(!sel) return;
  sel.innerHTML = '<option value="">— انتخاب —</option>';
  for(const k in CATALOG.categories){
    const o = document.createElement('option');
    o.value = k;
    o.textContent = CATALOG.categories[k].name;
    sel.appendChild(o);
  }
  document.getElementById('cat-table').innerHTML = '<div class="empty-state">یک دسته انتخاب کنید</div>';
}
function renderCatalog(){
  const k = document.getElementById('cat-category').value;
  const search = (document.getElementById('cat-search').value||'').trim();
  const info = document.getElementById('cat-info'), tbl = document.getElementById('cat-table');
  if(!k){info.innerHTML=''; tbl.innerHTML='<div class="empty-state">یک دسته انتخاب کنید</div>'; return;}
  const cat = CATALOG.categories[k];
  if(!cat){tbl.innerHTML='<div class="empty-state">پیدا نشد</div>'; return;}
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
  info.innerHTML = `<div class="notice info"><strong>${cat.name}</strong> <span class="cat-badge">${rows.length} مدل</span>${mIdx>=0?'<br>🎯 نزدیک‌ترین':''}</div>`;
  let h = '<div class="table-wrap"><table><thead><tr>';
  cat.columns.forEach(c => h += `<th>${c}</th>`);
  h += '<th>عملیات</th></tr></thead><tbody>';
  rows.forEach((r,i)=>{
    const isM = i===mIdx;
    h += `<tr class="${isM?'cat-match':''}">`;
    r.forEach(v => h += `<td>${v!=null?v:'—'}</td>`);
    const dIdx = cat.keys.indexOf('D')>=0 ? cat.keys.indexOf('D') : cat.keys.indexOf('D1');
    const hIdx = cat.keys.indexOf('H1')>=0 ? cat.keys.indexOf('H1') : cat.keys.indexOf('L1')>=0 ? cat.keys.indexOf('L1') : cat.keys.indexOf('H')>=0 ? cat.keys.indexOf('H') : cat.keys.indexOf('L');
    const data = JSON.stringify({model:r[0], D:dIdx>=0?r[dIdx]:'', H:hIdx>=0?r[hIdx]:''}).replace(/"/g,'&quot;');
    h += `<td><button class="cat-use-btn" onclick="useFromCat(this)" data-info="${data}">استفاده</button></td></tr>`;
  });
  h += '</tbody></table></div>';
  tbl.innerHTML = h;
}
function useFromCat(btn){
  try{
    const info = JSON.parse(btn.dataset.info);
    const D = info.D ? (parseFloat(info.D)/10).toFixed(1) : '';
    const H = info.H ? (parseFloat(info.H)/10).toFixed(1) : '';
    ['v-d','d-d','w-d','c-d'].forEach(id=>{if(document.getElementById(id)&&D) document.getElementById(id).value=D;});
    ['v-h','d-h','w-h','c-h'].forEach(id=>{if(document.getElementById(id)&&H) document.getElementById(id).value=H;});
    showStatus('success', `✓ ${info.model}`);
    setTimeout(()=>document.querySelector('[data-tab="t1"]').click(), 300);
  }catch(e){console.warn(e);}
}

// ============================================================
// Firebase Sync
// ============================================================
async function syncFromFirebase(){
  const remote = await loadPricesFromFirebase();
  if(remote){
    PRICES = Object.assign({}, window.EMBEDDED_PRICES, remote);
    renderPriceEditor();
    showStatus('success','✅ دریافت شد');
  } else {
    showStatus('warn','داده‌ای در سرور نیست');
  }
}
async function syncToFirebase(){
  PRICES.version = 'cloud_' + Date.now();
  const ok = await savePricesToFirebase(PRICES);
  showStatus(ok?'success':'danger', ok?'✅ ارسال شد':'❌ خطا');
}

// ============================================================
// کمک‌کننده
// ============================================================
function fmt(n,d=2){if(!isFinite(n)||n==null)return'—'; return Number(n).toLocaleString('fa-IR',{maximumFractionDigits:d});}
function fmtT(n){
  if(!isFinite(n))return'—';
  if(n>=1e9)return fmt(n/1e9,3)+' میلیارد';
  if(n>=1e6)return fmt(n/1e6,2)+' میلیون';
  if(n>=1e3)return fmt(n/1e3,1)+' هزار';
  return fmt(n,0);
}
function val(id){const e=document.getElementById(id);return e?parseFloat(e.value)||0:0;}

// ============================================================
// Bootstrap
// ============================================================
window.addEventListener('load', async () => {
  // Firebase
  if(typeof initFirebase === 'function') await initFirebase();

  // بارگذاری قیمت‌های محلی
  try{
    const s = localStorage.getItem('csp_prices');
    if(s){
      const local = JSON.parse(s);
      PRICES = Object.assign({}, window.EMBEDDED_PRICES, local.data);
    }
  }catch(e){}

  // لوگو
  initLogo();

  // Tabs
  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById(t.dataset.tab).classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });

  // تغییر نوع مخزن
  const vt = document.getElementById('v-type');
  if(vt) vt.addEventListener('change',e=>{
    const b = e.target.value==='box';
    document.getElementById('f-v-l').style.display = b?'block':'none';
    document.getElementById('f-v-w').style.display = b?'block':'none';
    document.getElementById('f-v-h').style.display = b?'none':'block';
  });

  // رندر
  renderPriceEditor();
  initCatalog();
  renderMemory();
  loadEquipment('weight');
  loadEquipment('cost');

  // Firebase real-time
  if(typeof listenToPrices === 'function'){
    listenToPrices((remote)=>{
      if(remote && remote.version !== PRICES.version){
        PRICES = Object.assign({}, window.EMBEDDED_PRICES, remote);
        renderPriceEditor();
      }
    });
  }

  console.log('✅ App ready');
});

function initLogo(){
  const candidates = ['logo.png','Logo.png','logo.jpg','icons/logo.png','icon-192.png'];
  const img = document.getElementById('logo-img');
  const box = document.getElementById('logo-box');
  if(!img || !box) return;
  let i = 0;
  img.onerror = function(){
    i++;
    if(i >= candidates.length){ box.style.display = 'none'; return; }
    img.src = candidates[i];
  };
  img.onload = function(){ box.style.display = 'inline-flex'; };
  img.src = candidates[0];
}
