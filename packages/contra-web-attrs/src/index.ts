import { ContraClient, starSVG } from "@contra/contra-core";
import type { ContraFilters, ContraExpert, ContraProject } from "@contra/contra-core";

const ATTR_PREFIX = "data-contra-";

/* ----------------------- Helpers ----------------------- */
const attr = (el: Element, name: string) => el.getAttribute(`${ATTR_PREFIX}${name}`);
const qs   = <T extends HTMLElement>(el: Element, sel: string)   => el.querySelector(sel) as T | null;
const qsa  = <T extends HTMLElement>(el: Element, sel: string)  => Array.from(el.querySelectorAll(sel)) as T[];

/* Parse wrapper → ContraFilters */
function parseFilters(wrapper: HTMLElement): ContraFilters {
  const f: ContraFilters = {};
  const map: Record<string, keyof ContraFilters> = {"languages":"languages","min-rate":"minRate","max-rate":"maxRate","location":"location","available":"available","sort":"sortBy"};
  Object.entries(map).forEach(([a,k])=>{
    const v=attr(wrapper,a); if(v==null) return;
    if(k==='languages') f.languages=v.split(',').map(s=>s.trim());
    else if(k==='available') f.available=v==='true';
    else if(k==='minRate'||k==='maxRate') (f as any)[k]=+v;
    else (f as any)[k]=v;
  });
  return f;
}

/* Hydrate scalar + project repeat */
function hydrateCard(tpl: HTMLElement, ex: ContraExpert): HTMLElement {
  const c=tpl.cloneNode(true) as HTMLElement; c.removeAttribute('style');
  // scalar fields
  qsa<HTMLElement>(c,'[data-field]').forEach(el=>{
    const key=el.dataset.field!; const val=(ex as any)[key]; if(val==null) return;
    if(el.tagName==='IMG') (el as HTMLImageElement).src=val;
    else if(el.tagName==='A') (el as HTMLAnchorElement).href=val;
    else el.textContent = key==='hourlyRateUSD'?`$${val}/hr`:String(val);
  });
  // stars
  qs(c,'[data-stars]')?.insertAdjacentHTML('beforeend',starSVG(ex.averageReviewScore));
  // projects list
  qsa<HTMLElement>(c,'[data-repeat="projects"]').forEach(container=>{
    const proto=container.firstElementChild?.cloneNode(true) as HTMLElement|undefined;
    if(!proto) return;
    container.innerHTML='';
    const items=(ex.projects||[]).slice(0,4);
    items.forEach((p: ContraProject)=>{
      const clone=proto.cloneNode(true) as HTMLElement;
      qsa<HTMLElement>(clone,'[data-field]').forEach(el=>{
        const key=el.dataset.field!; const v=(p as any)[key]; if(v==null) return;
        if(el.tagName==='IMG') (el as HTMLImageElement).src=v;
        else if(el.tagName==='A') (el as HTMLAnchorElement).href=v;
        else el.textContent=v;
      });
      container.appendChild(clone);
    });
    if(items.length===0) container.style.display='none';
  });
  return c;
}

/* Render experts into wrapper */
async function render(wrapper: HTMLElement, client: ContraClient){
  qsa(wrapper,':scope>*:not([data-contra-template])').forEach(n=>n.remove());
  const tpl=qs(wrapper,'[data-contra-template]')!; if(!tpl) return;
  const program=attr(wrapper,'program')!; const filters=parseFilters(wrapper);
  const {data}=await client.listExperts(program,filters);
  data.forEach((ex: ContraExpert)=>wrapper.appendChild(hydrateCard(tpl,ex)));
}

/* Wire filter controls */
function wireControls(wrapper: HTMLElement){
  qsa(wrapper,`[${ATTR_PREFIX}filter]`).forEach(ctrl=>{
    const key=attr(ctrl,'filter')!; const multi=ctrl instanceof HTMLSelectElement && ctrl.multiple;
    ctrl.addEventListener('change',()=>{
      if(ctrl instanceof HTMLInputElement && ctrl.type==='checkbox') wrapper.setAttribute(`${ATTR_PREFIX}${key}`,String(ctrl.checked));
      else if(multi){const v=[...(ctrl as HTMLSelectElement).selectedOptions].map(o=>o.value).join(','); wrapper.setAttribute(`${ATTR_PREFIX}${key}`,v);} 
      else wrapper.setAttribute(`${ATTR_PREFIX}${key}`,(ctrl as HTMLInputElement|HTMLSelectElement).value);
      (wrapper as any)._reload();
    });
  });
}

/* Boot */
async function main(){
  const cfg=JSON.parse(document.getElementById('contra-config')!.textContent!);
  const client=new ContraClient({apiKey:cfg.apiKey});
  document.querySelectorAll(`[${ATTR_PREFIX}program]`).forEach(w=>{
    const wrapper=w as HTMLElement; wrapper.style.position='relative';
    (wrapper as any)._reload=()=>render(wrapper,client);
    wireControls(wrapper); (wrapper as any)._reload();
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',main); else main(); 