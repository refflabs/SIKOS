import{c as s,j as a,B as i}from"./index-D70ZaQYg.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],c=s("circle-alert",r);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],l=s("refresh-cw",n),d="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",u=e=>(e==null?void 0:e.image)||d,x=e=>{if(!(e!=null&&e.facilities))return[];if(Array.isArray(e.facilities))return e.facilities;try{return JSON.parse(e.facilities)}catch{return[]}},h=e=>(e==null?void 0:e.status)==="available",m=e=>e==="available"?"Tersedia":e==="booked"?"Terisi":e==="maintenance"?"Perawatan":e,b=e=>`Rp ${Number(e).toLocaleString("id-ID")}`;function o({message:e="Gagal memuat data.",onRetry:t}){return a.jsxs("div",{className:"flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface-warm",children:[a.jsx("span",{className:"flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4",children:a.jsx(c,{className:"h-6 w-6"})}),a.jsx("p",{className:"text-sm font-medium text-foreground mb-1",children:"Terjadi kesalahan"}),a.jsx("p",{className:"text-subtitle text-sm mb-6 max-w-sm",children:e}),t&&a.jsxs(i,{variant:"outline",size:"md",onClick:t,children:[a.jsx(l,{className:"h-4 w-4"}),"Coba lagi"]})]})}export{o as Q,u as a,b as f,h as i,x as r,m as s};
