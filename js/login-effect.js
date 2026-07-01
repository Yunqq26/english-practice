// ===== Three.js 粒子登录效果 =====
// 依赖：Three.js（CDN 加载）

(function() {
  let scene, camera, renderer, particles, particleGeo;
  let targetPositions = [];
  let mouseX = 0, mouseY = 0;
  let animationId = null;
  let progress = 0; // 0-1 聚合进度
  const PARTICLE_COUNT = window.innerWidth < 768 ? 1200 : 3500;
  const AGGREGATE_DURATION = 2.0; // 秒
  let startTime = null;
  let onComplete = null;

  // ===== 小新头像轮廓点阵 =====
  function generateShinchanSilhouette(count) {
    const points = [];
    // 小新头部特征：圆脸、粗眉毛、大嘴轮廓
    // 使用极坐标 + 变形来近似头部形状
    for (let i = 0; i < count; i++) {
      let x, y, valid = false;
      let attempts = 0;
      while (!valid && attempts < 200) {
        attempts++;
        const angle = Math.random() * Math.PI * 2;
        // 头部基本形状：横向略椭圆的圆形，下巴略收窄
        const r = 0.3 + Math.random() * 0.6;
        let rx = 1.0, ry = 1.0;
        // 头部：上面宽下面窄
        const topRatio = Math.sin(angle) * 0.15;
        rx = 1.0 - Math.abs(Math.sin(angle * 0.5)) * 0.1;
        ry = 1.0 - topRatio * 0.3;
        const br = r * 0.85;
        let px = Math.cos(angle) * br * rx;
        let py = Math.sin(angle) * br * ry - 0.05;
        // 添加特征：顶部头发凸起
        if (py < -0.5 && Math.abs(px) < 0.2) {
          py += (Math.random() * 0.15);
        }
        // 眉毛区域：在脸上半部加粗
        const inEyebrow = (py > -0.15 && py < 0.05 && Math.abs(px) > 0.2 && Math.abs(px) < 0.55);
        // 嘴巴区域
        const inMouth = (py > 0.25 && py < 0.4 && Math.abs(px) < 0.35);
        // 随机采样，使眉毛区域密度更高
        const densityBias = inEyebrow ? 3.0 : (inMouth ? 1.5 : 1.0);
        if (Math.random() > 1.0 / densityBias) continue;

        // 检查是否在头部轮廓内（用简单椭圆检测）
        const ex = px / 0.85;
        const ey = py / (0.9 + Math.sin(angle * 0.3) * 0.1);
        if (ex * ex + ey * ey < 1.0) {
          x = px;
          y = py;
          valid = true;
        }
      }
      if (valid) {
        points.push({ x: x * 2.5, y: y * 2.5 });
      }
    }
    // 确保足够点数
    while (points.length < count) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.5;
      points.push({ x: Math.cos(angle) * r * 2, y: Math.sin(angle) * r * 2 });
    }
    return points.slice(0, count);
  }

  // ===== 初始化 Three.js =====
  function init(canvasContainer, onReady) {
    onComplete = onReady || function(){};

    const container = document.getElementById(canvasContainer) || canvasContainer;
    if (!container) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D0F0C);

    // 相机
    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 5.5;

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 粒子材质
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    // 目标位置（小新轮廓）
    const silhouette = generateShinchanSilhouette(PARTICLE_COUNT);

    // 初始化随机位置和颜色
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 随机起始位置（在 3D 空间散开）
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      // 目标位置（小新轮廓在 XY 平面，Z 在 -0.5 到 0.5 之间）
      const s = silhouette[i] || { x: 0, y: 0 };
      targetPositions.push(s.x, s.y, (Math.random() - 0.5) * 0.6);

      // 颜色：主色为橙黄/肤色 (小新的标志性颜色)
      const isDark = Math.random() > 0.7;
      if (isDark) {
        // 深色轮廓点
        colors[i * 3] = 0.08; colors[i * 3 + 1] = 0.08; colors[i * 3 + 2] = 0.1;
      } else {
        // 肤色/橙黄
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.2;
      }
      sizes[i] = 0.02 + Math.random() * 0.04;
    }

    particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 鼠标监听
    document.addEventListener('mousemove', onMouseMove);

    // 窗口缩放
    window.addEventListener('resize', onResize);

    // 开始动画
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
    progress = Math.min(1, elapsed / AGGREGATE_DURATION);

    // 缓动函数（ease-out cubic）
    const t = 1 - Math.pow(1 - progress, 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // 起始位置（从随机位置插值到目标位置）
      const startX = (Math.random() - 0.5) * 10;
      const startY = (Math.random() - 0.5) * 8;
      const startZ = (Math.random() - 0.5) * 4;

      pos[i3] = startX + (targetPositions[i3] - startX) * t;
      pos[i3 + 1] = startY + (targetPositions[i3 + 1] - startY) * t;
      pos[i3 + 2] = startZ + (targetPositions[i3 + 2] - startZ) * t;
    }

    // 聚合完成后微浮动（呼吸效果）
    if (progress >= 1) {
      const breathe = Math.sin(elapsed * 0.5) * 0.03;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3 + 1] += Math.sin(elapsed + i * 0.01) * 0.001;
        pos[i * 3] += Math.cos(elapsed * 0.7 + i * 0.01) * 0.001;
      }

      // 鼠标扰动
      if (Math.abs(mouseX) > 0.1 || Math.abs(mouseY) > 0.1) {
        for (let i = 0; i < Math.min(200, PARTICLE_COUNT); i++) {
          const idx = Math.floor(Math.random() * PARTICLE_COUNT) * 3;
          pos[idx] += mouseX * 0.002;
          pos[idx + 1] += mouseY * 0.002;
        }
      }
    }

    particleGeo.attributes.position.needsUpdate = true;

    // 缓慢旋转视角
    if (progress >= 1) {
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0003;
    }

    renderer.render(scene, camera);

    // 聚合完成回调
    if (progress >= 1 && startTime) {
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
        onComplete = null;
      }
    }
  }

  function cleanup() {
    if (animationId) cancelAnimationFrame(animationId);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    if (particleGeo) particleGeo.dispose();
    scene = camera = renderer = particles = particleGeo = null;
  }

  // 暴露全局接口
  window.ShinchanParticles = {
    init: init,
    cleanup: cleanup
  };
})();
