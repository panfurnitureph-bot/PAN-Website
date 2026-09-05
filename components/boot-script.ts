// INLINE, tumatakbo bago ang anumang chunk (nasa <head> ng root layout).
//
// (1) SCROLL MARK — `<html data-scrolled="1">` kapag lampas 60px ang scroll.
//     Ang CSS sa globals.css ang nagpapa-opaque ng header mula rito, kaya kahit
//     HINDI nag-hydrate ang React (nabitawan ng CDN edge ang isang chunk —
//     nakita 2026-09-05: transparent na header sa ibabaw ng laman habang
//     naka-scroll), mababasa pa rin ang header.
// (2) HYDRATION GUARD — kung 6s pagkatapos ng `load` ay wala pa ring
//     window.__pan_hydrated (components/HydrationMark), isang reload; max 2
//     kada 10 minuto (sessionStorage) para hindi kailanman mag-loop.
export const BOOT_SCRIPT = `(function(){
var d=document.documentElement;
function mark(){if(window.scrollY>60)d.setAttribute("data-scrolled","1");else d.removeAttribute("data-scrolled");}
window.addEventListener("scroll",mark,{passive:true});mark();
var K="pan_web_reloads";
function hits(){try{var a=JSON.parse(sessionStorage.getItem(K)||"[]");var n=Date.now();return a.filter(function(t){return n-t<600000});}catch(e){return [];}}
window.addEventListener("load",function(){setTimeout(function(){
if(window.__pan_hydrated)return;if(navigator.onLine===false)return;
var h=hits();if(h.length>=2)return;h.push(Date.now());
try{sessionStorage.setItem(K,JSON.stringify(h))}catch(e){}
location.reload();},6000);});
})();`;
