(function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();})(function(){

/* YEAR */
document.getElementById('y').textContent = new Date().getFullYear();

/* THEME */
var root = document.documentElement;
document.getElementById('themeToggle').addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try{localStorage.setItem('theme', next);}catch(e){}
});

/* INTRO */
(function(){
  var intro = document.getElementById('intro'); if (!intro) return;
  setTimeout(function(){
    intro.animate([{opacity:1},{opacity:0}], {duration:650, easing:'ease-in-out'}).onfinish = function(){ intro.remove(); };
  }, 1100);
})();

/* TYPED SUBTITLE */
(function(){
  var el = document.getElementById('typed'); if (!el) return;
  var words = ["Data Engineering","Automation Architect","Visualization Designer","ETL Pipeline Builder","Power BI Developer"];
  var i=0, len=0, del=false;
  (function loop(){
    var full = words[i];
    el.textContent = del ? full.slice(0, --len) : full.slice(0, ++len);
    var speed = del ? 70 : 110;
    if (!del && len === full.length){ del = true; speed = 1100; }
    if (del && len === 0){ del = false; i = (i+1)%words.length; speed = 450; }
    setTimeout(loop, speed);
  })();
})();

/* PORTRAIT fallback & overlay */
(function(){
  var img = document.getElementById('portrait'), wrap = document.getElementById('photoWrap'), overlay = document.getElementById('missingOverlay');
  function showMissing(){ wrap.classList.add('missing'); overlay.style.display = 'flex'; }
  img.addEventListener('error', showMissing, { once:true });
  if (!img.complete || img.naturalWidth === 0) { setTimeout(function(){ if (!img.complete || img.naturalWidth === 0) showMissing(); }, 300); }
})();

/* CURSOR comet + trail + beam */
var cursor = document.getElementById('cursor'), trail = document.getElementById('trail'), beam = document.getElementById('beam');
var mx=innerWidth/2, my=innerHeight/2, pmx=mx, pmy=my;
addEventListener('mousemove', function(e){
  pmx=mx; pmy=my; mx=e.clientX; my=e.clientY;
  cursor.style.transform = `translate(${mx}px,${my}px)`;
  trail.style.setProperty('--tx', mx + 'px'); trail.style.setProperty('--ty', my + 'px');
  var angle = Math.atan2(my - pmy, mx - pmx);
  beam.style.transform = `translate(${mx-60}px,${my}px) rotate(${angle}rad)`;
});

/* Navbar: hide/reveal + active indicator */
(function(){
  var nav = document.querySelector('.navbar'); if(!nav) return;
  var links = Array.from(document.querySelectorAll('.navlinks a[href^="#"]'));
  var indicator = document.querySelector('.nav-indicator');
  var lastY = window.scrollY, ticking=false;

  function moveIndicator(a){
    if (!a || !indicator) return;
    var r = a.getBoundingClientRect(), pr = a.parentElement.getBoundingClientRect();
    indicator.style.width = r.width + 'px';
    indicator.style.transform = `translateX(${r.left - pr.left}px)`;
  }

  function onScroll(){
    var y = window.scrollY;
    if (y > 140 && y > lastY) { nav.classList.add('hide'); nav.classList.remove('show'); }
    else { nav.classList.remove('hide'); nav.classList.add('show'); }
    nav.classList.toggle('scrolled', y > 10);
    lastY = y;

    var best = null, bestDist = Infinity;
    for (var a of links){
      var id = a.getAttribute('href'); if (!id || id === '#') continue;
      var sec = document.querySelector(id); if(!sec) continue;
      var r = sec.getBoundingClientRect();
      var dist = Math.abs(r.top - window.innerHeight*0.25);
      if (dist < bestDist){ bestDist = dist; best = a; }
    }
    links.forEach(l => l.classList.toggle('is-active', l === best));
    moveIndicator(best);
  }

  window.addEventListener('resize', function(){ var current = document.querySelector('.navlinks a.is-active') || links[0]; moveIndicator(current); });
  window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(function(){ onScroll(); ticking=false; }); ticking=true; }});
  onScroll();
})();

/* Magnetic wobble (nav) + magnet aura (buttons) */
document.querySelectorAll('.navlinks a').forEach(function(el){
  el.addEventListener('mousemove', function(e){
    var r = el.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width/2))/r.width, dy = (e.clientY - (r.top + r.height/2))/r.height;
    el.style.transform = `translate(${dx*6}px, ${dy*4}px)`;
  });
  el.addEventListener('mouseleave', function(){ el.style.transform = 'translate(0,0)'; });
});
document.querySelectorAll('.magnet,[data-jump]').forEach(function(btn){
  btn.addEventListener('mousemove', function(e){
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left)/r.width)*100 + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top)/r.height)*100 + '%');
  });
});

/* ---- WebGL DISPLACEMENT TRANSITIONS ---- */
var transGL = (function(){
  if(!window.THREE) return null;
  var canvas = document.getElementById('transitionGL'); if(!canvas) return null;
  var renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  var vert = `precision highp float; attribute vec2 position; varying vec2 vUv; void main(){vUv=(position+1.0)*0.5; gl_Position=vec4(position,0.,1.);} `;
  var frag = `
    precision highp float; varying vec2 vUv;
    uniform float u_time, u_progress;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y);}
    float fbm(vec2 p){float v=0.; float a=.5; for(int i=0;i<5;i++){v+=a*noise(p); p*=2.0; a*=.5;} return v;}
    void main(){
      vec2 uv = vUv;
      float n = fbm(uv*6.0 + u_time*0.2);
      float dir = smoothstep(0.0,1.0,u_progress);
      float mask = smoothstep(dir-0.15, dir+0.15, uv.x + (n-0.5)*0.18);
      vec3 from = vec3(0.03,0.06,0.10);
      vec3 to   = vec3(0.0,0.9,1.0) * 0.3 + vec3(1.0,0.24,0.70)*0.3;
      vec3 col = mix(from, to, mask);
      float a = 1.0 - smoothstep(0.0, 0.2, u_progress) * smoothstep(0.8, 1.0, u_progress);
      gl_FragColor = vec4(col, a);
    }`;
  var geo = new THREE.BufferGeometry();
  var quad = new Float32Array([-1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1]);
  geo.setAttribute('position', new THREE.BufferAttribute(quad,2));
  var uniforms = { u_time: {value:0}, u_progress: {value:0} };
  var mat = new THREE.RawShaderMaterial({vertexShader:vert, fragmentShader:frag, uniforms, transparent:true});
  var mesh = new THREE.Mesh(geo, mat); scene.add(mesh);

  function fit(){ var dpr=Math.min(2, devicePixelRatio||1); renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight); canvas.style.opacity=0; }
  addEventListener('resize', fit); fit();

  var start=0, running=false, raf;
  function play(duration){
    if(running) return;
    running=true; start=performance.now();
    canvas.style.opacity=1;
    (function loop(){
      var t = (performance.now()-start)/duration; uniforms.u_time.value = performance.now()/1000;
      uniforms.u_progress.value = Math.min(1,t);
      renderer.render(scene,camera);
      if(t<1){ raf=requestAnimationFrame(loop); } else { running=false; canvas.style.opacity=0; }
    })();
  }
  return { play: play };
})();

/* Smooth portal transition + WebGL displacement on anchor clicks */
var portal = document.getElementById('transition');
function portalJump(target, x, y){
  // circular wipe
  portal.style.opacity = 1;
  var maxR = Math.hypot(innerWidth, innerHeight);
  var kf = [
    { clipPath:`circle(0px at ${x}px ${y}px)`, background:`radial-gradient(circle at ${x}px ${y}px, rgba(0,231,255,.85), rgba(255,61,179,.85) 35%, transparent 40%)` },
    { clipPath:`circle(${maxR}px at ${x}px ${y}px)` }
  ];
  portal.animate(kf,{duration:380,easing:'cubic-bezier(.22,.61,.36,1)'}); 
  setTimeout(function(){
    document.querySelector(target)?.scrollIntoView({behavior:'instant'});
    transGL && transGL.play(620); // WebGL displacement overlay
    portal.animate(kf.slice().reverse(),{duration:380,easing:'cubic-bezier(.22,.61,.36,1)'}).onfinish=function(){portal.style.opacity=0;};
  }, 200);
}
document.querySelectorAll('[data-jump]').forEach(function(a){
  a.addEventListener('click', function(e){
    e.preventDefault();
    var r = a.getBoundingClientRect();
    portalJump(a.getAttribute('href'), r.left + r.width/2, r.top + r.height/2);
  });
});

/* Resume modal + FAB */
var modal = document.getElementById('resumeModal');
document.getElementById('openResume')?.addEventListener('click', function(){ modal?.showModal(); });
document.getElementById('closeResume')?.addEventListener('click', function(){ modal?.close(); });
document.getElementById('fabResume')?.addEventListener('click', function(){ modal?.showModal(); });

/* Scroll progress + ambient hue */
var bar = document.getElementById('scrollbar');
function updateBar(){
  var h = document.documentElement;
  var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  bar.style.width = (scrolled * 100) + '%';
  document.body.style.filter = `hue-rotate(${(scrolled*40).toFixed(1)}deg)`;
}
addEventListener('scroll', updateBar); updateBar();

/* Counters */
(function(){
  var started=false;
  function startCounters(){
    if (started) return; started=true;
    document.querySelectorAll('.stat span[data-count]').forEach(function(el){
      var to = parseInt(el.dataset.count,10) || 0, from = 0, dur = 1200, t0=null;
      function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/dur); el.textContent=Math.floor(from+(to-from)*p).toLocaleString(); if(p<1)requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }
  var obs = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){startCounters(); obs.disconnect();} }); }, { threshold:.5 });
  document.querySelector('.hero-stats') && obs.observe(document.querySelector('.hero-stats'));
})();

/* Filters + Flip */
var filters = document.querySelectorAll('.filter');
var cards = Array.from(document.querySelectorAll('.card'));
filters.forEach(function(f){
  f.addEventListener('click', function(){
    filters.forEach(x=>x.classList.remove('active')); f.classList.add('active');
    var tag = f.dataset.filter, state = (window.Flip)?Flip.getState(cards):null;
    cards.forEach(function(c){ var show=(tag==='all'||c.dataset.tags.split(' ').includes(tag)); c.style.display=show?'':'none'; });
    if(state && window.Flip){
      Flip.from(state, { absolute:true, ease:'power2.inOut', duration:.55, stagger:.03,
        onEnter:el=>gsap.fromTo(el,{opacity:0,y:20,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0)',duration:.4}),
        onLeave:el=>gsap.to(el,{opacity:0,y:20,filter:'blur(6px)',duration:.3})
      });
    }
  });
});

/* GSAP section reveals + headline scramble */
try{
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    try{ new SplitType('.title-line',{types:'chars,words'}); gsap.from('.char',{y:80,rotateX:-90,opacity:0,duration:1,stagger:.02,ease:'back.out(1.7)'});}catch(e){}
    gsap.to('.spark path',{ strokeDasharray:500, strokeDashoffset:500, duration:1, ease:'power2.out',
      scrollTrigger:{trigger:'#hero',start:'top 60%'},
      onStart:function(){ var p=document.querySelector('.spark path'); if(!p) return; var len=p.getTotalLength(); p.style.strokeDasharray=len; p.style.strokeDashoffset=len; gsap.to(p,{strokeDashoffset:0,duration:1.2}); gsap.to('.spark',{opacity:1,duration:.6}); }
    });
    document.querySelectorAll('.section').forEach(function(sec){
      gsap.fromTo(sec,{clipPath:'inset(15% 15% 15% 15% round 16px)',opacity:0,y:20},
        {clipPath:'inset(0% 0% 0% 0% round 16px)',opacity:1,y:0,duration:.9,ease:'power3.out',
         scrollTrigger:{trigger:sec,start:'top 80%',
           onEnter:function(){ sec.classList.add('entered'); transGL && transGL.play(520); } }});
      var hl=sec.querySelector('.headline'); if(hl){
        ScrollTrigger.create({trigger:hl,start:'top 85%',once:true,onEnter:function(){
          hl.style.setProperty('--sx',0); var st=document.createElement('style'); st.innerHTML='.headline::after{ transform:scaleX(var(--sx,0)); }'; document.head.appendChild(st);
          gsap.to(hl,{ '--sx':1, duration:.8, ease:'power3.out'});
          scrambleText(hl, hl.textContent);
        }});
      }
    });
    var proxy={skew:0}, setSkew=gsap.quickSetter('.card','skewY','deg');
    ScrollTrigger.create({ onUpdate:function(self){ var s=gsap.utils.clamp(-10,10,self.getVelocity()/-300); if(Math.abs(s)>Math.abs(proxy.skew)){proxy.skew=s; gsap.to(proxy,{skew:0,duration:.6,ease:'power3',overwrite:true});} setSkew(proxy.skew); } });
  }
}catch(e){}

/* VanillaTilt */
window.VanillaTilt && VanillaTilt.init(document.querySelectorAll('.tilt, .chip'), {max:10,speed:700,glare:true,'max-glare':.18,gyroscope:true});

/* DATA RIBBON */
(function(){
  var c = document.getElementById('ribbon'); if(!c) return; var ctx=c.getContext('2d'), dpr=Math.min(2,devicePixelRatio||1);
  var W=innerWidth,H=innerHeight,t=0; function resize(){ W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);} addEventListener('resize',resize); resize();
  function curve(yOff,h){ ctx.beginPath(); ctx.moveTo(0,H*.6+yOff); for(var x=0;x<=W;x+=20){ var y=H*.6+Math.sin((x+t)/180+yOff/80)*30+Math.cos((x-t)/260+yOff/60)*18+yOff; ctx.lineTo(x,y);} ctx.lineWidth=2.2; ctx.strokeStyle=`hsla(${h},100%,60%,.35)`; ctx.stroke(); }
  (function loop(){ var top=document.getElementById('skills')?.getBoundingClientRect().top||0; ctx.clearRect(0,0,W,H); if(top<innerHeight && top>-600){ curve(0,190);curve(22,320);curve(-22,260);} t+=2; requestAnimationFrame(loop); })();
})();

/* CONSTELLATION */
(function(){
  var c = document.getElementById('net'); if(!c) return; var ctx=c.getContext('2d'), dpr=Math.min(2,devicePixelRatio||1);
  var W=innerWidth,H=innerHeight,N=90, pts=[]; function resize(){ W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);} addEventListener('resize',resize); resize();
  for(var i=0;i<N;i++) pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6});
  var mx=W/2,my=H/2; addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  (function loop(){ ctx.clearRect(0,0,W,H);
    for(var i=0;i<N;i++){ var p=pts[i]; p.x+=p.vx;p.y+=p.vy; if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
      var dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy),m=Math.max(0,180-dist)/180;
      ctx.fillStyle=`rgba(255,255,255,${.25+.45*m})`; ctx.beginPath(); ctx.arc(p.x,p.y,1.8+1.8*m,0,Math.PI*2); ctx.fill();
    }
    for(var a=0;a<N;a++){ for(var b=a+1;b<N;b++){ var pa=pts[a],pb=pts[b],dx=pa.x-pb.x,dy=pa.y-pb.y,d=dx*dx+dy*dy; if(d<110*110){ var op=1-d/(110*110); ctx.strokeStyle=`rgba(0,231,255,${.12+op*.25})`; ctx.beginPath(); ctx.moveTo(pa.x,pb.y?pa.y:pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke(); } } }
    requestAnimationFrame(loop);
  })();
})();

/* THREE.js: nebula + starfield warp + ripple pulse */
(function(){
  if(!window.THREE) return; var canvas=document.getElementById('bg'); if(!canvas) return;
  var renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}), scene=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,1,2000); cam.position.z=420;
  var starGeo=new THREE.BufferGeometry(), count=2200, pos=new Float32Array(count*3); for(var i=0;i<count*3;i++) pos[i]=(Math.random()-.5)*1600;
  starGeo.setAttribute('position',new THREE.BufferAttribute(pos,3)); var starMat=new THREE.PointsMaterial({color:0xffffff,size:1.2,opacity:.55,transparent:true}); var stars=new THREE.Points(starGeo,starMat); scene.add(stars);
  var geo=new THREE.PlaneGeometry(2000,1200,1,1);
  var frag=`precision highp float; uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_pulse;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=.52;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/u_res.xy; vec2 p=(uv-.5)*vec2(u_res.x/u_res.y,1.);
      vec2 m=(u_mouse/u_res-.5)*0.8; float t=u_time*.05;
      float ripple = sin(12.0*length(p) - u_time*10.0)*0.08*u_pulse;
      p += normalize(p+0.0001)*ripple;
      float n=fbm(2.2*p+vec2(t,-t)+m*1.5);
      vec3 col=mix(vec3(0.,.91,1.),vec3(1.,.24,.70),smoothstep(.25,.85,n));
      float v=smoothstep(1.,.2,length(p)); col*=v; gl_FragColor=vec4(col,1.);
    }`;
  var vert=`void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `;
  var uniforms={u_res:{value:new THREE.Vector2(1,1)},u_time:{value:0},u_mouse:{value:new THREE.Vector2(-1e3,-1e3)},u_pulse:{value:0}};
  var mat=new THREE.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:frag,transparent:true,depthWrite:false});
  var plane=new THREE.Mesh(geo,mat); plane.position.z=-200; scene.add(plane);
  function resize(){var dpr=Math.min(2,devicePixelRatio||1);renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();uniforms.u_res.value.set(innerWidth*dpr,innerHeight*dpr);}
  addEventListener('resize',resize); resize(); addEventListener('mousemove',e=>uniforms.u_mouse.value.set(e.clientX,innerHeight-e.clientY));
  var start=performance.now(), lastY=scrollY, vel=0, pulse=0;
  addEventListener('scroll',function(){ var ny=scrollY; vel = Math.max(0, Math.min(1.2, Math.abs(ny-lastY)/140)); lastY=ny; pulse=1; });
  (function loop(){
    uniforms.u_time.value=(performance.now()-start)/1000;
    stars.rotation.x+=.0005; stars.rotation.y+=.0008;
    starMat.size = 1.2 + vel*3.5; starMat.opacity = .45 + vel*.35;
    pulse *= 0.94; uniforms.u_pulse.value = pulse;
    renderer.render(scene,cam); requestAnimationFrame(loop);
  })();
})();

/* Morphing blob */
(function(){
  var Path=document.getElementById('morphPath'); if(!Path) return;
  var A="M300,80 C380,90 470,160 500,250 C530,340 500,440 420,490 C340,540 220,540 140,490 C60,440 30,340 60,250 C90,160 220,70 300,80 Z";
  var B="M300,60 C400,80 520,160 520,260 C520,360 420,520 300,520 C180,520 80,360 80,260 C80,160 200,40 300,60 Z";
  Path.setAttribute('d',A); var t=0, dir=1; (function loop(){ t+=dir*0.01; if(t>1||t<0){dir*=-1;t+=dir*0.01;} Path.setAttribute('d', t>.5?A:B); requestAnimationFrame(loop); })();
})();

/* Scramble text */
function scrambleText(el, finalText){
  var chars="!<>-_\\/[]{}—=+*^?#________", frame=0, q=[], from=el.textContent, len=Math.max(from.length,finalText.length);
  for(var i=0;i<len;i++){ var s=Math.floor(Math.random()*20), e=s+Math.floor(Math.random()*20); q.push({from:from[i]||"",to:finalText[i]||"",start:s,end:e,char:""}); }
  cancelAnimationFrame(el._scrambleRaf);
  (function update(){ var out="", done=0;
    for(var i=0;i<q.length;i++){ var a=q[i]; if(frame>=a.end){done++; out+=a.to;}
      else if(frame>=a.start){ if(!a.char||Math.random()<.28){a.char=chars[Math.floor(Math.random()*chars.length)];} out+='<span class="dud">'+a.char+'</span>'; }
      else out+=a.from; }
    el.innerHTML=out; if(done===q.length){el._scrambleRaf=null; return;} frame++; el._scrambleRaf=requestAnimationFrame(update);
  })();
}

/* Card depth hover + sparkle bursts */
(function(){
  document.querySelectorAll('.card').forEach(function(card){
    var xTo=gsap.quickTo(card,'x',{duration:.4,ease:'power3'}), yTo=gsap.quickTo(card,'y',{duration:.4,ease:'power3'}),
        rX=gsap.quickTo(card,'rotateX',{duration:.4,ease:'power3'}), rY=gsap.quickTo(card,'rotateY',{duration:.4,ease:'power3'});
    card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5; xTo(dx*10); yTo(dy*10); rX(-dy*6); rY(dx*6);});
    card.addEventListener('mouseleave',function(){xTo(0); yTo(0); rX(0); rY(0);});
    var sparkWrap=document.createElement('div'); sparkWrap.className='sparkles'; card.appendChild(sparkWrap);
    card.addEventListener('mouseenter', function(ev){
      for(let i=0;i<14;i++){
        let s=document.createElement('span'); s.style.cssText='position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 0 12px rgba(0,231,255,.8);';
        let r=card.getBoundingClientRect(), x=(ev.clientX-r.left), y=(ev.clientY-r.top);
        s.style.left=x+'px'; s.style.top=y+'px';
        sparkWrap.appendChild(s);
        let dx=(Math.random()-.5)*120, dy=(Math.random()-.5)*90, t=450+Math.random()*350;
        s.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.1)`,opacity:0}],{duration:t,easing:'cubic-bezier(.22,.61,.36,1)'}).onfinish=()=>s.remove();
      }
    });
  });
})();

/* Scroll-to About */
document.querySelector('.scroll-indicator')?.addEventListener('click', function(){ document.querySelector('#about')?.scrollIntoView({behavior:'smooth'}); });

/* Page click ripples */
(function(){
  var c = document.getElementById('rippleFx'); if(!c) return; var ctx = c.getContext('2d');
  var DPR = Math.min(2, devicePixelRatio||1);
  function fit(){ c.width=innerWidth*DPR; c.height=innerHeight*DPR; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
  fit(); addEventListener('resize', fit);
  var rings = [];
  addEventListener('pointerdown', function(e){ rings.push({ x:e.clientX, y:e.clientY, r:0, a:1 }); });
  (function loop(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=rings.length-1;i>=0;i--){
      var rg = rings[i]; rg.r += 14; rg.a *= 0.94;
      ctx.strokeStyle = `rgba(0,231,255,${0.25*rg.a})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(255,61,179,${0.20*rg.a})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r*0.65, 0, Math.PI*2); ctx.stroke();
      if(rg.a < 0.02) rings.splice(i,1);
    }
    requestAnimationFrame(loop);
  })();
})();

/* Hero energy sparks */
(function(){
  var sec = document.getElementById('hero'); if(!sec) return;
  var canvas = document.createElement('canvas'); canvas.id='heroSparks'; canvas.style.cssText='position:absolute; inset:auto 0 0 0; height:140px; width:100%; pointer-events:none; z-index:0;';
  sec.appendChild(canvas);
  var ctx = canvas.getContext('2d'), DPR=Math.min(2,devicePixelRatio||1);
  function fit(){ var r=sec.getBoundingClientRect(); canvas.width=r.width*DPR; canvas.height=140*DPR; canvas.style.width=r.width+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
  fit(); addEventListener('resize', fit);
  var sparks = []; function spawn(){ sparks.push({ x: Math.random()*canvas.width/DPR, y: 20+Math.random()*80, vx:(Math.random()-.5)*0.6, vy:0.3+Math.random()*0.6, life: 1 }); }
  setInterval(spawn, 240);
  (function loop(){
    ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);
    for(var i=sparks.length-1;i>=0;i--){
      var s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.life*=0.985;
      var g=ctx.createLinearGradient(s.x-30,s.y-8,s.x+30,s.y+8);
      g.addColorStop(0, `rgba(0,231,255,${.0*s.life})`);
      g.addColorStop(0.5, `rgba(255,255,255,${.45*s.life})`);
      g.addColorStop(1, `rgba(255,61,179,${.0*s.life})`);
      ctx.strokeStyle=g; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(s.x-30, s.y); ctx.lineTo(s.x+30, s.y); ctx.stroke();
      if(s.life < 0.06) sparks.splice(i,1);
    }
    requestAnimationFrame(loop);
  })();
})();

/* PARTICLE NAME REVEAL */
(function(){
  var wrap = document.querySelector('.name-fx'); if(!wrap) return;
  var c = document.getElementById('nameFx'), ctx = c.getContext('2d');
  var DPR = Math.min(2, devicePixelRatio||1);
  function fit(){ c.width = Math.floor(wrap.clientWidth * DPR); c.height = Math.floor(wrap.clientHeight * DPR);
                 c.style.width = wrap.clientWidth + 'px'; c.style.height = wrap.clientHeight + 'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
  fit(); addEventListener('resize', fit);

  var off = document.createElement('canvas'), octx = off.getContext('2d');
  function sample(word, size){
    off.width = wrap.clientWidth; off.height = wrap.clientHeight;
    octx.clearRect(0,0,off.width,off.height);
    octx.fillStyle = '#fff';
    octx.font = `900 ${size}px Inter, ui-sans-serif`;
    octx.textAlign = 'center'; octx.textBaseline = 'middle';
    octx.fillText(word, off.width/2, off.height/2);
    var data = octx.getImageData(0,0,off.width,off.height).data;
    var pts = [], step = 6;
    for(var y=0;y<off.height;y+=step){
      for(var x=0;x<off.width;x+=step){
        var i = (y*off.width + x)*4; if(data[i+3] > 140){ pts.push({x, y}); }
      }
    }
    return pts;
  }
  var targets = sample('Mustafa', 86);
  var particles = Array.from({length: Math.min(1800, targets.length)}, function(_,i){
    var t = targets[i]; return { x: Math.random()*c.width, y: Math.random()*c.height, vx:0, vy:0, tx: t.x, ty: t.y };
  });

  var mouse = {x: -9999, y: -9999};
  c.addEventListener('mousemove', function(e){ var r = c.getBoundingClientRect(); mouse.x = (e.clientX - r.left); mouse.y = (e.clientY - r.top); });
  c.addEventListener('mouseleave', function(){ mouse.x = -9999; mouse.y = -9999; });

  function loop(){
    ctx.clearRect(0,0,c.width, c.height);
    for(var i=0;i<particles.length;i++){
      var p = particles[i];
      var dx = p.tx - p.x, dy = p.ty - p.y;
      p.vx += dx * 0.02; p.vy += dy * 0.02;
      var mdx = (p.x/DPR) - mouse.x, mdy = (p.y/DPR) - mouse.y;
      var md = mdx*mdx + mdy*mdy;
      if(md < 140*140){ var f = (140*140 - md) / (140*140); p.vx += (mdx * f) * 0.15; p.vy += (mdy * f) * 0.15; }
      p.vx *= 0.88; p.vy *= 0.88;
      p.x += p.vx; p.y += p.vy;

      ctx.beginPath(); ctx.arc(p.x/DPR, p.y/DPR, 1.4, 0, Math.PI*2); ctx.fillStyle = 'rgba(0,231,255,.9)'; ctx.fill();
      if(i%7===0){ ctx.beginPath(); ctx.arc(p.x/DPR, p.y/DPR, 0.8, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,61,179,.7)'; ctx.fill(); }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* Hero lights parallax */
(function(){
  var a=document.querySelector('#heroLights .a'), b=document.querySelector('#heroLights .b'); if(!a||!b) return;
  function move(e){
    var x=e.clientX||innerWidth/2, y=e.clientY||innerHeight/2;
    a.style.transform=`translate(${(x-innerWidth/2)*.06}px, ${(y-innerHeight/2)*.03}px)`;
    b.style.transform=`translate(${(x-innerWidth/2)*-.04}px, ${(y-innerHeight/2)*-.02}px)`;
  }
  addEventListener('mousemove', move); move({clientX:innerWidth/2, clientY:innerHeight/2});
})();

/* Meteors */
(function(){
  var c=document.getElementById('meteors'); if(!c) return; var ctx=c.getContext('2d'); var DPR=Math.min(2,devicePixelRatio||1);
  function fit(){ c.width=innerWidth*DPR; c.height=innerHeight*DPR; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; ctx.setTransform(DPR,0,0,DPR,0,0);} fit(); addEventListener('resize',fit);
  var mets=[]; function spawn(){ mets.push({x:Math.random()*innerWidth, y:-20, vx:2+Math.random()*3, vy:6+Math.random()*6, life:1}); }
  setInterval(spawn, 1800);
  (function loop(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=mets.length-1;i>=0;i--){
      var m=mets[i]; m.x+=m.vx; m.y+=m.vy; m.life*=0.985;
      ctx.strokeStyle=`rgba(255,255,255,${.55*m.life})`; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(m.x-18,m.y-12); ctx.lineTo(m.x+18,m.y+12); ctx.stroke();
      if(m.y>innerHeight+30) mets.splice(i,1);
    }
    requestAnimationFrame(loop);
  })();
})();

/* Gooey FAB */
(function(){
  var fab=document.getElementById('fab'), main=document.getElementById('fabMain'); if(!fab||!main) return;
  var items=[].slice.call(fab.querySelectorAll('.fab-item'));
  function layout(open){
    var R=open?88:0, N=items.length;
    items.forEach(function(el, idx){
      var a = (-90 + (idx*(180/(N-1)))) * Math.PI/180;
      var x = Math.cos(a)*R, y = Math.sin(a)*R;
      el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
  }
  layout(false);
  main.addEventListener('click', function(){
    var open = !fab.classList.contains('open');
    fab.classList.toggle('open', open);
    main.setAttribute('aria-expanded', String(open));
    layout(open);
    main.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:260});
  });
  document.getElementById('fabTop')?.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); fab.classList.remove('open'); main.setAttribute('aria-expanded','false'); layout(false); });
})();

/* ---------- Pixel-sort portrait hover (canvas overlay) ---------- */
(function(){
  var img = document.getElementById('portrait'), wrap = document.getElementById('photoWrap'); if(!img||!wrap) return;

  var canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
  canvas.style.cssText = 'position:absolute; z-index:3; width:200px; height:200px; border-radius:50%; pointer-events:none; display:none;';
  wrap.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  function brightness(r,g,b){ return 0.2126*r + 0.7152*g + 0.0722*b; }

  function pixelSortFrame(intensity){
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    var frame = ctx.getImageData(0,0,canvas.width,canvas.height);
    var data = frame.data, w = frame.width, h = frame.height;
    var stride = 4; // RGBA
    // Process every 2nd scanline for perf
    for(var y=0; y<h; y+=2){
      var rowStart = y*w*stride;
      // slice into segments and sort by brightness within a mask
      var seg = 6 + Math.floor(intensity*10);
      for(var x=0; x<w; x+=seg){
        var len = Math.min(seg, w - x);
        // collect pixels
        var pixels = [];
        for(var i=0;i<len;i++){
          var off = rowStart + (x+i)*stride;
          pixels.push({r:data[off], g:data[off+1], b:data[off+2], a:data[off+3], br:brightness(data[off],data[off+1],data[off+2])});
        }
        // partially sort: push brighter to the right
        pixels.sort(function(a,b){ return (a.br - b.br) * (Math.random()<0.6 ? 1 : -1); });
        // write back
        for(var i=0;i<len;i++){
          var off = rowStart + (x+i)*stride, p = pixels[i];
          data[off]=p.r; data[off+1]=p.g; data[off+2]=p.b; data[off+3]=p.a;
        }
      }
    }
    ctx.putImageData(frame,0,0);
  }

  var anim=null, start=0;
  function run(){
    canvas.style.display='block';
    start = performance.now();
    cancelAnimationFrame(anim);
    (function loop(){
      var t = (performance.now()-start)/600; // 0..1
      var e = Math.min(1,t);
      pixelSortFrame(e);
      if(e<1) anim = requestAnimationFrame(loop);
      else setTimeout(()=>restore(),120);
    })();
  }

  function restore(){
    cancelAnimationFrame(anim);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.style.display='none';
  }

  wrap.addEventListener('mouseenter', run);
  wrap.addEventListener('mouseleave', restore);
})();

/* Resize housekeeping */
window.addEventListener('resize', function(){
  var c = document.getElementById('rippleFx'); if(c){ var dpr=Math.min(2,devicePixelRatio||1); c.width=innerWidth*dpr; c.height=innerHeight*dpr; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; }
});

});
/* COLLAPSIBLE PROJECT CARDS — SIMPLE CLICK TO EXPAND */
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("expanded");
  });
});
