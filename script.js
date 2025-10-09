// --- Core that must always run ---
(function ensureReady(fn){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
})(function(){

  /* YEAR */
  var y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();

  /* THEME TOGGLE (guaranteed) */
  var root = document.documentElement;
  var btnToggle = document.getElementById('themeToggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(e){}
    });
  }

  /* TYPEWRITER — independent, no GSAP needed */
  (function(){
    var el = document.getElementById('typed');
    if (!el) return;
    var words = [
      "Data Engineering",
      "Automation Architect",
      "Visualization Designer",
      "ETL Pipeline Builder",
      "Power BI Developer"
    ];
    var i=0, len=0, del=false;
    function tick(){
      var full = words[i];
      el.textContent = del ? full.slice(0, --len) : full.slice(0, ++len);
      var speed = del ? 70 : 110;
      if (!del && len === full.length){ del = true; speed = 1200; }
      if (del && len === 0){ del = false; i = (i+1)%words.length; speed = 500; }
      setTimeout(tick, speed);
    }
    tick();
  })();

  /* Cursor aura + trail */
  var cursor = document.getElementById('cursor');
  var trail = document.getElementById('trail');
  window.addEventListener('mousemove', function(e){
    if (cursor) cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    if (trail) { trail.style.setProperty('--tx', e.clientX + 'px'); trail.style.setProperty('--ty', e.clientY + 'px'); }
  });

  /* Magnetic hover */
  document.querySelectorAll('.magnet').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - r.left)/r.width)*100 + '%');
      btn.style.setProperty('--my', ((e.clientY - r.top)/r.height)*100 + '%');
    });
  });

  /* VanillaTilt (optional) */
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.tilt, .card, .chip'), { max: 10, speed: 700, glare: true, 'max-glare': .18, gyroscope: true });
  }

  /* Filter buttons (works without libs) */
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('.card');
  filters.forEach(function(f){
    f.addEventListener('click', function(){
      filters.forEach(function(x){ x.classList.remove('active'); });
      f.classList.add('active');
      var tag = f.dataset.filter;
      cards.forEach(function(c){
        var show = tag === 'all' || c.dataset.tags.split(' ').includes(tag);
        c.style.display = show ? '' : 'none';
      });
    });
  });

  // --- Fancy extras if GSAP/Three are available ---
  try {
    // GSAP block (guarded)
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // SplitType title (guarded)
      try { new window.SplitType('.title-line', { types: 'chars,words' });
            gsap.from('.char', { y: 80, rotateX: -90, opacity: 0, duration: 1.0, stagger: 0.02, ease: 'back.out(1.7)' });
      } catch(e) {}

      gsap.from('.hero-photo', { scale: 0.92, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.lead', { opacity: 0, y: 30, duration: 0.6, delay: 0.15 });
      gsap.from('.cta-row .btn', { opacity: 0, y: 24, stagger: 0.08, duration: 0.5, delay: 0.2 });
      gsap.from('.stat', { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 0.25 });

      // Section wipes
      document.querySelectorAll('.section').forEach(function(sec){
        gsap.from(sec, {
          clipPath: 'inset(20% 20% 20% 20% round 20px)',
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 80%' }
        });
      });

      // Depth parallax for project grid (mousemove)
      var grid = document.querySelector('.depth-parallax');
      if (grid) {
        grid.addEventListener('mousemove', function(e){
          var r = grid.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to('.card', { x: x * 15, y: y * 10, rotateY: x * 3, rotateX: -y * 3, duration: 0.4, overwrite: true });
        });
        grid.addEventListener('mouseleave', function(){
          gsap.to('.card', { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.6 });
        });
      }

      // Scroll skew on cards
      var proxy = { skew: 0 }, setSkew = gsap.quickSetter('.card', 'skewY', 'deg');
      ScrollTrigger.create({
        onUpdate: function(self){
          var s = gsap.utils.clamp(-10, 10, self.getVelocity() / -300);
          if (Math.abs(s) > Math.abs(proxy.skew)) {
            proxy.skew = s;
            gsap.to(proxy, { skew: 0, duration: 0.6, ease: 'power3', overwrite: true });
          }
          setSkew(proxy.skew);
        }
      });

      // Parallax hero photo on scroll
      gsap.to('.hero-photo', { yPercent: -8, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 }});
    }

    // THREE.js shader + particles (guarded)
    if (window.THREE) {
      var canvas = document.getElementById('bg');
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      var shaderScene = new THREE.Scene();
      var shaderCam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
      var geo = new THREE.PlaneGeometry(2,2);
      var frag = `
        precision highp float;
        uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
          return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),
                     mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
        float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=.52; } return v; }
        void main(){
          vec2 uv=gl_FragCoord.xy/u_res.xy; vec2 p=(uv-.5)*vec2(u_res.x/u_res.y,1.);
          vec2 m=(u_mouse/u_res-.5)*0.8; float t=u_time*.07; float n=fbm(3.*p+vec2(t,-t)+m*2.);
          vec3 col=mix(vec3(0.,.91,1.), vec3(1.,.24,.70), smoothstep(.3,.8,n));
          float v=smoothstep(1.,.2,length(p)); col*=v; gl_FragColor=vec4(col,1.);
        }`;
      var vert = `void main(){ gl_Position = vec4(position,1.0); }`;
      var uniforms = { u_res:{value:new THREE.Vector2(1,1)}, u_time:{value:0}, u_mouse:{value:new THREE.Vector2(-1e3,-1e3)} };
      var mat = new THREE.ShaderMaterial({ uniforms:uniforms, vertexShader:vert, fragmentShader:frag });
      shaderScene.add(new THREE.Mesh(geo, mat));

      // Particles
      var pScene = new THREE.Scene();
      var pCam = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 1000); pCam.position.z = 400;
      var pGeo = new THREE.BufferGeometry(); var count = 1200; var pos = new Float32Array(count*3);
      for (var i=0;i<count*3;i++) pos[i] = (Math.random()-0.5)*900;
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, opacity: .5, transparent:true });
      var points = new THREE.Points(pGeo, pMat); pScene.add(points);

      function resize(){
        var dpr = Math.min(2, window.devicePixelRatio||1);
        renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight);
        uniforms.u_res.value.set(innerWidth*dpr, innerHeight*dpr);
        pCam.aspect = innerWidth/innerHeight; pCam.updateProjectionMatrix();
      }
      window.addEventListener('resize', resize); resize();
      window.addEventListener('mousemove', function(e){ uniforms.u_mouse.value.set(e.clientX, innerHeight - e.clientY); });

      var start = performance.now();
      (function loop(){
        uniforms.u_time.value = (performance.now()-start)/1000;
        points.rotation.x += 0.0006; points.rotation.y += 0.001;
        renderer.autoClear = true; renderer.render(shaderScene, shaderCam);
        renderer.autoClear = false; renderer.render(pScene, pCam);
        requestAnimationFrame(loop);
      })();
    }
  } catch(e) {
    console.warn('Optional animations skipped', e);
  }

});
