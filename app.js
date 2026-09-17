// app.js — منطق اصلی برنامه

// ===== متغیرهای سراسری =====
let PRICES = JSON.parse(JSON.stringify(window.EMBEDDED_PRICES || {}));
let CATALOG = window.EMBEDDED_CATALOG || {categories:{}};
let USER_MODIFIED = false;

// ===== بارگذاری قیمت‌ها =====
function loadPricesLocal() {
  try {
    const s = localStorage.getItem('csp_prices');
    if (s) {
      const local = JSON.parse(s);
      PRICES = Object.assign({}, window.EMBEDDED_PRICES, local.data);
      USER_MODIFIED = !!local.modified;
    }
  } catch(e) {}
}

function savePricesLocal(modified) {
  try {
    localStorage.setItem('csp_prices', JSON.stringify({
      version: PRICES.version,
      modified: !!modified,
      data: PRICES,
      savedAt: Date.now()
    }));
  } catch(e) {}
}

// ===== Firebase Sync =====
async function syncPricesFromFirebase() {
  const remote = await loadPricesFromFirebase();
  if (remote) {
    PRICES = Object.assign({}, window.EMBEDDED_PRICES, remote);
    savePricesLocal(false);
    renderPriceEditor();
    showStatus('success', '✅ قیمت‌ها از سرور دریافت شد.');
    return true;
  }
  return false;
}

async function syncPricesToFirebase() {
  const ok = await savePricesToFirebase(PRICES);
  if (ok) {
    showStatus('success', '✅ قیمت‌ها به سرور ارسال شد.');
  } else {
    showStatus('danger', '❌ ارسال به سرور ناموفق.');
  }
  return ok;
}

// ===== محاسبات =====
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

const MS = {'A516-70':20000,'ST37':13500,'S235JR':15000,'SS304':16700,'SS316':16700,'Galvanized':14000};
const MR = {'A516-70':7850,'ST37':7850,'S235JR':7850,'SS304':8000,'SS316':8000,'Galvanized':7850};
const sT = (P,R,mat)=>{const p=P*14.5038; return (p*R)/(MS[mat]-0.6*p)+1.5;};
const hT = (P,D,mat)=>{const p=P*14.5038; return 0.885*p*D/(MS[mat]-0.1*p)+1.5;};

// ===== سطح گسترده عدسی =====
function calcHeadBlank(D, h, L, t, type){
  let D_blank;
  if(type === 'torisph'){
    D_blank = Math.sqrt(D*D + 4*D*h) + 2*L;
  } else if(type === 'ellip'){
    D_blank = Math.sqrt(D*D + 4*h*h) + 2*L;
  } else {
    D_blank = 1.414 * D + 2 * L;
  }
  const A = Math.PI/4 * Math.pow(D_blank/1000, 2);
  const W = A * (t/1000) * 7850;
  const perim = Math.PI * D_blank;
  return { D_blank, A, W, perim };
}

// ===== ذخیره محاسبات =====
function saveCalculation(type, name, inputs, outputs) {
  try {
    const key = 'csp_calcs';
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({
      id: 'calc_' + Date.now(),
      type: type,
      name: name || 'محاسبه جدید',
      date: new Date().toLocaleDateString('fa-IR'),
      inputs: inputs,
      outputs: outputs
    });
    if (list.length > 100) list = list.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch(e) { return false; }
}

function loadCalculations() {
  try {
    return JSON.parse(localStorage.getItem('csp_calcs') || '[]');
  } catch(e) { return []; }
}

function deleteCalculation(id) {
  try {
    let list = loadCalculations();
    list = list.filter(c => c.id !== id);
    localStorage.setItem('csp_calcs', JSON.stringify(list));
    return true;
  } catch(e) { return false; }
}