/* New Era - Discord status, intro countdown (locked until the date), theme toggle, scroll effects */

(function(){
var DISCORD_ID='755329260457033829';
var links=[].slice.call(document.querySelectorAll('header nav a'));
function mark(id){links.forEach(function(a){var on=a.dataset.s===id;a.classList.toggle('active',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current');if(on&&a.scrollIntoView&&a.parentNode.scrollWidth>a.parentNode.clientWidth)a.parentNode.scrollTo({left:a.offsetLeft-40})})}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)mark(e.target.id)})},{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('main section').forEach(function(s){io.observe(s)});
mark('home');

function getJson(url){var c=new AbortController(),t=setTimeout(function(){c.abort()},5000);
  return fetch(url,{signal:c.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.json()})}
var LABEL={online:'Online',idle:'Idle',dnd:'Do Not Disturb',streaming:'Streaming',offline:'Offline'},TYPE={0:'Playing',1:'Streaming',2:'Listening',3:'Watching',5:'Competing'};
function row(card,cls,txt){if(!txt)return;var d=document.createElement('div');d.className=cls;d.textContent=txt;card.appendChild(d)}
function discord(){
  getJson('https://api.lanyard.rest/v1/users/'+DISCORD_ID).then(function(j){
    if(!j.success)throw 0;var d=j.data,acts=d.activities||[];
    var st=acts.some(function(a){return a.type===1})?'streaming':d.discord_status;if(!LABEL[st])st='offline';
    var custom=(acts.find(function(a){return a.type===4})||{}).state,el=document.getElementById('status');el.textContent='';
    var dot=document.createElement('span');dot.className='dot '+st;dot.setAttribute('aria-hidden','true');
    var tx=document.createElement('span');tx.textContent=LABEL[st]+(custom?' - '+custom:'');el.append(dot,tx);
    var act=acts.find(function(a){return a.type!==4&&a.name!=='Spotify'}),box=document.getElementById('activity'),card=document.getElementById('activity-card');
    card.textContent='';
    if(act){row(card,'act-type',TYPE[act.type]||'Activity');row(card,'act-name',act.name);row(card,'act-sub',act.details);row(card,'act-sub',act.state);box.hidden=false}
    else if(d.listening_to_spotify&&d.spotify){row(card,'act-type','Listening to Spotify');row(card,'act-name',d.spotify.song);row(card,'act-sub',(d.spotify.artist||'').replace(/;\s*/g,', '));box.hidden=false}
    else box.hidden=true;
  }).catch(function(){});
}
discord();var timer=setInterval(discord,30000);
document.addEventListener('visibilitychange',function(){clearInterval(timer);if(!document.hidden){discord();timer=setInterval(discord,30000)}});

})();

(function(){
var closed=false;
var TARGET=new Date('2026-10-18T13:30:00+11:00').getTime();   // 18 Oct 2026, 1:30 PM AEDT - the same moment for every visitor
var intro=document.getElementById('intro'),inert=document.querySelectorAll('header,main,footer,.skip');
document.body.classList.add('intro-on');inert.forEach(function(e){e.inert=true});

var title=document.getElementById('title');
'Codux.xyz'.split('').forEach(function(ch,i){var s=document.createElement('span');s.textContent=ch;s.style.setProperty('--i',i);s.setAttribute('aria-hidden','true');if(i>=5)s.className='x';title.appendChild(s)});

var cd=document.getElementById('cd'),nums=[];
['Days','Hours','Minutes','Seconds'].forEach(function(l,i){
  var c=document.createElement('div');c.className='cell';c.style.setProperty('--c',i);
  var n=document.createElement('div');n.className='num';var lab=document.createElement('div');lab.className='lab';lab.textContent=l;
  c.append(n,lab);cd.appendChild(c);nums.push(n)});
function pad(n){return n<10?'0'+n:''+n}
function setNum(i,s,instant){var el=nums[i];if(el.dataset.v===s)return;el.dataset.v=s;
  if(instant){el.querySelectorAll('.n').forEach(function(o){o.remove()});var f=document.createElement('span');f.className='n';f.textContent=s;el.appendChild(f);return}
  var cur=el.querySelector('.n:not(.out)'),nw=document.createElement('span');nw.className='n in';nw.textContent=s;el.appendChild(nw);
  if(cur){cur.classList.add('out');setTimeout(function(){cur.remove()},500)}}

// Driven by requestAnimationFrame + the real clock (never a counter), so it can't drift or pause.
// After the tab was in the background it snaps straight to the correct time instead of replaying old ticks.
var done=false;
// Fade a line of text out, swap it, fade the new text in
function swap(el,text){
  if(!el.animate||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=text;return}
  var o=el.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-6px)'}],{duration:260,fill:'forwards'});
  o.onfinish=function(){el.textContent=text;o.cancel();el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}}
// Countdown reached zero: remove the countdown, keep the screen, and open the Enter button to everyone
function finish(instant){
  if(done)return;done=true;
  bye();                                                     // hide the "locked" notification if it is showing
  var k=document.getElementById('kicker'),dt=document.getElementById('idate'),wrap=cd.parentNode;
  if(instant){                                               // page opened after the date: no countdown at all
    k.textContent="We're live";dt.textContent='Click below to enter';wrap.remove();intro.classList.add('live');return}
  for(var i=0;i<4;i++)setNum(i,'00',false);
  setTimeout(function(){intro.classList.add('live');swap(k,"We're live");swap(dt,'Click below to enter')},700);
  setTimeout(function(){wrap.remove()},2000)}
var raf,lastSec=null;
function render(){
  var d=TARGET-Date.now();
  if(d<=0){finish(lastSec===null);return true}
  var sec=Math.floor(d/1000);
  if(sec===lastSec)return false;
  var instant=lastSec===null||Math.abs(lastSec-sec)>2;     // first paint, or returning from another tab
  lastSec=sec;
  setNum(0,pad(Math.floor(d/86400000)),instant);setNum(1,pad(Math.floor(d/3600000)%24),instant);
  setNum(2,pad(Math.floor(d/60000)%60),instant);setNum(3,pad(sec%60),instant);
  return false}
function loop(){if(!render())raf=requestAnimationFrame(loop)}
loop();
document.addEventListener('visibilitychange',function(){if(!document.hidden&&!closed){cancelAnimationFrame(raf);lastSec=null;loop()}});

var btn=document.getElementById('enter');
var LOCK='data:image/png;base64,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';
var current=null,hideTimer=null;
function bye(){
  if(!current||current.classList.contains('out'))return;
  var n=current;clearTimeout(hideTimer);n.classList.add('out');
  setTimeout(function(){n.remove();if(current===n)current=null},500)}
// One single notification, always the same text. Clicking again never adds another one.
function notify(){
  if(current){
    if(current.classList.contains('out')){current.remove();current=null}
    else{clearTimeout(hideTimer);hideTimer=setTimeout(bye,5000);return}
  }
  var n=document.createElement('div');n.className='toast';n.setAttribute('role','status');current=n;
  var ic=document.createElement('img');ic.className='lock';ic.src=LOCK;ic.alt='';
  var tx=document.createElement('span');tx.className='tx';tx.textContent='Everyone else is waiting patiently\u2026 what makes you so special?';
  var x=document.createElement('button');x.type='button';x.className='x2';x.setAttribute('aria-label','Dismiss');x.textContent='\u00D7';
  n.append(ic,tx,x);document.body.appendChild(n);
  n.addEventListener('click',bye);hideTimer=setTimeout(bye,5000)}
// Entry is locked until the countdown ends: a click only shakes the button and shows the notification
function deny(){
  notify();
  if(btn.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)
    btn.animate([{transform:'translateX(0)'},{transform:'translateX(-9px)'},{transform:'translateX(8px)'},{transform:'translateX(-6px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:420,easing:'ease-out'})}
function enter(){if(closed)return;var left=TARGET-Date.now();if(left>0){deny();return}closed=true;cancelAnimationFrame(raf);intro.classList.add('leaving');document.body.classList.remove('intro-on');
  inert.forEach(function(e){e.inert=false});
  setTimeout(function(){intro.remove();window.scrollTo(0,0)},1000)}
btn.addEventListener('click',enter);
setTimeout(function(){btn.focus({preventScroll:true})},1900);
})();

(function(){
var root=document.documentElement,btn=document.getElementById('theme');
var sun='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var moon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
var mq=matchMedia('(prefers-color-scheme: dark)');
function isDark(){var t=root.dataset.theme;return t?t==='dark':mq.matches}
function paint(){var d=isDark(),m=document.querySelector('meta[name="theme-color"]');
  btn.innerHTML=d?sun:moon;btn.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme');if(m)m.content=d?'#000000':'#ffffff'}
try{var s=localStorage.getItem('theme');if(s==='light'||s==='dark')root.dataset.theme=s}catch(e){}
paint();
btn.addEventListener('click',function(){var n=isDark()?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}paint()});
if(mq.addEventListener)mq.addEventListener('change',paint);

var bar=document.getElementById('progress'),busy=false;
function prog(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(scrollY/h,1):0)+')';busy=false}
addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(prog)}},{passive:true});prog();

if('IntersectionObserver' in window){
  var els=document.querySelectorAll('.about,.facts>div,.chip,.job,.proj,.social,.lead');
  els.forEach(function(e){e.classList.add('rv')});
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(!en.isIntersecting)return;var e=en.target;io.unobserve(e);
    e.style.setProperty('--d',Math.min([].indexOf.call(e.parentNode.children,e),6)*70+'ms');
    requestAnimationFrame(function(){e.classList.add('in')});
    setTimeout(function(){e.classList.remove('rv','in');e.style.removeProperty('--d')},1500)})},{threshold:.12});
  els.forEach(function(e){io.observe(e)});
}
})();
