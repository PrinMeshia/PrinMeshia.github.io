// WebCore Runtime (ES2024+)
{
class State{#d=new Map();#l=new Map();
set(k,v){this.#d.set(k,v);this.#l.get(k)?.forEach(f=>f(v))}
setQ(k,v){this.#d.set(k,v)}
get(k){return this.#d.get(k)}
on(k,f){(this.#l.get(k)??this.#l.set(k,[]).get(k)).push(f)}}
const S=new State();
const STORE=new State();

S.set('count',0);
S.set('step',1);
const VARS=['count','doubled','step'];
const STORE_VARS=[];
const{max,min,abs}=Math,U={max,min,abs};

const COMPUTED=[{name:'doubled',fn:()=>S.get('count') * 2}];
const rebindComputed=()=>COMPUTED.forEach(c=>S.setQ(c.name,c.fn()));

const evalCond=c=>{const t=c.trim();if(VARS.indexOf(t)>=0)return S.get(t);const sm=t.match(/^\$store\.([a-zA-Z_]\w*)$/);if(sm)return STORE.get(sm[1]);let e=t;e=e.replace(/\$store\.([a-zA-Z_]\w*)/g,"STORE.get('$1')");VARS.forEach(v=>{e=e.replace(new RegExp('\\b'+v+'\\b','g'),"S.get('"+v+"')")});try{return new Function('S','STORE','U','"use strict";return('+e+')')(S,STORE,U)}catch(_){return undefined}};
const bindIf=()=>{document.querySelectorAll('[data-webcore-if]').forEach(el=>{const cond=el.dataset.webcoreIf,next=el.nextElementSibling,hasElse=next?.dataset.webcoreElse===cond,upd=()=>{const v=evalCond(cond);el.style.display=v?'':'none';if(hasElse)next.style.display=v?'none':''};upd();VARS.forEach(v=>S.on(v,upd));STORE_VARS.forEach(v=>STORE.on(v,upd))});};
const bindAttrs=()=>{document.querySelectorAll('[data-webcore-bound]').forEach(el=>{[...el.attributes].filter(a=>a.name.startsWith('data-webcore-attr-')).forEach(a=>{const name=a.name.slice(18),expr=a.value,upd=()=>el.setAttribute(name,String(evalCond(expr)??''));upd();VARS.forEach(v=>S.on(v,upd));STORE_VARS.forEach(v=>STORE.on(v,upd))})});};

const H={
componentsbtn1(){S.set('count',U.max(0, S.get('count') - S.get('step')))},
componentsbtn2(){S.set('count',S.get('count')+S.get('step'))},
componentsbtn3(){S.set('count',0)},
componentsbtn4(){S.set('step',U.max(1, event.target.value))},
homebtn1(){S.set('count',U.max(0, S.get('count') - S.get('step')))},
homebtn2(){S.set('count',S.get('count')+S.get('step'))},
homebtn3(){S.set('count',0)},
homebtn4(){S.set('step',U.max(1, event.target.value))},
};

const bind=()=>{rebindComputed();document.querySelectorAll('[data-webcore-interpolation]').forEach(el=>{const e=el.dataset.webcoreInterpolation,u=()=>{rebindComputed();el.textContent=String(evalCond(e)??'')};u();VARS.forEach(v=>S.on(v,u));STORE_VARS.forEach(v=>STORE.on(v,u))})};

const toFile=p=>p==='/'?'index.html':`${p.slice(1)}.html`;
const nav=async p=>{
const file=toFile(p);
try{const html=await(await fetch(file)).text();
const doc=new DOMParser().parseFromString(html,'text/html');
const main=doc.querySelector('main');
if(main)document.querySelector('main').replaceWith(main);
history.pushState({},'',p);bind();bindIf();bindAttrs()}catch(e){location.href=file}};

addEventListener('popstate',()=>nav(location.pathname));

Object.assign(globalThis,{webcore_navigate:nav,webcore_handle_event:(t,id)=>H[id]?.(),
...Object.fromEntries(['click','submit','change','input'].map(e=>[`webcore_handle_${e}`,id=>H[id]?.()]))});

document.addEventListener('DOMContentLoaded',()=>{bind();bindIf();bindAttrs()});
}
