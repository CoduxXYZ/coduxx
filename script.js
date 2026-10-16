/* ============================================
   PORTFOLIO JS - Discord status + intro countdown
   ============================================ */

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
var TARGET=new Date(2026,10,25,0,0,0).getTime();           // 25 November 2026, 00:00 (viewer's local time)
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
var raf,lastSec=null;
function render(){
  var d=TARGET-Date.now();
  if(d<=0){for(var i=0;i<4;i++)setNum(i,'00',true);
    document.getElementById('kicker').textContent="We're live";document.getElementById('idate').textContent='The wait is over';intro.classList.add('live');return true}
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
var JOKES=[
  ['\uD83D\uDEA8','Stop trying to enter before everyone else... the line starts at the back.'],
  ['\uD83D\uDD75\uFE0F','Nice try. We saw you clicking that button like it owes you money.'],
  ['\u23F3','Bold of you to skip the countdown. It\u2019s only {d} away. Totally fine. Totally.'],
  ['\uD83D\uDC22','Patience, young padawan. Good things come to those who stop mashing the button.'],
  ['\uD83D\uDC40','Everyone else is waiting politely. Be like everyone else.'],
  ['\uD83D\uDE44','Yes, the button works. No, that doesn\u2019t mean you\u2019re early.']
];
var tries=0,lastJoke=-1,current=null;
var ESCALATE=[
  ['\uD83E\uDD21','Attempt #{n}. The answer is still no.'],
  ['\uD83E\uDEE1','{n} clicks and counting. Respect the hustle, but no.'],
  ['\uD83D\uDEAA','Attempt #{n}. The door is locked and we threw away the key.']
];
function toast(left){
  tries++;
  var days=Math.ceil(left/86400000),j;
  if(tries>=5){j=ESCALATE[Math.floor(Math.random()*ESCALATE.length)]}
  else{var k;do{k=Math.floor(Math.random()*JOKES.length)}while(k===lastJoke&&JOKES.length>1);lastJoke=k;j=JOKES[k]}
  if(current)current.remove();
  var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');current=t;
  var em=document.createElement('span');em.className='em';em.textContent=j[0];
  var tx=document.createElement('span');tx.className='tx';tx.textContent=j[1].replace('{d}',days+(days===1?' day':' days')).replace('{n}',tries);
  var x=document.createElement('button');x.type='button';x.className='x2';x.setAttribute('aria-label','Dismiss');x.textContent='\u00D7';
  t.append(em,tx,x);document.body.appendChild(t);
  var gone=false;function bye(){if(gone)return;gone=true;t.classList.add('out');setTimeout(function(){t.remove();if(current===t)current=null},500)}
  t.addEventListener('click',bye);setTimeout(bye,5500)}
// Entry is locked until the countdown ends: a click only shakes the button and shows a popup
function deny(left){
  toast(left);
  if(btn.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)
    btn.animate([{transform:'translateX(0)'},{transform:'translateX(-9px)'},{transform:'translateX(8px)'},{transform:'translateX(-6px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:420,easing:'ease-out'})}
function enter(){if(closed)return;var left=TARGET-Date.now();if(left>0){deny(left);return}closed=true;cancelAnimationFrame(raf);intro.classList.add('leaving');document.body.classList.remove('intro-on');
  inert.forEach(function(e){e.inert=false});
  setTimeout(function(){intro.remove();window.scrollTo(0,0)},1000)}
btn.addEventListener('click',enter);
setTimeout(function(){btn.focus({preventScroll:true})},1900);
})();
