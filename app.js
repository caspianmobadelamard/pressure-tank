// app.js — منطق کامل برنامه نسخه ۲.۰
let PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES || {}));
let CATALOG = window.EMBEDDED_CATALOG || {categories:{}};

// ============ SVG Icons — نمادهای مهندسی ============
const SVG_ICONS = {
  tank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="10" rx="0.5"/><path d="M2 7 Q6 3 12 3 Q18 3 22 7"/><path d="M2 17 Q6 21 12 21 Q18 21 22 17"/><line x1="8" y1="7" x2="8" y2="17" stroke-dasharray="1 2"/><line x1="16" y1="7" x2="16" y2="17" stroke-dasharray="1 2"/></svg>',
  head: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12 Q12 2 21 12"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="12" x2="3" y2="14"/><line x1="21" y1="12" x2="21" y2="14"/></svg>',
  coil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7 Q9 4 11 7 Q13 10 15 7 Q17 4 19 7"/><path d="M5 12 Q9 9 11 12 Q13 15 15 12 Q17 9 19 12"/><path d="M5 17 Q9 14 11 17 Q13 20 15 17 Q17 14 19 17"/></svg>',
  utube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4 L8 14 Q8 18 12 18 Q16 18 16 14 L16 4"/><circle cx="8" cy="4" r="0.8" fill="currentColor"/><circle cx="16" cy="4" r="0.8" fill="currentColor"/></svg>',
  base: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6 L4 20 L8 20 L8 12 L16 12 L16 20 L20 20 L20 6"/><line x1="4" y1="6" x2="20" y2="6"/></svg>',
  pad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="14" width="20" height="5"/><line x1="4" y1="19" x2="4" y2="21"/><line x1="20" y1="19" x2="20" y2="21"/><line x1="2" y1="16.5" x2="22" y2="16.5" stroke-dasharray="1 2"/></svg>',
  manhole: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="5" r="0.7" fill="currentColor"/><circle cx="12" cy="19" r="0.7" fill="currentColor"/><circle cx="5" cy="12" r="0.7" fill="currentColor"/><circle cx="19" cy="12" r="0.7" fill="currentColor"/></svg>',
  flange: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="5" r="0.6" fill="currentColor"/><circle cx="12" cy="19" r="0.6" fill="currentColor"/><circle cx="5" cy="12" r="0.6" fill="currentColor"/><circle cx="19" cy="12" r="0.6" fill="currentColor"/></svg>',
  valve: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7 L12 12 L6 17 Z"/><path d="M18 7 L12 12 L18 17 Z"/><line x1="12" y1="12" x2="12" y2="4"/><line x1="9" y1="4" x2="15" y2="4"/></svg>',
  cathode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="3" x2="12" y2="21"/><line x1="7" y1="7" x2="17" y2="7"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="19" x2="17" y2="19"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>',
  ladder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="7" y1="3" x2="7" y2="21"/><line x1="17" y1="3" x2="17" y2="21"/><line x1="7" y1="6" x2="17" y2="6"/><line x1="7" y1="10" x2="17" y2="10"/><line x1="7" y1="14" x2="17" y2="14"/><line x1="7" y1="18" x2="17" y2="18"/></svg>',
  resin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="9" r="2"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="14" r="2"/><circle cx="17" cy="13" r="2"/><circle cx="8" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>',
  valve2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="10" width="18" height="4"/><line x1="12" y1="10" x2="12" y2="4"/><circle cx="12" cy="3" r="1.5"/><path d="M6 14 L6 18"/><path d="M18 14 L18 18"/></svg>',
  tower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="3" width="10" height="18" rx="0.5"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>',
  tray: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="2.5"/><circle cx="6" cy="9.2" r="0.6" fill="currentColor"/><circle cx="10" cy="9.2" r="0.6" fill="currentColor"/><circle cx="14" cy="9.2" r="0.6" fill="currentColor"/><circle cx="18" cy="9.2" r="0.6" fill="currentColor"/><rect x="3" y="14" width="18" height="2.5"/><circle cx="6" cy="15.2" r="0.6" fill="currentColor"/><circle cx="10" cy="15.2" r="0.6" fill="currentColor"/><circle cx="14" cy="15.2" r="0.6" fill="currentColor"/><circle cx="18" cy="15.2" r="0.6" fill="currentColor"/></svg>',
  diaphragm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6 Q12 12 4 18"/><path d="M20 6 Q12 12 20 18"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8 L12 3 L21 8 L21 20 L12 20 L3 20 Z"/><path d="M3 8 L12 13 L21 8"/><line x1="12" y1="13" x2="12" y2="20"/></svg>',
  nozzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9 L18 9 L18 15 L6 15 Z"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>'
};

// ============ رنگ‌ها و جنس ============
const MAT_RHO = {'ST37':7850,'S235JR':7850,'A516-70':7850,'Galvanized':7850,'SS304':8000,'SS316':8000};
const MAT_S = {'ST37':13500,'S235JR':15000,'A516-70':20000,'Galvanized':14000,'SS304':16700,'SS316':16700};

// ============ فرمول‌ها ============
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

// ============ تعریف تجهیزات ============
const EQUIPMENT_DEFS = {
  spiral: {
    name: 'منبع اسپیرال',
    svg: 'tank',
    parts: ['shell','head','coil_pipe','manhole','ladder','base','base_pad','cathode']
  },
  u_coil: {
    name: 'منبع کوئلی U شکل',
    svg: 'tank',
    parts: ['shell','head','utube','tube_sheet','manhole','base','base_pad']
  },
  softener: {
    name: 'سختی‌گیر',
    svg: 'tank',
    parts: ['shell','head','resin','control_valve','manhole','ladder','base','base_pad']
  },
  sand_filter: {
    name: 'فیلتر شنی / کربنی',
    svg: 'tank',
    parts: ['shell','head','manhole','ladder','base','base_pad']
  },
  deaerator: {
    name: 'دی‌اریتور',
    svg: 'tower',
    parts: ['shell','head','tower_shell','tower_head','tray','manhole','ladder','base','base_pad']
  },
  expansion_closed: {
    name: 'منبع انبساط بسته',
    svg: 'tank',
    parts: ['shell','head','diaphragm','manhole','base','base_pad']
  },
  expansion_open: {
    name: 'منبع انبساط باز',
    svg: 'box',
    parts: ['box_shell','nozzles','base']
  },
  condensate: {
    name: 'مخزن کندانس',
    svg: 'tank',
    parts: ['shell','head','manhole','base','base_pad']
  }
};

// ============ State ============
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
          fields[f.id] = Array.isArray(f.options[0]) ? f.options[0][0] : f.options[0];
        } else {
          fields[f.id] = f.def;
        }
      });
      EQ_STATE[mode][eq][p] = {on: pd.defOn, fields: fields};
    });
  }
}

// ============ فیلدهای اجزا ============
const PART_DEFS = {
  shell: {
    name: 'پوسته استوانه', icon: 'shell', defOn: true,
    fields: [
      {id:'d', label:'قطر داخلی (cm)', def:160},
      {id:'h', label:'ارتفاع/طول (cm)', def:300},
      {id:'t', label:'ضخامت (mm)', def:6},
      {id:'mat', label:'جنس ورق', type:'select', options:[['ST37','ST37'],['S235JR','S235JR'],['A516-70','A516 Gr70'],['Galvanized','گالوانیزه'],['SS304','استیل ۳۰۴'],['SS316','استیل ۳۱۶']], def:'ST37'}
    ]
  },
  head: {
    name: 'عدسی‌ها', icon: 'head', defOn: true,
    fields: [
      {id:'d', label:'قطر داخلی (mm)', def:1600},
      {id:'h', label:'گودی (mm)', def:240},
      {id:'l', label:'طول لبه (mm)', def:40},
      {id:'t', label:'ضخامت (mm)', def:8},
      {id:'htype', label:'نوع عدسی', type:'select', options:[['shallow','کم‌عمق'],['torisph','تورسفریکال'],['ellip','بیضوی'],['hemi','نیم‌کره']], def:'shallow'},
      {id:'mat', label:'جنس', type:'select', options:[['ST37','ST37'],['S235JR','S235JR'],['A516-70','A516 Gr70'],['Galvanized','گالوانیزه'],['SS304','استیل ۳۰۴']], def:'ST37'},
      {id:'n', label:'تعداد', def:2}
    ]
  },
  coil_pipe: {
    name: 'کویل مارپیچ', icon: 'coil', defOn: true,
    fields: [
      {id:'size', label:'سایز لوله', type:'select', options:[
        ['galv_3_4','گالوانیزه ۳/۴ اینچ'],['galv_1','گالوانیزه ۱ اینچ'],
        ['galv_1_1_4','گالوانیزه ۱ ۱/۴'],['galv_1_1_2','گالوانیزه ۱ ۱/۲'],
        ['galv_2','گالوانیزه ۲ اینچ'],['galv_2_1_2','گالوانیزه ۲ ۱/۲'],
        ['galv_3','گالوانیزه ۳ اینچ'],['galv_4','گالوانیزه ۴ اینچ'],
        ['SS304_3_4','استیل ۳۰۴ ۳/۴'],['SS304_1','استیل ۳۰۴ ۱ اینچ'],
        ['SS304_1_1_4','استیل ۳۰۴ ۱ ۱/۴'],['SS304_1_1_2','استیل ۳۰۴ ۱ ۱/۲'],
        ['SS304_2','استیل ۳۰۴ ۲ اینچ'],['SS304_2_1_2','استیل ۳۰۴ ۲ ۱/۲'],
        ['SS304_3','استیل ۳۰۴ ۳ اینچ'],['SS304_4','استیل ۳۰۴ ۴ اینچ']
      ], def:'SS304_1'},
      {id:'branches', label:'مقدار (شاخه ۶۰۰cm)', def:2.5, hint:'می‌تواند اعشاری باشد: ۲.۵ شاخه = ۱۵۰۰ سانتی‌متر'},
      {id:'thermal', label:'سطح حرارتی (m²)', def:8.5}
    ]
  },
  utube: {
    name: 'کویل U شکل', icon: 'utube', defOn: true,
    fields: [
      {id:'mat', label:'جنس', type:'select', options:[['copper','مس'],['SS304','استیل ۳۰۴'],['SS309','استیل ۳۰۹']], def:'copper'},
      {id:'size', label:'سایز لوله', type:'select', options:[
        ['copper_3_4','مسی ۳/۴'],['copper_1','مسی ۱'],
        ['SS304_3_4','استیل ۳۰۴ ۳/۴'],['SS304_1','استیل ۳۰۴ ۱'],
        ['SS304_1_1_2','استیل ۳۰۴ ۱ ۱/۲'],['SS304_2','استیل ۳۰۴ ۲'],
        ['SS309_3_4','استیل ۳۰۹ ۳/۴'],['SS309_1','استیل ۳۰۹ ۱'],
        ['SS309_1_1_2','استیل ۳۰۹ ۱ ۱/۲'],['SS309_2','استیل ۳۰۹ ۲']
      ], def:'copper_1'},
      {id:'t', label:'ضخامت داخلی لوله (mm)', def:1.5},
      {id:'n', label:'تعداد لوله U', def:4},
      {id:'len', label:'طول هر لوله (cm)', def:600},
      {id:'thermal', label:'سطح حرارتی (m²)', def:5.2}
    ]
  },
  tube_sheet: {
    name: 'صفحه لوله (Tube Sheet)', icon: 'flange', defOn: true,
    fields: [
      {id:'d', label:'قطر صفحه (cm)', def:155},
      {id:'t', label:'ضخامت (mm)', def:20},
      {id:'mat', label:'جنس', type:'select', options:[['ST37','ST37'],['S235JR','S235JR'],['A516-70','A516 Gr70'],['SS304','استیل ۳۰۴']], def:'A516-70'}
    ]
  },
  manhole: {
    name: 'منهول', icon: 'manhole', defOn: true,
    fields: [
      {id:'size', label:'سایز', type:'select', options:[['16','۱۶ اینچ'],['18','۱۸ اینچ'],['20','۲۰ اینچ']], def:'16'},
      {id:'w', label:'عرض (mm)', def:400},
      {id:'h', label:'ارتفاع (mm)', def:500},
      {id:'t', label:'ضخامت (mm)', def:20},
      {id:'n', label:'تعداد', def:1}
    ]
  },
  ladder: {
    name: 'نردبان', icon: 'ladder', defOn: false,
    fields: [
      {id:'pipe', label:'سایز قوطی', type:'select', options:[['pipe_30x30','۳۰×۳۰'],['pipe_40x40','۴۰×۴۰'],['pipe_50x50','۵۰×۵۰']], def:'pipe_40x40'},
      {id:'branches', label:'مقدار مصرف (شاخه ۶۰۰cm)', def:1.5, hint:'مثال: ۱.۵ شاخه = ۹۰۰ سانتی‌متر قوطی'}
    ]
  },
  base: {
    name: 'پایه‌ها', icon: 'base', defOn: true,
    fields: [
      {id:'type', label:'نوع پایه', type:'select', options:[['saddle','زانویی (Saddle)'],['leg','عمودی (Leg)']], def:'saddle'},
      {id:'n', label:'تعداد', def:2},
      {id:'l', label:'طول (cm)', def:120},
      {id:'w', label:'عرض (cm)', def:40},
      {id:'h', label:'ارتفاع (cm)', def:50},
      {id:'t', label:'ضخامت ورق (mm)', def:10}
    ]
  },
  base_pad: {
    name: 'پد پایه', icon: 'pad', defOn: true,
    fields: [
      {id:'n', label:'تعداد', def:2},
      {id:'l', label:'طول (cm)', def:50},
      {id:'w', label:'عرض (cm)', def:30},
      {id:'t', label:'ضخامت (mm)', def:8}
    ]
  },
  cathode: {
    name: 'حفاظت کاتدی', icon: 'cathode', defOn: false,
    fields: [
      {id:'type', label:'نوع آند', type:'select', options:[['zn','آند روی'],['al','آند آلومینیوم'],['mg','آند منیزیم']], def:'zn'},
      {id:'n', label:'تعداد', def:2}
    ]
  },
  resin: {
    name: 'رزین تبادل یونی', icon: 'resin', defOn: true,
    fields: [
      {id:'d', label:'قطر بستر (cm)', def:100},
      {id:'h', label:'ارتفاع بستر (cm)', def:120},
      {id:'fill', label:'ضریب پر شدن', def:0.6}
    ]
  },
  control_valve: {
    name: 'شیر کنترل', icon: 'valve2', defOn: true,
    fields: [
      {id:'type', label:'نوع', type:'select', options:[['auto','اتوماتیک'],['semi','نیمه اتوماتیک'],['manual','دستی']], def:'auto'}
    ]
  },
  tower_shell: {
    name: 'پوسته برج', icon: 'tower', defOn: true,
    fields: [
      {id:'d', label:'قطر برج (cm)', def:80},
      {id:'h', label:'ارتفاع برج (cm)', def:250},
      {id:'t', label:'ضخامت (mm)', def:4},
      {id:'mat', label:'جنس', type:'select', options:[['SS304','استیل ۳۰۴'],['SS316','استیل ۳۱۶']], def:'SS304'}
    ]
  },
  tower_head: {
    name: 'عدسی برج', icon: 'head', defOn: true,
    fields: [
      {id:'d', label:'قطر (mm)', def:800},
      {id:'t', label:'ضخامت (mm)', def:5},
      {id:'mat', label:'جنس', type:'select', options:[['SS304','استیل ۳۰۴'],['SS316','استیل ۳۱۶']], def:'SS304'}
    ]
  },
  tray: {
    name: 'سینی‌های سوراخ‌دار', icon: 'tray', defOn: true,
    fields: [
      {id:'n', label:'تعداد سینی', def:5}
    ]
  },
  diaphragm: {
    name: 'دیافراگم', icon: 'diaphragm', defOn: true,
    fields: [
      {id:'d', label:'قطر (mm)', def:600},
      {id:'type', label:'نوع', type:'select', options:[['butyl','بوتیل'],['epdm','EPDM']], def:'butyl'}
    ]
  },
  box_shell: {
    name: 'بدنه مکعبی', icon: 'box', defOn: true,
    fields: [
      {id:'l', label:'طول (cm)', def:100},
      {id:'w', label:'عرض (cm)', def:100},
      {id:'h', label:'ارتفاع (cm)', def:100},
      {id:'t', label:'ضخامت (mm)', def:4},
      {id:'mat', label:'جنس', type:'select', options:[['ST37','ST37'],['S235JR','S235JR'],['Galvanized','گالوانیزه']], def:'ST37'}
    ]
  },
  nozzles: {
    name: 'نازل‌های ورودی/خروجی', icon: 'nozzle', defOn: true,
    fields: [
      {id:'size', label:'سایز نازل', type:'select', options:[['1','۱ اینچ'],['1_1_4','۱ ۱/۴'],['1_1_2','۱ ۱/۲'],['2','۲ اینچ'],['3','۳ اینچ'],['4','۴ اینچ']], def:'2'},
      {id:'n', label:'تعداد', def:4}
    ]
  }
};

// ============ محاسبه وزن جزء ============
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
      const branches = f.branches||0; // شاخه ۶۰۰ سانتی‌متر
      const lenM = branches * 6; // متر
      const wkg = (PRICES.pipeWeights||{})[f.size] || 2;
      return lenM * wkg;
    }
    case 'utube': {
      const lenM = (f.len||0)/100; // cm به متر
      const wkg = (PRICES.pipeWeights||{})[f.size] || 2;
      return lenM * wkg * (f.n||1);
    }
    case 'tube_sheet': {
      const D=f.d/100, t=f.t/1000;
      return Math.PI/4*D*D*t*MAT_RHO[f.mat||'ST37'];
    }
    case 'base': {
      const l=f.l/100, w=f.w/100, h=f.h/100, t=f.t/1000;
      const one = l*w*h*(t/1000)*MAT_RHO['ST37'];
      return one * (f.n||2) * 100; // تقریب
    }
    case 'base_pad': {
      const l=f.l/100, w=f.w/100, t=f.t/1000;
      const one = l*w*t*MAT_RHO['ST37'];
      return one * (f.n||2) * 100;
    }
    case 'manhole': {
      // وزن بر اساس سایز + ابعاد
      const vol = (f.w/1000)*(f.h/1000)*(f.t/1000);
      const base = vol*MAT_RHO['A516-70'];
      const extra = f.size==='16'?80:f.size==='18'?100:120;
      return (base + extra) * (f.n||1);
    }
    case 'ladder': {
      const branches = f.branches||0;
      const lenM = branches * 6;
      const wkg = (PRICES.equipmentParts?.ladder?.weight_per_m)||15;
      return lenM * wkg;
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
    case 'resin': {
      const D=f.d/100, H=f.h/100;
      const V = Math.PI/4*D*D*H;
      return V*750*(f.fill||0.6);
    }
    case 'diaphragm': {
      const D=f.d;
      const A = Math.PI/4*Math.pow(D/1000,2);
      return A * (f.type==='butyl'?2.5:3.5);
    }
    case 'cathode': return (f.n||1)*5;
    case 'control_valve': return 15;
    case 'tray': return (f.n||5)*25;
    case 'nozzles': return (f.n||4)*3;
    return 0;
  }
}

// ============ محاسبه قیمت جزء ============
function partCost(part, f){
  const P = PRICES;
  switch(part){
    case 'shell': {
      const w = partWeight('shell',f);
      const price = findSheetPrice(f.mat||'ST37', f.t);
      return w*price*1.15;
    }
    case 'head': {
      const w = partWeight('head',f);
      const price = findSheetPrice(f.mat||'ST37', f.t);
      return w*price*1.35;
    }
    case 'coil_pipe': {
      const branches = f.branches||0;
      const pricePerBranch = (P.pipes||{})[f.size] || 0;
      return branches * pricePerBranch;
    }
    case 'utube': {
      const branches = (f.len||0)/100 / 6; // تبدیل cm به شاخه
      const pricePerBranch = (P.pipes||{})[f.size] || 0;
      return branches * pricePerBranch * (f.n||1);
    }
    case 'tube_sheet': {
      const w = partWeight('tube_sheet',f);
      const price = findSheetPrice(f.mat||'ST37', f.t||10);
      return w * price * 1.3;
    }
    case 'base': {
      const w = partWeight('base',f);
      return w * 55000;
    }
    case 'base_pad': {
      const w = partWeight('base_pad',f);
      return w * 55000;
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
    case 'resin': {
      const w = partWeight('resin',f);
      return w * ((P.equipmentParts?.softener?.resin_kg)||180000);
    }
    case 'diaphragm': {
      return f.type==='butyl'?(P.equipmentParts?.expansion?.diaphragm_butyl):
             f.type==='epdm'?(P.equipmentParts?.expansion?.diaphragm_epdm):3200000;
    }
    case 'cathode': {
      const price = f.type==='zn'?(P.equipmentParts?.cathodic?.anode_zn):
                    f.type==='al'?(P.equipmentParts?.cathodic?.anode_al):
                    (P.equipmentParts?.cathodic?.anode_mg);
      return price*(f.n||1);
    }
    case 'control_valve': {
      if(f.type==='auto') return (P.equipmentParts?.softener?.control_valve_auto)||12000000;
      if(f.type==='semi') return (P.equipmentParts?.softener?.control_valve_semi)||7500000;
      return (P.equipmentParts?.softener?.control_valve_manual)||3500000;
    }
    case 'tray': {
      return (f.n||5) * 1800000;
    }
    case 'nozzles': {
      const fp = P.flanges||{};
      const map = {'1':'flange_1','1_1_4':'flange_1_1_4','1_1_2':'flange_1_1_2','2':'flange_2','3':'flange_3','4':'flange_4'};
      const price = fp[map[f.size]] || 780000;
      return (f.n||4) * price;
    }
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

// ============ بارگذاری تجهیز ============
function loadEquipment(mode){
  initEqState(mode);
  const eq = document.getElementById(mode==='weight'?'w-eq':'c-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  if(!def) return;
  const container = document.getElementById(mode==='weight'?'w-components':'c-components');
  const headerEl = document.getElementById(mode==='weight'?'w-eq-header':'c-eq-header');

  headerEl.innerHTML = `<div class="eq-header">
    <div class="eq-icon">${SVG_ICONS[def.svg]||SVG_ICONS.tank}</div>
    <div class="eq-info">
      <h3>${def.name}</h3>
      <p>${def.parts.length} جزء قابل تنظیم</p>
      <span class="eq-badge" id="badge-count-${mode}">فعال</span>
    </div>
  </div>`;

  let html = '';
  def.parts.forEach(pid=>{
    const pd = PART_DEFS[pid];
    if(!pd) return;
    const st = EQ_STATE[mode][eq][pid];
    html += `<div class="comp ${st.on?'on':''}" data-mode="${mode}" data-eq="${eq}" data-pid="${pid}">
      <div class="comp-head" onclick="toggleComp('${mode}','${eq}','${pid}')">
        <div class="comp-icon">${SVG_ICONS[pd.icon]||SVG_ICONS.tank}</div>
        <span class="comp-title">${pd.name}</span>
        <span class="comp-badge" id="badge-${mode}-${pid}"></span>
        <div class="comp-toggle"></div>
      </div>
      <div class="comp-body">
        ${renderFields(mode, eq, pid, pd, st)}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function renderFields(mode, eq, pid, pd, st){
  const fields = pd.fields||[];
  if(fields.length === 0) return '<div class="hint">بدون پارامتر</div>';
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
        ${f.hint?`<span class="fld-hint">${f.hint}</span>`:''}
      </div>`;
    } else {
      html += `<div class="fld"><label>${f.label}</label>
        <input type="number" step="any" value="${v}" oninput="updateField('${mode}','${eq}','${pid}','${f.id}',parseFloat(this.value)||0)">
        ${f.hint?`<span class="fld-hint">${f.hint}</span>`:''}
      </div>`;
    }
  });
  html += '</div>';
  return html;
}

function toggleComp(mode, eq, pid){
  const st = EQ_STATE[mode][eq][pid];
  st.on = !st.on;
  const card = document.querySelector(`.comp[data-mode="${mode}"][data-pid="${pid}"]`);
  if(card){
    card.classList.toggle('on', st.on);
  }
  document.getElementById(mode==='weight'?'w-result':'c-result').innerHTML = '';
}

function updateField(mode, eq, pid, fid, value){
  EQ_STATE[mode][eq][pid].fields[fid] = value;
  document.getElementById(mode==='weight'?'w-result':'c-result').innerHTML = '';
}

// ============ محاسبه وزن ============
function calcWeight(){
  const eq = document.getElementById('w-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  const state = EQ_STATE.weight[eq];
  const out = document.getElementById('w-result');
  if(!def) return;

  let total = 0;
  const details = [];
  def.parts.forEach(pid=>{
    const st = state[pid];
    if(!st || !st.on) return;
    const pd = PART_DEFS[pid];
    if(!pd) return;
    const w = partWeight(pid, st.fields);
    total += w;
    details.push({name: pd.name, w: w});
    const badge = document.getElementById(`badge-weight-${pid}`);
    if(badge) badge.textContent = fmt(w,1)+' kg';
  });

  const extras = total * 0.08;
  const grandTotal = total + extras;
  const volume = estimateVolume(eq, state);

  let html = `<div class="res-summary">
    <div class="lbl">وزن خالی کل</div>
    <div class="val">${fmt(grandTotal,1)}</div>
    <div class="unit">کیلوگرم (${fmt(grandTotal/1000,3)} تن)</div>
  </div>
  <div class="result-preview">`;
  details.forEach(d=>{
    html += `<div class="res-row"><span class="lbl">${d.name}</span><span class="val">${fmt(d.w,1)} kg</span></div>`;
  });
  html += `<div class="res-row"><span class="lbl">جوش، رنگ، متعلقات (۸٪)</span><span class="val">${fmt(extras,1)} kg</span></div>`;
  if(volume > 0){
    html += `<div class="res-row" style="border-top:1px dashed var(--neon-soft);padding-top:12px;margin-top:8px">
      <span class="lbl" style="color:var(--text);font-weight:700">حجم آب داخل</span>
      <span class="val">${fmt(volume,0)} L</span></div>`;
    html += `<div class="res-row">
      <span class="lbl" style="color:var(--text);font-weight:700">وزن پر از آب</span>
      <span class="val" style="font-size:15px">${fmt(grandTotal + volume,0)} kg</span></div>`;
  }
  html += `</div>`;
  out.innerHTML = html;
}

function estimateVolume(eq, state){
  if(state.shell && state.shell.on){
    const f = state.shell.fields;
    if(f.d>0 && f.h>0) return totalVol(f.d, f.h, 'torisph');
  }
  if(state.box_shell && state.box_shell.on){
    const f = state.box_shell.fields;
    return f.l*f.w*f.h/1000;
  }
  return 0;
}

// ============ محاسبه قیمت ============
function calcCost(){
  const eq = document.getElementById('c-eq').value;
  const def = EQUIPMENT_DEFS[eq];
  const state = EQ_STATE.cost[eq];
  const out = document.getElementById('c-result');
  const pp = parseFloat(document.getElementById('c-profit').value)||25;
  if(!def) return;

  let total = 0;
  const details = [];
  def.parts.forEach(pid=>{
    const st = state[pid];
    if(!st || !st.on) return;
    const pd = PART_DEFS[pid];
    if(!pd) return;
    const c = partCost(pid, st.fields);
    const w = partWeight(pid, st.fields);
    total += c;
    details.push({name: pd.name, c: c, w: w});
    const badge = document.getElementById(`badge-cost-${pid}`);
    if(badge) badge.textContent = fmtT(c);
  });

  const totalWeight = details.reduce((s,d)=>s+d.w, 0);
  const weldHours = totalWeight / 20;
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

  let html = `<div class="res-summary">
    <div class="lbl">قیمت نهایی</div>
    <div class="val">${fmtT(final)}</div>
    <div class="unit">تومان</div>
  </div>
  <div class="result-preview">`;
  details.forEach(d=>{
    html += `<div class="res-row"><span class="lbl">${d.name}</span><span class="val">${fmtT(d.c)}</span></div>`;
  });
  html += `<div class="divider"></div>`;
  html += `<div class="res-row"><span class="lbl">جوشکاری (${fmt(weldHours,1)} hr)</span><span class="val">${fmtT(weldCost)}</span></div>`;
  html += `<div class="res-row"><span class="lbl">مونتاژ</span><span class="val">${fmtT(fitterCost)}</span></div>`;
  html += `<div class="res-row"><span class="lbl">الکترود</span><span class="val">${fmtT(electrode)}</span></div>`;
  html += `<div class="res-row"><span class="lbl">رنگ</span><span class="val">${fmtT(paintCost)}</span></div>`;
  html += `<div class="res-row"><span class="lbl">مصرفی (${PRICES.consumables_pct}٪)</span><span class="val">${fmtT(consumables)}</span></div>`;
  html += `<div class="res-row"><span class="lbl">حمل</span><span class="val">${fmtT(transport)}</span></div>`;
  html += `<div class="divider"></div>`;
  html += `<div class="res-row"><span class="lbl" style="color:var(--text);font-weight:700">جمع هزینه</span><span class="val">${fmtT(beforeProfit)}</span></div>`;
  html += `<div class="res-row"><span class="lbl">سود (${pp}٪)</span><span class="val">${fmtT(beforeProfit*pp/100)}</span></div>`;
  html += `<div class="res-row" style="border-top:2px solid var(--neon);padding-top:12px;margin-top:8px">
    <span class="lbl" style="color:var(--neon);font-weight:800">💰 قیمت نهایی</span>
    <span class="val" style="font-size:18px">${fmtT(final)}</span></div>`;
  html += `</div>`;

  // دکمه PDF
  html += `<div class="actions" style="margin-top:14px">
    <button class="btn btn-main" onclick="exportPDF('cost')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4 L18 4 L18 20 L6 20 Z"/><line x1="10" y1="4" x2="10" y2="20"/></svg>
      📄 دانلود PDF
    </button>
  </div>`;

  out.innerHTML = html;
}

// ============ Export PDF ============
function exportPDF(type){
  const eqId = type==='weight'?'w-eq':'c-eq';
  const resId = type==='weight'?'w-result':'c-result';
  const eq = document.getElementById(eqId).value;
  const def = EQUIPMENT_DEFS[eq];
  const resEl = document.getElementById(resId);
  if(!def || !resEl.innerHTML) { alert('ابتدا محاسبه را انجام دهید'); return; }

  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl"><head><meta charset="UTF-8">
    <title>گزارش ${def.name}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Tahoma', sans-serif; direction: rtl; color: #000; }
      .header { text-align: center; padding-bottom: 15px; border-bottom: 2px solid #00a86b; margin-bottom: 20px; }
      .header h1 { color: #00a86b; margin: 0; font-size: 20px; }
      .header p { color: #666; font-size: 11px; margin: 5px 0 0 0; }
      .equip { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; text-align: right; font-size: 13px; }
      th { background: #f0f7f3; color: #006644; font-weight: 700; }
      .summary { background: #e8f7ef; border: 2px solid #00a86b; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px; }
      .summary .val { font-size: 24px; font-weight: 800; color: #006644; }
      .summary .lbl { font-size: 11px; color: #666; }
      .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #888; text-align: center; }
      .info { font-size: 11px; color: #666; margin-bottom: 10px; }
    </style></head><body>
    <div class="header">
      <h1>کاسپین مبدل آمارد</h1>
      <p>Caspian Mobadel Amard — محاسبه‌گر مخازن</p>
    </div>
    <div class="info">
      <strong>نوع محاسبه:</strong> ${type==='weight'?'وزن‌دهی':'قیمت‌گذاری'}<br>
      <strong>تجهیز:</strong> ${def.name}<br>
      <strong>تاریخ:</strong> ${new Date().toLocaleDateString('fa-IR')}
    </div>
    <div class="equip">${def.name}</div>
    ${resEl.innerHTML.replace(/class="res-summary"/g, 'class="summary"')}
    <div class="footer">
      این گزارش به صورت خودکار توسط محاسبه‌گر مخازن کاسپین مبدل آمارد تولید شده است.<br>
      محاسبات پیش‌طراحی است؛ برای ساخت نهایی، نقشه مهندسی الزامی است.
    </div>
    </body></html>
  `);
  win.document.close();
  setTimeout(()=>win.print(), 500);
}

// ============ تب‌های ساده ============
function calcVol(){
  const t = document.getElementById('v-type').value;
  const out = document.getElementById('v-res');
  if(t==='box'){
    const W=val('v-d'), L=val('v-l'), H=val('v-w');
    if(!(W>0&&L>0&&H>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">همه ابعاد</span></div></div>'; return; }
    const V=W*L*H/1000;
    out.innerHTML = `<div class="result"><div class="item big"><span class="lbl">حجم</span><span class="val">${fmt(V)} L</span></div><div class="item"><span class="lbl">سطح</span><span class="val">${fmt(2*(W*L+W*H+L*H)/10000,2)} m²</span></div></div>`;
    return;
  }
  const D=val('v-d'), H=val('v-h');
  if(!(D>0&&H>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">قطر و ارتفاع</span></div></div>'; return; }
  const head = t==='cyl-dish'?'torisph':'flat';
  const vB = cylVol(D,H), vH = head==='torisph'?2*dishVT(D):0;
  const V = vB+vH;
  out.innerHTML = `<div class="result">
    <div class="item"><span class="lbl">حجم بدنه</span><span class="val">${fmt(vB)} L</span></div>
    <div class="item"><span class="lbl">حجم عدسی‌ها</span><span class="val">${fmt(vH)} L</span></div>
    <div class="item big"><span class="lbl">حجم کل</span><span class="val">${fmt(V)} L</span></div>
  </div>`;
}

function calcDim(){
  const V=val('d-v'), D=val('d-d')||0, H=val('d-h')||0;
  const head = document.getElementById('d-type').value==='cyl-dish'?'torisph':'flat';
  const out = document.getElementById('d-res');
  if(!(V>0)) return;
  let html = '<div class="result">';
  if(D>0){ const Hc = hFromV(V,D,head); html += `<div class="item big"><span class="lbl">ارتفاع</span><span class="val">${fmt(Hc,1)} cm</span></div>`; }
  else if(H>0){ const Dc = diamFromV(V,H,head); html += `<div class="item big"><span class="lbl">قطر</span><span class="val">${fmt(Dc,1)} cm</span></div>`; }
  else {
    let best=null;
    for(let n=1;n<=10;n++){
      const Hf=n*150, Df=diamFromV(V,Hf,head);
      const C=Math.PI*Df, m=Math.ceil(C/600), waste=n*(m*600-C);
      const pct=waste/(n*m*600)*100;
      if(!best||pct<best.pct) best={n,H:Hf,D:Df,pct};
    }
    html += `<div class="item big"><span class="lbl">ارتفاع</span><span class="val">${fmt(best.H,0)} cm</span></div>`;
    html += `<div class="item big"><span class="lbl">قطر</span><span class="val">${fmt(best.D,1)} cm</span></div>`;
  }
  out.innerHTML = html+'</div>';
}

function optSheets(){
  const V=val('s-v'), wSel=document.getElementById('s-w').value, L=val('s-l')||600, maxN=parseInt(document.getElementById('s-max').value)||10;
  const out=document.getElementById('s-res');
  if(!(V>0)) return;
  const widths = wSel==='both'?[150,152]:[parseFloat(wSel)];
  const rows=[];
  for(const w of widths) for(let n=1;n<=maxN;n++){
    const H=n*w, D=diamFromV(V,H,'torisph'), C=Math.PI*D;
    const m=Math.ceil(C/L), sheets=n*m, waste=n*(m*L-C), pct=waste/(sheets*L)*100;
    rows.push({w,n,H,D,C,m,sheets,waste,pct});
  }
  rows.sort((a,b)=>Math.abs(a.pct-b.pct)>0.01?a.pct-b.pct:a.sheets-b.sheets);
  let html = '<div class="table-wrap"><table><thead><tr><th>عرض</th><th>کورس</th><th>ارتفاع</th><th>قطر</th><th>ورق</th><th>کل</th><th>پرت٪</th></tr></thead><tbody>';
  rows.slice(0,15).forEach(r=>{
    html += `<tr><td>${r.w}</td><td>${r.n}</td><td>${fmt(r.H,0)}</td><td>${fmt(r.D,1)}</td><td>${r.m}</td><td>${r.sheets}</td><td>${fmt(r.pct,1)}</td></tr>`;
  });
  html += '</tbody></table></div>';
  out.innerHTML = html;
}

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
  if(!(D>0 && h>0)) return;
  const res = calcBlank(D,h,L,t,type);
  const price = findSheetPrice(mat, t);
  const cost = res.W * price * 1.35;
  out.innerHTML = `<div class="result">
    <div class="item big"><span class="lbl">قطر گسترده</span><span class="val">${fmt(res.Db,1)} mm</span></div>
    <div class="item big"><span class="lbl">سطح گسترده</span><span class="val">${fmt(res.A,3)} m²</span></div>
    <div class="item big"><span class="lbl">وزن عدسی</span><span class="val">${fmt(res.W,1)} kg</span></div>
    <div class="item"><span class="lbl">هزینه ساخت</span><span class="val">${fmtT(cost)}</span></div>
  </div>`;
}

function saveHeadCalc(){
  const D = val('h-d'), h = val('h-h'), L = val('h-l')||0, t = val('h-t')||6;
  const type = document.getElementById('h-type').value;
  if(!(D>0 && h>0)) return;
  const res = calcBlank(D,h,L,t,type);
  const name = prompt('نام:', 'عدسی '+D+'mm');
  if(!name) return;
  if(saveCalculation('head', name, {D,h,L,t,type}, res)){
    renderMemory();
  }
}

// ============ حافظه ============
function saveCalculation(type, name, inputs, outputs){
  try{
    let list = JSON.parse(localStorage.getItem('csp_calcs') || '[]');
    list.unshift({id:'c_'+Date.now(), type, name, date: new Date().toLocaleDateString('fa-IR'), inputs, outputs});
    if(list.length > 100) list = list.slice(0,100);
    localStorage.setItem('csp_calcs', JSON.stringify(list));
    return true;
  }catch(e){ return false; }
}
function loadCalculations(){
  try{ return JSON.parse(localStorage.getItem('csp_calcs')||'[]'); }catch(e){ return []; }
}
function renderMemory(){
  const list = loadCalculations();
  const el = document.getElementById('mem-list');
  if(!list.length){ el.innerHTML='<div class="empty-state">محاسبه‌ای ذخیره نشده</div>'; return; }
  let html = '';
  list.forEach(c=>{
    html += `<div class="save-row">
      <div class="info"><b>${c.name}</b><br>${c.type} — ${c.date}</div>
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
    document.querySelector('[data-tab="t6"]').click();
    calcBlank();
  }
}
function delCalc(id){
  if(!confirm('حذف؟')) return;
  let list = loadCalculations().filter(c=>c.id!==id);
  localStorage.setItem('csp_calcs', JSON.stringify(list));
  renderMemory();
}
function clearMemory(){
  if(!confirm('همه پاک شوند؟')) return;
  localStorage.removeItem('csp_calcs');
  renderMemory();
}
function exportMemory(){
  const list = loadCalculations();
  let csv = 'نام,نوع,تاریخ\n';
  list.forEach(c=>{ csv += `"${c.name}","${c.type}","${c.date}"\n`; });
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'calculations.csv';
  a.click();
}

// ============ قیمت‌ها ============
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
  html += '<div class="price-section-title">بوشن</div>';
  for(const k in PRICES.bushings) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="bushings" data-key="${k}" value="${PRICES.bushings[k]}"></div>`;
  html += '<div class="price-section-title">فلنج</div>';
  for(const k in PRICES.flanges) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="flanges" data-key="${k}" value="${PRICES.flanges[k]}"></div>`;
  html += '<div class="price-section-title">منهول/هدهول/هندهول</div>';
  for(const k in PRICES.manholes) html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="manholes" data-key="${k}" value="${PRICES.manholes[k]}"></div>`;
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
  try{ localStorage.setItem('csp_prices', JSON.stringify({version:PRICES.version, modified:!!modified, data:PRICES})); }catch(e){}
  showStatus('success','✅ ذخیره شد');
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

// ============ کاتالوگ ============
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
  if(!k){tbl.innerHTML='<div class="empty-state">یک دسته انتخاب کنید</div>'; return;}
  const cat = CATALOG.categories[k];
  if(!cat) return;
  let rows = cat.rows;
  if(search){
    const s = search.toLowerCase();
    rows = rows.filter(r => r.some(v => String(v).toLowerCase().includes(s)));
  }
  let h = '<div class="table-wrap"><table><thead><tr>';
  cat.columns.forEach(c => h += `<th>${c}</th>`);
  h += '<th>عملیات</th></tr></thead><tbody>';
  rows.forEach((r)=>{
    h += `<tr>`;
    r.forEach(v => h += `<td>${v!=null?v:'—'}</td>`);
    const data = JSON.stringify({model:r[0], D:r[3]||'', H:r[4]||''}).replace(/"/g,'&quot;');
    h += `<td><button class="cat-use-btn" onclick="useFromCat(this)" data-info="${data}">استفاده</button></td></tr>`;
  });
  h += '</tbody></table></div>';
  tbl.innerHTML = h;
  info.innerHTML = `<div class="notice info"><strong>${cat.name}</strong> <span class="cat-badge">${rows.length} مدل</span></div>`;
}
function useFromCat(btn){
  try{
    const info = JSON.parse(btn.dataset.info);
    const D = info.D ? (parseFloat(info.D)/10).toFixed(1) : '';
    const H = info.H ? (parseFloat(info.H)/10).toFixed(1) : '';
    ['v-d','d-d'].forEach(id=>{if(document.getElementById(id)&&D) document.getElementById(id).value=D;});
    ['v-h','d-h'].forEach(id=>{if(document.getElementById(id)&&H) document.getElementById(id).value=H;});
    showStatus('success', `✓ ${info.model}`);
  }catch(e){}
}

// ============ Firebase ============
async function syncFromFirebase(){
  if(typeof loadPricesFromFirebase !== 'function') return;
  const remote = await loadPricesFromFirebase();
  if(remote){
    PRICES = Object.assign({}, window.EMBEDDED_PRICES, remote);
    renderPriceEditor();
    showStatus('success','✅ دریافت شد');
  }
}
async function syncToFirebase(){
  if(typeof savePricesToFirebase !== 'function') return;
  PRICES.version = 'cloud_' + Date.now();
  const ok = await savePricesToFirebase(PRICES);
  showStatus(ok?'success':'danger', ok?'✅ ارسال شد':'❌ خطا');
}

// ============ کمک‌کننده ============
function fmt(n,d=2){if(!isFinite(n)||n==null)return'—'; return Number(n).toLocaleString('fa-IR',{maximumFractionDigits:d});}
function fmtT(n){
  if(!isFinite(n))return'—';
  if(n>=1e9)return fmt(n/1e9,3)+' میلیارد';
  if(n>=1e6)return fmt(n/1e6,2)+' میلیون';
  if(n>=1e3)return fmt(n/1e3,1)+' هزار';
  return fmt(n,0);
}
function val(id){const e=document.getElementById(id);return e?parseFloat(e.value)||0:0;}

// ============ Bootstrap ============
window.addEventListener('load', async () => {
  if(typeof initFirebase === 'function') await initFirebase();

  try{
    const s = localStorage.getItem('csp_prices');
    if(s){ PRICES = Object.assign({}, window.EMBEDDED_PRICES, JSON.parse(s).data); }
  }catch(e){}

  initLogo();

  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById(t.dataset.tab).classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });

  const vt = document.getElementById('v-type');
  if(vt) vt.addEventListener('change',e=>{
    const b = e.target.value==='box';
    document.getElementById('f-v-l').style.display = b?'block':'none';
    document.getElementById('f-v-w').style.display = b?'block':'none';
    document.getElementById('f-v-h').style.display = b?'none':'block';
  });

  renderPriceEditor();
  initCatalog();
  renderMemory();
  loadEquipment('weight');
  loadEquipment('cost');

  console.log('✅ App ready v2.0');
});

function initLogo(){
  const candidates = ['logo.png','Logo.png','logo.jpg','icons/logo.png'];
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
