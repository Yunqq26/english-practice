// ===== Three.js 粒子登录效果（蜡笔小新头像）=====
(function() {
  let scene, camera, renderer, particles, particleGeo, animationId;
  let targetPositions = [], targetColors = [];
  let mouseX = 0, mouseY = 0, startTime, onComplete;
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 1500 : 4000;
  const AGGREGATE_DURATION = 2.0;

  // ===== Canvas 绘制小新头像并采样 =====
  function sampleShinchan(count) {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 背景透明
    ctx.clearRect(0, 0, size, size);

    // ---- 绘制小新标志性面部 ----
    const cx = size / 2, cy = size / 2;

    // 1. 头发（头顶的黑色乱发）
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 50, 50, 25, 0, Math.PI, 0);
    ctx.fill();
    // 头发尖刺
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 14, cy - 55);
      ctx.lineTo(cx + i * 14 + (i % 3) * 6, cy - 75);
      ctx.lineTo(cx + i * 14 + 8, cy - 58);
      ctx.fill();
    }

    // 2. 面部（标志性的豆子脸型）
    ctx.fillStyle = '#f5d6a8';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 5, 55, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    // 脸颊（更宽）
    ctx.beginPath();
    ctx.ellipse(cx - 20, cy + 10, 25, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 20, cy + 10, 25, 30, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. 眉毛（极粗——小新最标志性的特征）
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.roundRect(cx - 40, cy - 28, 30, 8, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + 10, cy - 28, 30, 8, 2);
    ctx.fill();
    // 眉毛外延加粗
    ctx.beginPath();
    ctx.roundRect(cx - 42, cy - 24, 34, 3, 1);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + 8, cy - 24, 34, 3, 1);
    ctx.fill();

    // 4. 眼睛
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(cx - 22, cy - 8, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 22, cy - 8, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. 嘴巴（标志性的大嘴）
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 18, 10, 0, 0, Math.PI);
    ctx.stroke();
    // 嘴巴内部涂红
    ctx.fillStyle = '#d4504a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 17, 9, 0, 0, Math.PI);
    ctx.fill();

    // 6. 腮红
    ctx.fillStyle = 'rgba(255,150,150,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx - 35, cy + 8, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 35, cy + 8, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 7. 耳朵
    ctx.fillStyle = '#e8c48a';
    ctx.beginPath();
    ctx.ellipse(cx - 56, cy, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 56, cy, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- 采样像素 ----
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const samples = [];

    // 权重图：眉毛和眼睛区域提高采样密度
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        if (a < 10) continue; // 跳过透明

        // 判断区域特征
        const isSkin = (r > 200 && g > 160 && b > 100);
        const isDark = (r < 60 && g < 40 && b < 30);
        const isMouth = (r > 180 && g < 100 && b < 100);

        // 权重：深色特征（眉毛/眼睛/头发）提高采样概率
        let weight = 1;
        if (isDark) weight = 3;
        if (isMouth) weight = 1.5;
        if (isSkin) weight = 0.8;

        if (Math.random() < 1 / weight) continue;

        // 映射到 3D 坐标空间 (-3 到 3)
        const px = (x / size - 0.5) * 5.5;
        const py = -(y / size - 0.5) * 5.5;

        // 颜色
        let color = { r: 1, g: 1, b: 1 };
        if (isSkin) { color = { r: 0.95, g: 0.75, b: 0.55 }; }
        else if (isDark) { color = { r: 0.15, g: 0.1, b: 0.06 }; }
        else if (isMouth) { color = { r: 0.83, g: 0.31, b: 0.29 }; }

        samples.push({ x: px, y: py, color: color });
      }
    }

    // shuffle
    for (let i = samples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [samples[i], samples[j]] = [samples[j], samples[i]];
    }

    return samples.slice(0, count);
  }

  // ===== 初始化 Three.js =====
  function init(containerId, callback) {
    onComplete = callback || function(){};
    const container = document.getElementById(containerId);
    if (!container) { if (onComplete) onComplete(); return; }

    const w = window.innerWidth;
    const h = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D0F0C);

    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = isMobile ? 6.5 : 5.5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 采样小新头像
    const samples = sampleShinchan(PARTICLE_COUNT);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 随机起始位置
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // 目标位置
      const s = samples[i] || { x: 0, y: 0, color: { r: 0.5, g: 0.5, b: 0.5 } };
      targetPositions[i * 3] = s.x;
      targetPositions[i * 3 + 1] = s.y;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

      targetColors[i * 3] = s.color.r;
      targetColors[i * 3 + 1] = s.color.g;
      targetColors[i * 3 + 2] = s.color.b;

      colors[i * 3] = s.color.r;
      colors[i * 3 + 1] = s.color.g;
      colors[i * 3 + 2] = s.color.b;
      sizes[i] = isMobile ? 0.06 + Math.random() * 0.08 : 0.04 + Math.random() * 0.06;
    }

    particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.15 : 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // 环境光晕（用半透明球体）
    const glowGeo = new THREE.SphereGeometry(3, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x2F5D50,
      transparent: true,
      opacity: 0.06,
      wireframe: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -2;
    scene.add(glow);

    startTime = Date.now();
    animate();
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (!particles || !particleGeo) return;

    const pos = particleGeo.attributes.position.array;
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min(1, elapsed / AGGREGATE_DURATION);
    const t = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    // 保存初始随机位置（第一次动画时缓存）
    if (!animate._initPos) {
      animate._initPos = new Float32Array(pos);
    }
    const initPos = animate._initPos;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = initPos[i3] + (targetPositions[i3] - initPos[i3]) * t;
      pos[i3 + 1] = initPos[i3 + 1] + (targetPositions[i3 + 1] - initPos[i3 + 1]) * t;
      pos[i3 + 2] = initPos[i3 + 2] + (targetPositions[i3 + 2] - initPos[i3 + 2]) * t;
    }

    particleGeo.attributes.position.needsUpdate = true;

    // 聚合完成后：呼吸浮动 + 缓慢旋转
    if (progress >= 1) {
      const breathe = Math.sin(elapsed * 0.6) * 0.02;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pos[i3] += Math.cos(elapsed * 0.4 + i * 0.005) * 0.002;
        pos[i3 + 1] += Math.sin(elapsed * 0.5 + i * 0.005) * 0.002 + breathe * 0.3;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 鼠标扰动
      if (Math.abs(mouseX) > 0.1 || Math.abs(mouseY) > 0.1) {
        for (let i = 0; i < Math.min(300, PARTICLE_COUNT); i++) {
          const idx = Math.floor(Math.random() * PARTICLE_COUNT) * 3;
          pos[idx] += mouseX * 0.003;
          pos[idx + 1] += mouseY * 0.003;
        }
      }

      particles.rotation.y += 0.003;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.03;
    }

    renderer.render(scene, camera);

    // 聚合完成回调
    if (progress >= 1 && startTime && onComplete) {
      onComplete();
      onComplete = null;
    }
  }

  function cleanup() {
    if (animationId) cancelAnimationFrame(animationId);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    if (particleGeo) particleGeo.dispose();
    scene = camera = renderer = particles = particleGeo = null;
    animate._initPos = null;
    targetPositions = [];
    targetColors = [];
  }

  window.ShinchanParticles = { init, cleanup };
})();
