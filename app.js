// app.js — منطق کامل برنامه

// ============ متغیرهای سراسری ============
let PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES || {}));
let CATALOG = window.EMBEDDED_CATALOG || {categories:{}};
let USER_MODIFIED = false;
let CURRENT_EQUIPMENT = 'simple_tank';
let COMPONENT_STATE = {};  // وضعیت اجزای فعلی

// ============ Firebase ============
async function syncFromFirebase(){
  const remote = await loadPricesFromFirebase();
  if(remote){
    PRICES = Object.assign({}, window.EMBEDDED_PRICES, remote);
    savePricesLocal(false);
    renderPriceEditor();
    showStatus('success', '✅ قیمت‌ها از سرور دریافت شد.');
  } else {
    showStatus('warn', '⚠️ سرور پاسخ نداد یا داده‌ای نیست.');
  }
}
async function syncToFirebase(){
  PRICES.version = 'v' + Date.now();
  const ok = await savePricesToFirebase(PRICES);
  if(ok) showStatus('success', '✅ قیمت‌ها به سرور ارسال شد.');
  else showStatus('danger', '❌ ارسال ناموفق.');
}

// ============ ذخیره محلی قیمت ============
function savePricesLocal(modified){
  document.querySelectorAll('#price-editor input').forEach(inp => {
    const cat = inp.dataset.cat;
    const key = inp.dataset.key;
    const v = parseFloat(inp.value)||0;
    if(cat==='_root') PRICES[key]=v;
    else if(PRICES[cat]) PRICES[cat][key]=v;
  });
  try{
    localStorage.setItem('csp_prices', JSON.stringify({
      version: PRICES.version,
      modified: !!modified,
      data: PRICES
    }));
  }catch(e){}
  showStatus('success','✅ ذخیره محلی شد');
}
function loadPricesLocal(){
  try{
    const s = localStorage.getItem('csp_prices');
    if(s){
      const local = JSON.parse(s);
      PRICES = Object.assign({}, window.EMBEDDED_PRICES, local.data);
    }
  }catch(e){}
}

// ============ فرمول‌های پایه ============
const cylVol = (D,H) => Math.PI/4*D*D*H/1000;
const dishVT = D => 0.0809*Math.pow(D,3)/1000;
const dishAT = D => 1.084*Math.PI/4*D*D;

function totalVol(D,H,head){
  let v = cylVol(D,H);
  if(head==='torisph'||head==='shallow') v += 2*dishVT(D);
  return v;
}
function diamFromV(V,H){
  let lo=10, hi=1000;
  for(let i=0;i<80;i++){
    const m=(lo+hi)/2;
    const f = (Math.PI*H/4)*m*m + 2*0.0809/1000*Math.pow(m,3) - V*1000;
    if(f>0) hi=m; else lo=m;
  }
  return (lo+hi)/2;
}
function hFromV(V,D){
  let vh = 2*dishVT(D);
  const vc = V-vh;
  if(vc<=0) return 0;
  return vc*1000/(Math.PI/4*D*D);
}

// ============ سطح گسترده عدسی ============
function calcBlankCalc(D, h, L, t, type){
  let D_blank;
  if(type === 'shallow'){
    D_blank = Math.sqrt(D*D + 4*D*h) + 2*L;
  } else if(type === 'torisph'){
    D_blank = Math.sqrt(D*D + 4*D*h) + 2*L;
  } else if(type === 'ellip'){
    D_blank = Math.sqrt(D*D + 4*h*h) + 2*L;
  } else {
    D_blank = Math.sqrt(D*D + 4*D*h) + 2*L;
  }
  const A = Math.PI/4 * Math.pow(D_blank/1000, 2);
  const W = A * (t/1000) * 7850;
  return { D_blank, A, W };
}

function applyHeadPreset(){
  const sel = document.getElementById('h-type');
  const dInp = document.getElementById('h-d');
  if(!sel || !dInp) return;
  const type = sel.value;
  const D = parseFloat(dInp.value) || 0;
  if(!D || type==='custom') return;
  const hInp = document.getElementById('h-h');
  if(!hInp) return;
  if(type==='shallow') hInp.value = Math.round(D/15);
  else if(type==='torisph') hInp.value = Math.round(D*0.194);
  else if(type==='ellip') hInp.value = Math.round(D*0.25);
}

function calcBlank(){
  const D = val('h-d'), h = val('h-h'), L = val('h-l')||0, t = val('h-t')||6;
  const type = document.getElementById('h-type').value;
  const out = document.getElementById('h-res');
  if(!(D>0 && h>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">قطر و گودی را وارد کنید</span></div></div>'; return; }
  const res = calcBlankCalc(D, h, L, t, type);
  out.innerHTML = `<div class="result">
    <div class="item big"><span class="lbl">قطر گسترده:</span><span class="val">${fmt(res.D_blank,1)} mm</span></div>
    <div class="item big"><span class="lbl">سطح گسترده:</span><span class="val">${fmt(res.A,3)} m²</span></div>
    <div class="item big"><span class="lbl">وزن عدسی:</span><span class="val">${fmt(res.W,1)} kg</span></div>
  </div>`;
}

// ============ تعریف اجزا ============
const SHEET_OPTS = ['ST37','S235JR','A516-70','Galvanized','SS304','SS316'];
const SHEET_LABELS = {'ST37':'ST37','S235JR':'S235JR','A516-70':'A516 Gr70','Galvanized':'گالوانیزه','SS304':'SS304','SS316':'SS316'};

const PIPE_OPTS = ['galv','seamless40','seamless80','firetube','SS304','SS309'];
const PIPE_LABELS = {'galv':'گالوانیزه','seamless40':'مانیسمان رده 40','seamless80':'مانیسمان رده 80','firetube':'آتشخوار','SS304':'استیل 304','SS309':'استیل 309'};

const PIPE_SIZES = ['1_2','3_4','1','1_1_4','1_1_2','2','2_1_2','3','4'];
const PIPE_SIZE_LABELS = {'1_2':'1/2"','3_4':'3/4"','1':'1"','1_1_4':'1 1/4"','1_1_2':'1 1/2"','2':'2"','2_1_2':'2 1/2"','3':'3"','4':'4"'};

// تعریف اجزا با فیلدها و توابع وزن/قیمت
const COMPONENTS = {
  // ===== بدنه استوانه =====
  shell: {
    label: 'بدنه استوانه',
    icon: '🛢',
    fields: [
      {id:'D', label:'قطر (mm)', def:750, type:'number'},
      {id:'H', label:'ارتفاع (mm)', def:1500, type:'number'},
      {id:'t', label:'ضخامت (mm)', def:6, type:'number'},
      {id:'mat', label:'جنس', type:'select', opts:SHEET_OPTS, labels:SHEET_LABELS}
    ],
    weight: v => Math.PI*(v.D/1000)*(v.H/1000)*(v.t/1000)*7850,
    price: (v, p) => {
      const w = Math.PI*(v.D/1000)*(v.H/1000)*(v.t/1000)*7850;
      const pk = findSheetPrice(v.mat, v.t);
      return w * pk * 1.15;  // 15% ضایعات
    }
  },

  // ===== عدسی‌ها =====
  heads: {
    label: 'عدسی‌ها',
    icon: '🥣',
    fields: [
      {id:'D', label:'قطر داخلی (mm)', def:750, type:'number'},
      {id:'h', label:'گودی (mm)', def:50, type:'number'},
      {id:'L', label:'لبه (mm)', def:40, type:'number'},
      {id:'t', label:'ضخامت (mm)', def:6, type:'number'},
      {id:'count', label:'تعداد', def:2, type:'number'},
      {id:'mat', label:'جنس', type:'select', opts:SHEET_OPTS, labels:SHEET_LABELS}
    ],
    weight: v => {
      const r = calcBlankCalc(v.D, v.h, v.L, v.t, 'shallow');
      return r.W * (v.count||1);
    },
    price: (v, p) => {
      const r = calcBlankCalc(v.D, v.h, v.L, v.t, 'shallow');
      const pk = findSheetPrice(v.mat, v.t);
      const matCost = r.W * pk;
      const markup = (p.dish_markup_pct||35)/100;
      return matCost * (1 + markup) * (v.count||1);
    }
  },

  // ===== نازل =====
  nozzles: {
    label: 'نازل‌ها',
    icon: '🔗',
    fields: [
      {id:'size', label:'سایز', type:'select', opts:PIPE_SIZES, labels:PIPE_SIZE_LABELS, def:'2'},
      {id:'count', label:'تعداد', def:4, type:'number'}
    ],
    weight: v => (v.count||0) * 2,  // ~2 kg per nozzle
    price: (v, p) => {
      const flangePrice = (p.flanges['flange_'+v.size] || 500000);
      return (v.count||0) * (flangePrice + 300000);  // flange + pipe + labor
    }
  },

  // ===== منهول =====
  manhole: {
    label: 'منهول',
    icon: '🚪',
    fields: [
      {id:'size', label:'سایز', type:'select', opts:['16','18','20'], labels:{'16':'۱۶ اینچ','18':'۱۸ اینچ','20':'۲۰ اینچ'}, def:'16'},
      {id:'count', label:'تعداد', def:1, type:'number'}
    ],
    weight: v => (v.count||0) * 45,
    price: (v, p) => (v.count||0) * (p.manholes['manhole_'+v.size] || 0)
  },

  // ===== هدهول =====
  headhole: {
    label: 'هدهول',
    icon: '⭕',
    fields: [
      {id:'size', label:'سایز', type:'select', opts:['6','8'], labels:{'6':'۶ اینچ','8':'۸ اینچ'}, def:'6'},
      {id:'count', label:'تعداد', def:0, type:'number'}
    ],
    weight: v => (v.count||0) * 12,
    price: (v, p) => (v.count||0) * (p.headholes['headhole_'+v.size] || 0)
  },

  // ===== هندهول =====
  handhole: {
    label: 'هندهول',
    icon: '🔘',
    fields: [
      {id:'size', label:'سایز', type:'select', opts:['4','5'], labels:{'4':'۴ اینچ','5':'۵ اینچ'}, def:'4'},
      {id:'count', label:'تعداد', def:0, type:'number'}
    ],
    weight: v => (v.count||0) * 6,
    price: (v, p) => (v.count||0) * (p.handholes['handhole_'+v.size] || 0)
  },

  // ===== پایه (زانویی یا عمودی) =====
  base: {
    label: 'پایه / ساپورت',
    icon: '🦵',
    fields: [
      {id:'type', label:'نوع', type:'select', opts:['saddle','leg'], labels:{'saddle':'زانویی','leg':'عمودی'}, def:'saddle'},
      {id:'count', label:'تعداد', def:2, type:'number'},
      {id:'w', label:'عرض (mm)', def:200, type:'number'},
      {id:'l', label:'طول (mm)', def:400, type:'number'},
      {id:'h', label:'ارتفاع (mm)', def:400, type:'number'},
      {id:'t', label:'ضخامت (mm)', def:8, type:'number'}
    ],
    weight: v => {
      const area = (v.w*v.l + 2*v.w*v.h)/1e6;  // m²
      const w = area * (v.t/1000) * 7850 * (v.count||1);
      return w;
    },
    price: (v, p) => {
      const area = (v.w*v.l + 2*v.w*v.h)/1e6;
      const w = area * (v.t/1000) * 7850 * (v.count||1);
      const pk = findSheetPrice('ST37', v.t);
      return w * pk * 1.4;  // 40% هزینه ساخت
    }
  },

  // ===== پد پایه =====
  pad: {
    label: 'پد پایه',
    icon: '⬛',
    fields: [
      {id:'l', label:'طول (mm)', def:250, type:'number'},
      {id:'w', label:'عرض (mm)', def:250, type:'number'},
      {id:'t', label:'ضخامت (mm)', def:10, type:'number'},
      {id:'count', label:'تعداد', def:2, type:'number'}
    ],
    weight: v => (v.l/1000)*(v.w/1000)*(v.t/1000)*7850*(v.count||1),
    price: (v, p) => (v.count||0) * (p.pad_price || 250000)
  },

  // ===== نردبان =====
  ladder: {
    label: 'نردبان',
    icon: '🪜',
    fields: [
      {id:'h', label:'ارتفاع (mm)', def:1500, type:'number'},
      {id:'count', label:'تعداد', def:1, type:'number'}
    ],
    weight: v => (v.h/1000)*(p_ladder_weight)*(v.count||1),
    price: (v, p) => (v.h/1000)*(p.ladder_price_per_kg||80000)*(p.ladder_kg_per_m||15)*(v.count||1)
  },

  // ===== کویل (اسپیرال یا U شکل) =====
  coil: {
    label: 'کویل حرارتی',
    icon: '🌀',
    fields: [
      {id:'type', label:'نوع کویل', type:'select', opts:['spiral','u_shape'], labels:{'spiral':'اسپیرال','u_shape':'U شکل'}, def:'spiral'},
      {id:'material', label:'جنس لوله', type:'select', opts:['copper','SS304','SS309'], labels:{'copper':'مسی','SS304':'استیل 304','SS309':'استیل 309'}, def:'copper'},
      {id:'size', label:'سایز', type:'select', opts:['1_2','3_4','1','1_1_4'], labels:PIPE_SIZE_LABELS, def:'3_4'},
      {id:'branches', label:'تعداد شاخه', def:1, type:'number'},
      {id:'length', label:'طول هر شاخه (m)', def:20, type:'number'}
    ],
    weight: v => {
      const wPerM = (PRICES.pipeWeights && PRICES.pipeWeights[v.size]) || 1.5;
      return wPerM * (v.length||0) * (v.branches||1);
    },
    price: (v, p) => {
      const totalLen = (v.length||0) * (v.branches||1);
      if(v.material==='copper'){
        const k = p.copperCoils[v.size] || 850000;
        return totalLen * k;
      } else {
        const k = (p.pipes[v.material+'_'+v.size]) || 5000000;
        return (totalLen/6) * k;  // شاخه ۶ متری
      }
    }
  },

  // ===== عایق =====
  insulation: {
    label: 'عایق سرامیکی',
    icon: '🧱',
    fields: [
      {id:'thickness', label:'ضخامت', type:'select', opts:['1_5','2_5','5','12'], labels:{'1_5':'1.5 سانتی','2_5':'2.5 سانتی','5':'5 سانتی','12':'12 سانتی'}, def:'5'},
      {id:'area', label:'سطح (m²)', def:5, type:'number'}
    ],
    weight: v => (v.area||0) * 0.15 * (parseFloat(v.thickness.replace('_','.'))||5),
    price: (v, p) => {
      const key = 'ceramic_'+v.thickness;
      const pricePerRoll = p.insulation[key] || 0;
      // هر رول تقریبا 7.2 m²
      const rolls = Math.ceil((v.area||0)/7.2);
      return rolls * pricePerRoll;
    }
  },

  // ===== کاور =====
  cover: {
    label: 'کاور',
    icon: '🛡',
    fields: [
      {id:'material', label:'نوع', type:'select', opts:['steel','aluminum'], labels:{'steel':'استیل','aluminum':'آلومینیوم'}, def:'aluminum'},
      {id:'size', label:'ابعاد ورق', type:'select', opts:['1x2','1.25x2.45'], labels:{'1x2':'۱×۲ متر','1.25x2.45':'۱.۲۵×۲.۴۵ متر'}, def:'1x2'},
      {id:'count', label:'تعداد ورق', def:2, type:'number'}
    ],
    weight: v => {
      const sizes = {'1x2':2, '1.25x2.45':3.06};
      const area = sizes[v.size]||2;
      return area * 2 * 1.5 * (v.count||1);  // ~1.5 kg/m²
    },
    price: (v, p) => {
      const key = v.material+'_'+v.size;
      return (v.count||0) * (p.covers[key] || 0);
    }
  },

  // ===== رزین (سختی‌گیر) =====
  resin: {
    label: 'رزین',
    icon: '💎',
    fields: [
      {id:'volume', label:'حجم (لیتر)', def:100, type:'number'}
    ],
    weight: v => (v.volume||0) * 0.8,
    price: v => (v.volume||0) * 350000
  },

  // ===== سیلیس (فیلتر شنی) =====
  sand: {
    label: 'سیلیس',
    icon: '⛰',
    fields: [
      {id:'weight', label:'وزن (kg)', def:500, type:'number'}
    ],
    weight: v => (v.weight||0),
    price: v => (v.weight||0) * 12000
  },

  // ===== سینی (دی‌اریتور) =====
  tray: {
    label: 'سینی',
    icon: '🍽',
    fields: [
      {id:'D', label:'قطر (mm)', def:800, type:'number'},
      {id:'count', label:'تعداد', def:5, type:'number'},
      {id:'t', label:'ضخامت (mm)', def:3, type:'number'}
    ],
    weight: v => Math.PI/4*Math.pow(v.D/1000,2)*(v.t/1000)*7850*(v.count||1),
    price: (v, p) => {
      const w = Math.PI/4*Math.pow(v.D/1000,2)*(v.t/1000)*7850*(v.count||1);
      const pk = findSheetPrice('SS304', 3);
      return w * pk * 1.5;
    }
  }
};

const p_ladder_weight = 15;

// ============ پیکربندی تجهیزات ============
const EQUIPMENT = {
  simple_tank: {
    label: 'تانک ساده',
    components: ['shell','heads','manholes','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  spiral: {
    label: 'منبع اسپیرال',
    components: ['shell','heads','coil','manhole','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  u_coil: {
    label: 'منبع کوئلی U',
    components: ['shell','heads','coil','manhole','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  softener: {
    label: 'سختی‌گیر',
    components: ['shell','heads','resin','manholes','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  sand_filter: {
    label: 'فیلتر شنی',
    components: ['shell','heads','sand','manholes','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  deaerator: {
    label: 'دی‌اریتور',
    components: ['shell','heads','tray','manholes','nozzles','base','pad','ladder','insulation','cover']
  },
  three_pass: {
    label: 'دیگ سه‌پاس',
    components: ['shell','heads','manholes','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  oil_heater: {
    label: 'دیگ روغن داغ',
    components: ['shell','heads','coil','manholes','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  },
  expansion: {
    label: 'منبع انبساط',
    components: ['shell','heads','manholes','nozzles','base','pad','insulation','cover']
  },
  condensate: {
    label: 'مخزن کندانس',
    components: ['shell','heads','manholes','headhole','handhole','nozzles','base','pad','ladder','insulation','cover']
  }
};

// ============ رندر اجزا ============
function loadEquipment(){
  const eq = document.getElementById('eq-type').value;
  CURRENT_EQUIPMENT = eq;
  renderComponents();
}

function renderComponents(){
  const cfg = EQUIPMENT[CURRENT_EQUIPMENT];
  if(!cfg) return;
  const container = document.getElementById('components-container');
  let html = '';

  COMPONENT_STATE = {};

  cfg.components.forEach(compId => {
    const def = COMPONENTS[compId] || COMPONENTS[compId.slice(0,-1)] || COMPONENTS[compId+'s'];
    if(!def) return;
    
    // ذخیره وضعیت
    COMPONENT_STATE[compId] = { enabled: true, values: {} };

    html += `<div class="card comp-card" data-comp="${compId}">
      <div class="comp-head" onclick="toggleComp('${compId}')">
        <label onclick="event.stopPropagation()">
          <input type="checkbox" checked onchange="toggleCompEnabled('${compId}', this.checked)" onclick="event.stopPropagation()">
          <span class="comp-symbol">${def.icon}</span>
          ${def.label}
        </label>
        <span style="color:var(--pr);font-size:18px">▾</span>
      </div>
      <div class="comp-body active" id="body-${compId}">
        <div class="row">`;

    def.fields.forEach(f => {
      COMPONENT_STATE[compId].values[f.id] = f.def;
      html += `<div class="field">
        <label>${f.label}</label>`;
      if(f.type === 'select'){
        html += `<select data-comp="${compId}" data-fid="${f.id}" onchange="onCompInput('${compId}','${f.id}',this.value)">`;
        f.opts.forEach(o => {
          const lab = (f.labels && f.labels[o]) || o;
          html += `<option value="${o}" ${o==f.def?'selected':''}>${lab}</option>`;
        });
        html += `</select>`;
      } else {
        html += `<input type="number" step="any" value="${f.def||''}" data-comp="${compId}" data-fid="${f.id}" oninput="onCompInput('${compId}','${f.id}',this.value)">`;
      }
      html += `</div>`;
    });

    html += `</div></div></div>`;
  });

  container.innerHTML = html;
}

function toggleComp(id){
  const body = document.getElementById('body-'+id);
  if(body) body.classList.toggle('active');
}

function toggleCompEnabled(id, enabled){
  if(COMPONENT_STATE[id]) COMPONENT_STATE[id].enabled = enabled;
}

function onCompInput(compId, fieldId, value){
  if(!COMPONENT_STATE[compId]) COMPONENT_STATE[compId] = {enabled:true, values:{}};
  const v = isNaN(parseFloat(value)) ? value : parseFloat(value);
  COMPONENT_STATE[compId].values[fieldId] = v;
}

// ============ محاسبه کل ============
function calcAll(){
  const out = document.getElementById('total-result');
  let totalWeight = 0;
  let totalPrice = 0;
  let details = '';

  for(const compId in COMPONENT_STATE){
    const state = COMPONENT_STATE[compId];
    if(!state.enabled) continue;
    const def = COMPONENTS[compId] || COMPONENTS[compId.slice(0,-1)] || COMPONENTS[compId+'s'];
    if(!def) continue;
    
    try{
      const w = def.weight(state.values, PRICES);
      const p = def.price(state.values, PRICES);
      totalWeight += w;
      totalPrice += p;
      details += `<div class="item"><span class="lbl">${def.icon} ${def.label}</span>
        <span class="val">${fmt(w,1)} kg / ${fmtT(p)}</span></div>`;
    }catch(e){ console.warn('Calc error for '+compId, e); }
  }

  // محاسبه جوشکاری
  const weldPrice = estimateWeldPrice();
  const electrodePrice = estimateElectrode();
  const paintPrice = estimatePaint();
  const consumables = (totalPrice + weldPrice + electrodePrice + paintPrice) * (PRICES.consumables_pct/100);
  const transport = totalWeight * (PRICES.transport_per_kg/1000);

  const finalPrice = totalPrice + weldPrice + electrodePrice + paintPrice + consumables + transport;

  out.innerHTML = `
    <div class="summary-box">
      <div class="label">وزن کل</div>
      <div class="value">${fmt(totalWeight,1)} kg</div>
      <div class="sub">وزن پر از آب تقریبی: ${fmt(totalWeight + estimateWaterVolume(),1)} kg</div>
    </div>
    <div class="summary-box" style="border-color:var(--ac);background:linear-gradient(135deg,rgba(0,255,157,.15),rgba(0,214,143,.05))">
      <div class="label">💰 قیمت نهایی (بدون سود)</div>
      <div class="value" style="color:var(--ac)">${fmtT(finalPrice)} تومان</div>
      <div class="sub">برای دیدن قیمت با سود، به تب قیمت‌ها مراجعه کنید</div>
    </div>
    <div class="result">
      ${details}
      <div class="divider"></div>
      <div class="item"><span class="lbl">جوشکاری</span><span class="val">${fmtT(weldPrice)}</span></div>
      <div class="item"><span class="lbl">الکترود</span><span class="val">${fmtT(electrodePrice)}</span></div>
      <div class="item"><span class="lbl">رنگ</span><span class="val">${fmtT(paintPrice)}</span></div>
      <div class="item"><span class="lbl">مصرفی جانبی</span><span class="val">${fmtT(consumables)}</span></div>
      <div class="item"><span class="lbl">حمل</span><span class="val">${fmtT(transport)}</span></div>
      <div class="divider"></div>
      <div class="item big"><span class="lbl">جمع</span><span class="val">${fmtT(finalPrice)}</span></div>
      <div class="item big" style="border-top:2px solid var(--pr);padding-top:12px">
        <span class="lbl">💵 قیمت هر کیلو</span>
        <span class="val">${fmt(finalPrice/totalWeight,0)} تومان</span>
      </div>
    </div>
  `;
}

function estimateWeldPrice(){
  let totalLength = 0;
  if(COMPONENT_STATE.shell){
    const v = COMPONENT_STATE.shell.values;
    const D = (v.D||0)/1000, H = (v.H||0)/1000;
    totalLength += H + Math.PI*D*Math.ceil(H/1.5);
  }
  const hW = totalLength * 2;
  return hW * (PRICES.welder_hr||0) + hW*0.5*(PRICES.fitter_hr||0);
}
function estimateElectrode(){
  let L = 0;
  if(COMPONENT_STATE.shell){
    const v = COMPONENT_STATE.shell.values;
    const D = (v.D||0)/1000, H = (v.H||0)/1000;
    L += H + Math.PI*D*Math.ceil(H/1.5);
  }
  return L * 0.15 * (PRICES.electrode_kg||0);
}
function estimatePaint(){
  let area = 0;
  if(COMPONENT_STATE.shell){
    const v = COMPONENT_STATE.shell.values;
    area += Math.PI*(v.D/1000)*(v.H/1000);
  }
  if(COMPONENT_STATE.heads){
    const v = COMPONENT_STATE.heads.values;
    area += (v.count||2) * 1.084 * Math.PI/4 * Math.pow(v.D/1000, 2);
  }
  return area * ((PRICES.paint_epoxy_m2||0)+(PRICES.paint_zinc_m2||0));
}
function estimateWaterVolume(){
  if(!COMPONENT_STATE.shell) return 0;
  const v = COMPONENT_STATE.shell.values;
  const D = (v.D||0)/10, H = (v.H||0)/10;
  return totalVol(D, H, 'torisph');
}

// ============ Tab 1 و 2 و 3 ============
function calcVol(){
  const t = document.getElementById('v-type').value;
  const out = document.getElementById('v-res');
  if(t==='box'){
    const W=val('v-d'), L=val('v-l'), H=val('v-w');
    if(!(W>0&&L>0&&H>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">همه ابعاد را پر کنید</span></div></div>'; return; }
    const V=W*L*H/1000;
    out.innerHTML = `<div class="result">
      <div class="item"><span class="lbl">ابعاد:</span><span class="val">${fmt(W,1)}×${fmt(L,1)}×${fmt(H,1)}</span></div>
      <div class="item big"><span class="lbl">حجم:</span><span class="val">${fmt(V)} لیتر</span></div>
      <div class="item"><span class="lbl">سطح:</span><span class="val">${fmt(2*(W*L+W*H+L*H)/10000,2)} m²</span></div>
    </div>`;
    return;
  }
  const D=val('v-d'), H=val('v-h');
  if(!(D>0&&H>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">قطر و ارتفاع</span></div></div>'; return; }
  const head = t==='cyl-dish'?'torisph':'flat';
  const vB = cylVol(D,H), vH = head==='torisph'?2*dishVT(D):0;
  const V = vB+vH;
  out.innerHTML = `<div class="result">
    <div class="item"><span class="lbl">حجم بدنه:</span><span class="val">${fmt(vB)} L</span></div>
    <div class="item"><span class="lbl">حجم عدسی‌ها:</span><span class="val">${fmt(vH)} L</span></div>
    <div class="item big"><span class="lbl">حجم کل:</span><span class="val">${fmt(V)} L</span></div>
  </div>`;
}

function calcDim(){
  const V=val('d-v'), D=val('d-d')||0, H=val('d-h')||0;
  const out = document.getElementById('d-res');
  if(!(V>0)){ out.innerHTML='<div class="result red"><div class="item"><span class="lbl">ظرفیت را وارد کنید</span></div></div>'; return; }
  let html = '<div class="result">';
  if(D>0&&H>0){
    const Vc = totalVol(D,H,'torisph');
    html += `<div class="item big"><span class="lbl">حجم:</span><span class="val">${fmt(Vc)} L</span></div>`;
  } else if(D>0){
    const Hc = hFromV(V,D);
    html += `<div class="item big"><span class="lbl">ارتفاع:</span><span class="val">${fmt(Hc,1)} cm</span></div>`;
  } else if(H>0){
    const Dc = diamFromV(V,H);
    html += `<div class="item big"><span class="lbl">قطر:</span><span class="val">${fmt(Dc,1)} cm</span></div>`;
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
    const H=n*w, D=diamFromV(V,H), C=Math.PI*D;
    const m=Math.ceil(C/L), sheets=n*m, waste=n*(m*L-C), pct=waste/(sheets*L)*100;
    rows.push({w,n,H,D,C,m,sheets,waste,pct});
  }
  rows.sort((a,b)=>Math.abs(a.pct-b.pct)>0.01?a.pct-b.pct:a.sheets-b.sheets);
  const best={};
  for(const w of widths){const s=rows.filter(r=>r.w===w); if(s.length) best[w]=s[0];}
  let html = '<div class="table-wrap"><table><thead><tr><th>عرض</th><th>کورس</th><th>ارتفاع</th><th>قطر</th><th>ورق</th><th>کل</th><th>پرت٪</th></tr></thead><tbody>';
  rows.slice(0,15).forEach(r=>{
    const isB = best[r.w]&&best[r.w].n===r.n;
    html += `<tr class="${isB?'best':''}"><td>${r.w}${isB?' <span class="badge best">✓</span>':''}</td><td>${r.n}</td><td>${fmt(r.H,0)}</td><td>${fmt(r.D,1)}</td><td>${r.m}</td><td>${r.sheets}</td><td>${fmt(r.pct,1)}</td></tr>`;
  });
  html += '</tbody></table></div>';
  for(const w of widths){const b=best[w]; if(!b) continue;
    html += `<div class="result green" style="margin-top:10px">
      <div class="item"><span class="lbl">🏆 عرض:</span><span class="val">${w} cm</span></div>
      <div class="item big"><span class="lbl">ارتفاع:</span><span class="val">${fmt(b.H,0)} cm</span></div>
      <div class="item big"><span class="lbl">قطر:</span><span class="val">${fmt(b.D,1)} cm</span></div>
      <div class="item"><span class="lbl">کل ورق:</span><span class="val">${b.sheets}</span></div>
      <div class="item"><span class="lbl">پرت:</span><span class="val">${fmt(b.pct,1)}٪</span></div>
    </div>`;
  }
  out.innerHTML = html;
}

// ============ قیمت ============
function findSheetPrice(mat, t){
  const keys = Object.keys(PRICES.sheets||{});
  const c = keys.filter(k=>k.startsWith(mat+'_'));
  if(!c.length){const b=PRICES.sheets['ST37_6']||70000; return mat.startsWith('SS')?b*4:b;}
  let best=null;
  for(const k of c){const tk=parseFloat(k.split('_')[1]), d=Math.abs(tk-t); if(!best||d<best.d) best={d,p:PRICES.sheets[k]};}
  return best.p;
}

// ============ قیمت‌ها ============
const PRICE_LABELS = {
  sheets:{title:'ورق‌ها (تومان/kg)'},
  pipes:{title:'لوله‌ها (تومان/شاخه)'},
  bushings:{title:'بوشن‌ها'},
  flanges:{title:'فلنج‌ها'},
  manholes:{title:'منهول'},
  headholes:{title:'هدهول'},
  handholes:{title:'هندهول'},
  insulation:{title:'عایق'},
  copperCoils:{title:'کویل مسی'},
  covers:{title:'کاور'}
};
const ROOT_LABELS = {dish_markup_pct:'کارمزد عدسی (٪)',electrode_kg:'الکترود',welder_hr:'جوشکار/ساعت',fitter_hr:'مونتاژکار/ساعت',painter_hr:'رنگ‌کار/ساعت',paint_epoxy_m2:'اپوکسی/m²',paint_zinc_m2:'زینک/m²',consumables_pct:'مصرفی (٪)',transport_per_kg:'حمل/kg',ladder_kg_per_m:'نردبان kg/m',ladder_price_per_kg:'نردبان/kg',pad_price:'پد پایه (عدد)'};

function renderPriceEditor(){
  const c = document.getElementById('price-editor');
  if(!c) return;
  let html = '';
  for(const cat in PRICE_LABELS){
    if(!PRICES[cat]) continue;
    html += `<h3 style="color:var(--pr);font-size:13px;margin:14px 0 8px">${PRICE_LABELS[cat].title}</h3>`;
    for(const k in PRICES[cat]){
      html += `<div class="price-row"><label>${k}</label><input type="number" data-cat="${cat}" data-key="${k}" value="${PRICES[cat][k]}" step="any"></div>`;
    }
  }
  html += '<h3 style="color:var(--pr);font-size:13px;margin:14px 0 8px">سایر</h3>';
  for(const k in ROOT_LABELS){
    html += `<div class="price-row"><label>${ROOT_LABELS[k]}</label><input type="number" data-cat="_root" data-key="${k}" value="${PRICES[k]||0}" step="any"></div>`;
  }
  c.innerHTML = html;
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

// ============ حافظه ============
function saveEquipCalc(){
  const name = prompt('نام محاسبه:', 'محاسبه ' + new Date().toLocaleDateString('fa-IR'));
  if(!name) return;
  try{
    const key = 'csp_calcs';
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({
      id: 'calc_' + Date.now(),
      type: CURRENT_EQUIPMENT,
      name: name,
      date: new Date().toLocaleDateString('fa-IR'),
      state: JSON.parse(JSON.stringify(COMPONENT_STATE))
    });
    if(list.length > 100) list = list.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(list));
    showStatus('success','✅ ذخیره شد');
    renderMemory();
  }catch(e){ showStatus('danger','خطا در ذخیره'); }
}

function saveHeadCalc(){
  const D = val('h-d'), h = val('h-h'), L = val('h-l')||0, t = val('h-t')||6;
  if(!(D>0 && h>0)){ showStatus('danger','اطلاعات کامل نیست'); return; }
  const name = prompt('نام محاسبه:', 'عدسی ' + D + 'mm');
  if(!name) return;
  try{
    const key = 'csp_calcs';
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    const res = calcBlankCalc(D, h, L, t, document.getElementById('h-type').value);
    list.unshift({
      id: 'calc_' + Date.now(),
      type: 'head',
      name: name,
      date: new Date().toLocaleDateString('fa-IR'),
      inputs: {D, h, L, t},
      outputs: res
    });
    localStorage.setItem(key, JSON.stringify(list));
    showStatus('success','✅ ذخیره شد');
  }catch(e){}
}

function renderMemory(){
  const list = (()=>{ try{return JSON.parse(localStorage.getItem('csp_calcs')||'[]')}catch(e){return []} })();
  const search = (document.getElementById('mem-search')?.value||'').toLowerCase();
  const el = document.getElementById('mem-list');
  if(!el) return;
  const filtered = list.filter(c=>!search || (c.name||'').toLowerCase().includes(search));
  if(!filtered.length){ el.innerHTML='<div class="empty-state">هیچ محاسبه‌ای نیست</div>'; return; }
  let html = '';
  filtered.forEach(c=>{
    html += `<div class="save-row">
      <div class="info"><b>${c.name}</b><br>${c.type} — ${c.date}</div>
      <button class="load" onclick="loadFromMemory('${c.id}')">بارگذاری</button>
      <button class="del" onclick="delFromMemory('${c.id}')">حذف</button>
    </div>`;
  });
  el.innerHTML = html;
}

function loadFromMemory(id){
  try{
    const list = JSON.parse(localStorage.getItem('csp_calcs')||'[]');
    const c = list.find(x=>x.id===id);
    if(!c) return;
    if(c.type==='head'){
      document.getElementById('h-d').value = c.inputs.D;
      document.getElementById('h-h').value = c.inputs.h;
      document.getElementById('h-l').value = c.inputs.L;
      document.getElementById('h-t').value = c.inputs.t;
      document.querySelector('[data-tab="t5"]').click();
      calcBlank();
      return;
    }
    // محاسبه تجهیز
    if(EQUIPMENT[c.type]){
      document.getElementById('eq-type').value = c.type;
      CURRENT_EQUIPMENT = c.type;
      renderComponents();
      // پر کردن مقادیر
      setTimeout(()=>{
        for(const compId in c.state){
          if(!COMPONENT_STATE[compId]) continue;
          COMPONENT_STATE[compId].enabled = c.state[compId].enabled;
          for(const fid in c.state[compId].values){
            COMPONENT_STATE[compId].values[fid] = c.state[compId].values[fid];
            const inp = document.querySelector(`[data-comp="${compId}"][data-fid="${fid}"]`);
            if(inp) inp.value = c.state[compId].values[fid];
          }
        }
        calcAll();
      }, 100);
      document.querySelector('[data-tab="t4"]').click();
    }
    showStatus('success','✅ بارگذاری شد');
  }catch(e){ console.warn(e); }
}

function delFromMemory(id){
  if(!confirm('حذف شود؟')) return;
  try{
    let list = JSON.parse(localStorage.getItem('csp_calcs')||'[]');
    list = list.filter(c=>c.id!==id);
    localStorage.setItem('csp_calcs', JSON.stringify(list));
    renderMemory();
  }catch(e){}
}

function clearMemory(){
  if(!confirm('همه محاسبات پاک شوند؟')) return;
  localStorage.removeItem('csp_calcs');
  renderMemory();
}

function exportMemory(){
  const list = (()=>{ try{return JSON.parse(localStorage.getItem('csp_calcs')||'[]')}catch(e){return []} })();
  if(!list.length){ showStatus('warn','لیست خالی است'); return; }
  let csv = '\uFEFFنام,نوع,تاریخ\n';
  list.forEach(c=>{ csv += `"${c.name}","${c.type}","${c.date}"\n`; });
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'calculations.csv';
  a.click();
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
  info.innerHTML = `<div class="notice info"><strong>${cat.name}</strong> <span class="cat-badge">${rows.length} مدل</span>${mIdx>=0?'<br>🎯 نزدیک‌ترین سبز':''}</div>`;
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
    const D = info.D ? (parseFloat(info.D)) : 0;
    const H = info.H ? (parseFloat(info.H)) : 0;
    if(D && COMPONENT_STATE.shell){
      const inp = document.querySelector('[data-comp="shell"][data-fid="D"]');
      if(inp){ inp.value = D; COMPONENT_STATE.shell.values.D = D; }
    }
    if(H && COMPONENT_STATE.shell){
      const inp = document.querySelector('[data-comp="shell"][data-fid="H"]');
      if(inp){ inp.value = H; COMPONENT_STATE.shell.values.H = H; }
    }
    if(D && COMPONENT_STATE.heads){
      const inp = document.querySelector('[data-comp="heads"][data-fid="D"]');
      if(inp){ inp.value = D; COMPONENT_STATE.heads.values.D = D; }
    }
    showStatus('success', `✓ ${info.model} منتقل شد`);
  }catch(e){console.warn(e);}
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

// ============ Tab ها ============
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

// ============ راه‌اندازی ============
(async function(){
  await initFirebase();
  loadPricesLocal();
  if (typeof window.EMBEDDED_CATALOG !== 'undefined') {
    CATALOG = window.EMBEDDED_CATALOG;
  }
  initLogo();
  renderPriceEditor();
  initCatalog();
  renderMemory();
  loadEquipment();  // بارگذاری تجهیز پیش‌فرض

  listenToPrices((remotePrices) => {
    if (remotePrices && remotePrices.version !== PRICES.version) {
      PRICES = Object.assign({}, window.EMBEDDED_PRICES, remotePrices);
      savePricesLocal(false);
      renderPriceEditor();
      showStatus('info', '🔄 قیمت‌ها از سرور بروزرسانی شد.');
    }
  });

  console.log('✅ App ready');
})();

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

// تغییر نوع مخزن
document.addEventListener('DOMContentLoaded',()=>{
  const vt = document.getElementById('v-type');
  if(vt) vt.addEventListener('change',e=>{
    const b = e.target.value==='box';
    const elL = document.getElementById('f-v-l');
    const elW = document.getElementById('f-v-w');
    const elH = document.getElementById('f-v-h');
    if(elL) elL.style.display = b?'block':'none';
    if(elW) elW.style.display = b?'block':'none';
    if(elH) elH.style.display = b?'none':'block';
  });
});
