/* Diorama 3D Realistis Ruang Kerajaan Matan — Berbasis Referensi Arsitektur & Sejarah Ketapang */
window.buildMatanExhibit = function (T, kind) {
  const g = new T.Group();
  const B = T.BoxGeometry, C = T.CylinderGeometry, S = T.SphereGeometry, Cone = T.ConeGeometry;

  // Pembuat tekstur kanvas prosedural untuk serat kayu ulin, ukiran Melayu, air sungai, dan kain tenun
  function makeTex(w, h, draw, rx = 1, ry = 1) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    draw(cv.getContext('2d'), w, h);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 4;
    return t;
  }

  // Tekstur Papan Kayu Ulin & Pucuk Rebung Melayu
  const woodTex = makeTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#4e3422'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 64; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(28,15,6,0.22)' : 'rgba(145,98,58,0.16)';
      ctx.fillRect(0, i * 4, w, 2);
    }
  }, 2, 2);

  // Tekstur Dinding Kuning Kerajaan & Lis Hijau Zamrud (Khas Keraton Matan pada foto9.jpg & foto36.jpg)
  const palaceWallTex = makeTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#eab82e'; ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 12) {
      ctx.fillStyle = 'rgba(160,110,10,0.18)'; ctx.fillRect(x, 0, 2, h);
    }
    // Sabuk bawah hijau zamrud & lis emas
    ctx.fillStyle = '#186a4b'; ctx.fillRect(0, h - 42, w, 42);
    ctx.fillStyle = '#14523a'; ctx.fillRect(0, 0, w, 16);
    ctx.fillStyle = '#f7d665'; ctx.fillRect(0, h - 46, w, 4);
    // Jendela berbingkai hijau-biru & ventilasi kerawang
    for (let i = 0; i < 3; i++) {
      const wx = 26 + i * 78, wy = 48;
      ctx.fillStyle = '#145a48'; ctx.fillRect(wx - 4, wy - 4, 48, 96);
      ctx.fillStyle = '#d99e1e'; ctx.fillRect(wx, wy, 40, 88);
      ctx.strokeStyle = '#145a48'; ctx.lineWidth = 3;
      ctx.strokeRect(wx + 3, wy + 3, 16, 82); ctx.strokeRect(wx + 21, wy + 3, 16, 82);
    }
  }, 2, 1);

  // Tekstur Teralis Silang Kuning-Hijau Serambi Keraton (Sesuai foto9.jpg & foto36.jpg)
  const latticeTex = makeTex(256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#165e43'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#f2c335'; ctx.lineWidth = 5;
    for (let x = -h; x < w + h; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x + h - 16, h - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, h - 8); ctx.lineTo(x + h - 16, 8); ctx.stroke();
    }
    ctx.fillStyle = '#f2c335'; ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8);
  }, 3, 1);

  // Tekstur Ukiran Kerawang Cokelat-Emas Gerbang Keraton (Sesuai foto36.jpg)
  const carvingTex = makeTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#4a2b1d'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const cx = i * 32 + 16;
      ctx.beginPath(); ctx.arc(cx, h / 2, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 10, 12); ctx.lineTo(cx, h - 12); ctx.lineTo(cx + 10, 12); ctx.stroke();
    }
    ctx.fillStyle = '#e6b842'; ctx.fillRect(0, 0, w, 6); ctx.fillRect(0, h - 6, w, 6);
  }, 2, 1);

  // Tekstur Air Sungai Pawan Beriak
  const waterTex = makeTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2d6870'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 12 + Math.random() * 26;
      ctx.strokeStyle = i % 2 ? 'rgba(165,220,220,0.32)' : 'rgba(30,80,88,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l * 0.5, y + 3, x + l, y); ctx.stroke();
    }
  }, 3, 2);

  // Tekstur Pita Pucuk Rebung Meja Koleksi
  const bandTex = makeTex(512, 64, (ctx, w, h) => {
    ctx.fillStyle = '#1c3830'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c99b46'; ctx.fillRect(0, 0, w, 5); ctx.fillRect(0, h - 5, w, 5);
    for (let x = 16; x < w; x += 32) {
      ctx.fillStyle = '#d8aa4c';
      ctx.beginPath(); ctx.moveTo(x - 11, h - 8); ctx.lineTo(x, 10); ctx.lineTo(x + 11, h - 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7a2822';
      ctx.beginPath(); ctx.arc(x, h - 16, 4, 0, Math.PI * 2); ctx.fill();
    }
  }, 2, 1);

  const matCache = {};
  function std(color, roughness = 0.68, metalness = 0.06, map = null) {
    const k = `${color}_${roughness}_${metalness}_${map ? map.uuid : ''}`;
    if (!matCache[k]) matCache[k] = new T.MeshStandardMaterial({color, roughness, metalness, map});
    return matCache[k];
  }

  const M = {
    wood: std(0x523624, 0.72, 0.05, woodTex),
    darkUlin: std(0x2c1d14, 0.78, 0.05, woodTex),
    gold: std(0xdba948, 0.32, 0.62),
    brass: std(0xc4933b, 0.38, 0.55),
    green: std(0x1d4d3e, 0.65, 0.05),
    emerald: std(0x166849, 0.58, 0.06),
    royalYellow: std(0xefc034, 0.55, 0.06),
    palaceWall: std(0xffffff, 0.62, 0.04, palaceWallTex),
    lattice: std(0xffffff, 0.6, 0.04, latticeTex),
    carving: std(0xffffff, 0.65, 0.08, carvingTex),
    cream: std(0xf2e6c9, 0.7, 0.03),
    red: std(0x8c2922, 0.55, 0.06),
    velvet: std(0xa62420, 0.48, 0.08),
    roofShingle: std(0x5e3c28, 0.82, 0.04, woodTex),
    greenRoof: std(0x236649, 0.65, 0.08),
    water: std(0x7fc4cc, 0.22, 0.25, waterTex),
    iron: std(0x23272a, 0.42, 0.65),
    stone: std(0x9a9688, 0.85, 0.04),
    terrain: std(0x4c7344, 0.88, 0.02),
    foliage1: std(0x2e6936, 0.82, 0.02),
    foliage2: std(0x3f8242, 0.8, 0.02)
  };

  function add(geo, mat, x = 0, y = 0, z = 0, par = g) {
    const m = new T.Mesh(geo, mat.isMaterial ? mat : std(mat));
    m.position.set(x, y, z);
    par.add(m);
    return m;
  }
  const box = (w, h, d, x, y, z, m, par = g) => add(new B(w, h, d), m, x, y, z, par);
  const cyl = (rt, rb, h, x, y, z, m, seg = 16, par = g) => add(new C(rt, rb, h, seg), m, x, y, z, par);
  const sph = (r, x, y, z, m, sx = 1, sy = 1, sz = 1, par = g) => {
    const o = add(new S(r, 16, 12), m, x, y, z, par);
    o.scale.set(sx, sy, sz);
    return o;
  };
  const piv = (x = 0, y = 0, z = 0, par = g) => {
    const o = new T.Group();
    o.position.set(x, y, z);
    par.add(o);
    return o;
  };
  const tube = (pts, r, m, par = g, seg = 24) => {
    const curve = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)));
    return add(new T.TubeGeometry(curve, seg, r, 8, false), m, 0, 0, 0, par);
  };

  function plaque(lines, w, h, x, y, z, par = g) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = Math.max(128, Math.round(1024 * h / w));
    const c = canvas.getContext('2d'), H = canvas.height;
    c.fillStyle = '#1c3b33'; c.fillRect(0, 0, 1024, H);
    c.strokeStyle = '#d4a64a'; c.lineWidth = 8; c.strokeRect(12, 12, 1000, H - 24);
    c.strokeStyle = 'rgba(212,166,74,0.35)'; c.lineWidth = 3; c.strokeRect(24, 24, 976, H - 48);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((line, i) => {
      let size = lines.length > 2 ? 34 : (i === 0 ? 44 : 32);
      c.font = (i === 0 ? 'bold ' : '') + size + 'px Georgia, serif';
      while (c.measureText(line).width > 930 && size > 16) {
        size--;
        c.font = (i === 0 ? 'bold ' : '') + size + 'px Georgia, serif';
      }
      c.fillStyle = i === 0 ? '#f7e4b2' : '#dfd3b8';
      c.fillText(line, 512, H * (i + 1) / (lines.length + 1));
    });
    const p = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: new T.CanvasTexture(canvas)}));
    p.position.set(x, y, z);
    par.add(p);
    return p;
  }

  // Komponen Pohon Hutan Tropis Miniatur
  function addMiniTree(par, x, y, z, sc = 1) {
    cyl(0.015 * sc, 0.022 * sc, 0.16 * sc, x, y + 0.08 * sc, z, M.wood, 8, par);
    sph(0.075 * sc, x, y + 0.18 * sc, z, M.foliage1, 1.1, 0.9, 1.1, par);
    sph(0.055 * sc, x + 0.03 * sc, y + 0.23 * sc, z - 0.02 * sc, M.foliage2, 1, 0.85, 1, par);
  }

  // Komponen Perahu Lanchang Kuning / Kapal Layar Nusantara
  function addRoyalBoat(par, x, y, z, sc = 1, isPinisi = false) {
    const bg = piv(x, y, z, par);
    bg.scale.setScalar(sc);
    // Lambung perahu berukir
    const hull = sph(0.28, 0, 0.04, 0, isPinisi ? M.darkUlin : M.wood, 1.45, 0.28, 0.42, bg);
    box(0.58, 0.025, 0.18, 0, 0.08, 0, M.gold, bg);
    // Haluan & Buritan melengkung
    for (const s of [-1, 1]) {
      const prow = add(new Cone(0.035, 0.18, 8), M.gold, s * 0.38, 0.12, 0, bg);
      prow.rotation.z = -s * 0.65;
    }
    if (isPinisi) {
      // Kabin dek & dua tiang layar Kapal Pinisi Bugis (Opu Lima)
      box(0.28, 0.09, 0.13, -0.04, 0.13, 0, M.wood, bg);
      box(0.30, 0.02, 0.15, -0.04, 0.18, 0, M.gold, bg);
      // Cucur haluan (bowsprit)
      const sprit = cyl(0.008, 0.014, 0.26, 0.42, 0.14, 0, M.wood, 8, bg);
      sprit.rotation.z = -1.15;
      [[-0.08, 0.52, 1], [0.16, 0.44, 0.82]].forEach(([mx, mh, ms]) => {
        cyl(0.012, 0.016, mh, mx, mh / 2 + 0.08, 0, M.wood, 8, bg);
        const sail = box(0.22 * ms, 0.28 * ms, 0.01, mx + 0.02, mh * 0.58 + 0.06, 0, M.cream, bg);
        sail.rotation.y = 0.18;
        box(0.24 * ms, 0.014, 0.014, mx + 0.02, mh * 0.82 + 0.06, 0, M.gold, bg);
        box(0.24 * ms, 0.014, 0.014, mx + 0.02, mh * 0.34 + 0.06, 0, M.gold, bg);
        // Bendera merah-emas di puncak tiang
        box(0.09, 0.035, 0.008, mx - 0.045, mh + 0.07, 0, M.red, bg);
      });
    } else {
      // Lanchang Kerajaan Melayu dengan kajang atap & layar tunggal
      box(0.22, 0.08, 0.12, -0.02, 0.12, 0, M.royalYellow, bg);
      const r = add(new Cone(0.14, 0.08, 4), M.greenRoof, -0.02, 0.19, 0, bg);
      r.rotation.y = Math.PI / 4; r.scale.set(1.3, 1, 0.85);
      cyl(0.01, 0.012, 0.38, 0.12, 0.26, 0, M.gold, 8, bg);
      const sail = box(0.18, 0.22, 0.008, 0.13, 0.28, 0, M.cream, bg);
      sail.rotation.y = 0.2;
    }
    return bg;
  }

  // Komponen Singgasana Kerajaan Berlapis Beludru Merah & Ukiran Emas
  function addRoyalThrone(par, x, y, z, sc = 1, withUmbrella = false) {
    const tg = piv(x, y, z, par);
    tg.scale.setScalar(sc);
    // Alas berundak berlapis karpet merah-emas
    box(0.52, 0.04, 0.46, 0, 0.02, 0, M.gold, tg);
    box(0.44, 0.04, 0.38, 0, 0.06, -0.02, M.velvet, tg);
    // Dudukan & sandaran lengan berukir
    box(0.32, 0.12, 0.26, 0, 0.14, -0.02, M.gold, tg);
    box(0.28, 0.04, 0.24, 0, 0.21, -0.01, M.velvet, tg);
    for (const s of [-1, 1]) {
      box(0.045, 0.14, 0.26, s * 0.15, 0.24, -0.02, M.gold, tg);
      cyl(0.02, 0.025, 0.42, s * 0.16, 0.29, -0.13, M.gold, 10, tg);
      sph(0.032, s * 0.16, 0.52, -0.13, M.gold, 1, 1.3, 1, tg);
    }
    // Sandaran punggung tinggi bermahkota ukiran Melayu
    box(0.30, 0.36, 0.045, 0, 0.36, -0.13, M.gold, tg);
    box(0.24, 0.30, 0.052, 0, 0.36, -0.125, M.velvet, tg);
    sph(0.08, 0, 0.56, -0.13, M.gold, 1.5, 0.9, 0.35, tg);
    add(new Cone(0.045, 0.11, 6), M.gold, 0, 0.64, -0.13, tg);
    if (withUmbrella) {
      // Payung Kebesaran Kerajaan Kuning-Emas Bertingkat Tiga
      cyl(0.012, 0.015, 0.85, -0.22, 0.45, -0.12, M.gold, 10, tg);
      [[0.26, 0.09, 0.76], [0.20, 0.08, 0.84], [0.14, 0.07, 0.91]].forEach(([ur, uh, uy]) => {
        add(new Cone(ur, uh, 16), M.royalYellow, -0.22, uy, -0.12, tg);
        add(new C(ur, ur, 0.018, 16), M.gold, -0.22, uy - uh / 2, -0.12, tg);
      });
    }
    return tg;
  }

  // 1. Meja Podium & Etalase Museum Kerajaan Matan
  box(2.68, 0.15, 1.68, 0, 0.13, 0, M.wood);
  box(2.74, 0.045, 1.74, 0, 0.23, 0, M.gold);
  box(2.56, 0.63, 1.50, 0, 0.57, 0, M.green);
  // Sabuk ornamen Pucuk Rebung mengelilingi badan meja
  box(2.58, 0.14, 1.52, 0, 0.82, 0, std(0xffffff, 0.6, 0.1, bandTex));
  box(2.76, 0.08, 1.78, 0, 0.93, 0, M.gold);
  box(2.66, 0.07, 1.68, 0, 1.00, 0, M.cream);
  // Panel belakang berukir & deretan mahkota Pucuk Rebung emas
  box(2.72, 1.08, 0.085, 0, 1.66, -0.79, M.wood);
  box(2.64, 0.98, 0.02, 0, 1.66, -0.742, M.green);
  [-1.32, 1.32].forEach(px => {
    cyl(0.045, 0.05, 1.16, px, 1.64, -0.78, M.gold, 12);
    sph(0.06, px, 2.25, -0.78, M.gold, 1, 1.3, 1);
  });
  for (let i = 0; i < 11; i++) {
    const motif = add(new Cone(0.085, 0.19, 4), M.gold, -1.15 + i * 0.23, 2.24, -0.75);
    motif.rotation.y = Math.PI / 4;
  }

  const names = {
    matanOrigins: ['01 / JEJAK KERAJAAN TANJUNGPURA – MATAN', 'Negeri Baru • Sukadana • Sungai Matan'],
    matanJourney: ['02 / JEJAK PERPINDAHAN PUSAT KERAJAAN', 'Negeri Baru hingga Muliakerta • Alur Sungai Pawan'],
    matanZainuddin: ['03 / SULTAN MUHAMMAD ZAINUDDIN & OPU LIMA', 'Gusti Jakar Kencana (1665–1724) • Ikatan Nusantara'],
    matanKeraton: ['04 / KERATON MATAN DI MULIAKERTA', 'Panembahan Gusti Muhammad Saunan • Warisan Sejarah']
  };
  plaque(names[kind], 2.52, 0.46, 0, 1.92, -0.728);
  plaque(['GALERI SEJARAH KERAJAAN MATAN', 'Diorama Arsitektur & Sejarah Ketapang'], 2.25, 0.36, 0, 0.54, 0.758);

  const animatedBoats = [], animatedMarkers = [];

  // ============================================================================
  // KOLEKSI 1: matanOrigins (Istana Kuning-Hijau, Menara Anjungan & Meriam Pusaka sesuai foto9.jpg)
  // ============================================================================
  if (kind === 'matanOrigins') {
    // Lanskap halaman istana & tepian Sungai Matan/Pawan
    box(2.48, 0.04, 1.42, 0, 1.05, 0, M.terrain);
    const river = box(2.48, 0.025, 0.34, 0, 1.07, 0.52, M.water);
    // Jalan setapak batu menuju serambi istana
    box(0.36, 0.045, 0.56, -0.18, 1.052, 0.16, M.stone);

    // Bangunan Utama Istana Kuning-Hijau (Kiri-Tengah) sesuai foto9.jpg
    const pal = piv(-0.22, 1.07, -0.16);
    // Fondasi hijau zamrud & dinding kuning kerajaan berjendela hijau
    box(1.38, 0.10, 0.68, 0, 0.05, 0, M.emerald, pal);
    box(1.34, 0.46, 0.64, 0, 0.33, 0, M.palaceWall, pal);
    // Serambi depan beratap miring dengan tiang kuning-hijau & pagar teralis silang (lattice)
    box(1.26, 0.06, 0.28, 0, 0.05, 0.44, M.emerald, pal);
    box(1.22, 0.11, 0.025, 0, 0.13, 0.56, M.lattice, pal);
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      cyl(0.018, 0.018, 0.34, i * 0.27, 0.25, 0.56, M.royalYellow, 8, pal);
    }
    const porchRoof = box(1.32, 0.035, 0.36, 0, 0.42, 0.42, M.roofShingle, pal);
    porchRoof.rotation.x = 0.28;
    box(1.34, 0.025, 0.03, 0, 0.37, 0.59, M.royalYellow, pal);

    // Atap Utama & Anjungan Gable Berhias Mahkota Ukiran Kuning Emas (foto9.jpg)
    const mainRoof = add(new Cone(0.98, 0.38, 4), M.roofShingle, 0, 0.74, 0, pal);
    mainRoof.rotation.y = Math.PI / 4; mainRoof.scale.set(1.08, 1, 0.58);
    // Gable segitiga kuning di tengah atap dengan mahkota puncak
    const gable = add(new Cone(0.38, 0.24, 4), M.royalYellow, 0.08, 0.72, 0.16, pal);
    gable.rotation.y = Math.PI / 4; gable.scale.set(1.1, 1, 0.55);
    add(new Cone(0.025, 0.16, 6), M.gold, 0.08, 0.90, 0.22, pal);
    for (const s of [-1, 1]) {
      const crest = add(new Cone(0.02, 0.11, 5), M.gold, 0.08 + s * 0.07, 0.86, 0.22, pal);
      crest.rotation.z = -s * 0.45;
    }

    // Menara Anjungan 2 Lantai di Sisi Kanan Istana (Ikonik di foto9.jpg)
    const tw = piv(0.68, 1.07, -0.06);
    box(0.54, 0.10, 0.54, 0, 0.05, 0, M.emerald, tw);
    box(0.50, 0.48, 0.50, 0, 0.34, 0, M.palaceWall, tw);
    // Balkon & teralis lantai 2 menara
    box(0.54, 0.04, 0.54, 0, 0.59, 0, M.emerald, tw);
    box(0.52, 0.11, 0.52, 0, 0.66, 0, M.lattice, tw);
    // Tiang-tiang kuning lantai atas menara terbuka
    [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22], [0, 0.22], [-0.22, 0], [0.22, 0]].forEach(([tx, tz]) => {
      cyl(0.016, 0.016, 0.28, tx, 0.75, tz, M.royalYellow, 8, tw);
    });
    const twRoof = add(new Cone(0.46, 0.24, 4), M.roofShingle, 0, 0.99, 0, tw);
    twRoof.rotation.y = Math.PI / 4;
    box(0.62, 0.025, 0.62, 0, 0.88, 0, M.royalYellow, tw);
    add(new Cone(0.02, 0.12, 6), M.gold, 0, 1.15, 0, tw);

    // Meriam Pusaka Besi Tua di atas Dudukan Berundak Kuning-Hijau (Persis Foreground foto9.jpg!)
    const cn = piv(-0.78, 1.07, 0.18);
    cn.rotation.y = 0.42;
    box(0.36, 0.07, 0.22, 0, 0.035, 0, M.emerald, cn);
    box(0.30, 0.05, 0.16, 0, 0.095, 0, M.royalYellow, cn);
    box(0.24, 0.045, 0.13, -0.02, 0.14, 0, M.royalYellow, cn);
    // Laras meriam besi hitam berulir
    const barrel = cyl(0.034, 0.048, 0.44, 0.02, 0.19, 0, M.iron, 16, cn);
    barrel.rotation.z = Math.PI / 2 - 0.08;
    cyl(0.042, 0.042, 0.025, 0.23, 0.208, 0, M.iron, 16, cn).rotation.z = Math.PI / 2 - 0.08;
    sph(0.048, -0.20, 0.172, 0, M.iron, 1, 1, 1, cn);

    // Dermaga Sungai & Perahu Lanchang Kerajaan + Pepohonan
    box(0.24, 0.03, 0.22, 0.32, 1.09, 0.36, M.wood);
    animatedBoats.push(addRoyalBoat(g, 0.68, 1.07, 0.52, 0.72, false));
    [[-1.08, -0.36, 1.1], [-0.96, -0.12, 0.85], [1.06, -0.32, 1.05], [1.02, 0.18, 0.8]].forEach(([tx, tz, ts]) => {
      addMiniTree(g, tx, 1.07, tz, ts);
    });
  }

  // ============================================================================
  // KOLEKSI 2: matanJourney (Peta Relief Alur Sungai Pawan & 7 Situs Pusat Kerajaan + Pendopo Tanjungpura foto11.jpg)
  // ============================================================================
  if (kind === 'matanJourney') {
    // Alas Peta Relief Lembah Sungai Pawan
    box(2.48, 0.045, 1.42, 0, 1.05, 0, M.terrain);
    // Bukit-bukit hijau halus di hulu dan pesisir
    [[-0.95, -0.32, 0.32, 0.12], [-0.35, -0.36, 0.28, 0.10], [0.25, -0.34, 0.30, 0.11], [0.88, -0.28, 0.26, 0.09]].forEach(([hx, hz, hr, hh]) => {
      sph(hr, hx, 1.06, hz, M.foliage1, 1.3, hh / hr, 0.85);
    });

    // Aliran Berkelok Sungai Pawan & Anak Sungai Matan
    const riverPts = [
      [-1.08, 1.082, -0.10], [-0.72, 1.082, 0.24], [-0.36, 1.082, -0.06],
      [0.0, 1.082, 0.26], [0.36, 1.082, -0.04], [0.72, 1.082, 0.24], [1.08, 1.082, 0.02]
    ];
    const mainRiver = tube(riverPts, 0.068, M.water, g, 48);
    mainRiver.scale.y = 0.22;
    mainRiver.position.y = 1.082 * (1 - 0.22);

    // 7 Titik Pusat Pemerintahan dengan Miniatur Ikonik Masing-Masing Situs
    const nodes = [
      [-1.02, -0.08, '1. Negeri Baru'],
      [-0.68, 0.24, '2. Sukadana'],
      [-0.34, -0.06, '3. S. Matan'],
      [0.0, 0.26, '4. Indralaya'],
      [0.34, -0.04, '5. Kartapura'],
      [0.68, 0.24, '6. Tanjungpura'],
      [1.02, 0.02, '7. Muliakerta']
    ];

    nodes.forEach(([nx, nz, label], idx) => {
      const ng = piv(nx, 1.07, nz - 0.16);
      // Alas batu bundar situs
      cyl(0.11, 0.12, 0.03, 0, 0.015, 0, M.gold, 16, ng);
      if (idx === 0) {
        // 1. Negeri Baru: Struktur Bata Candi & Prasasti Awal Tanjungpura
        box(0.14, 0.06, 0.14, 0, 0.06, 0, std(0xa6583c, 0.8), ng);
        box(0.10, 0.06, 0.10, 0, 0.12, 0, std(0xb86848, 0.8), ng);
        add(new Cone(0.05, 0.09, 4), M.gold, 0, 0.19, 0, ng);
      } else if (idx === 5) {
        // 6. Desa Tanjungpura: Pendopo Hijau-Kuning Situs Makam Keramat & Jalan Keramik Hitam-Putih (Persis foto11.jpg!)
        box(0.06, 0.015, 0.18, 0, 0.02, 0.12, M.cream, ng);
        box(0.22, 0.09, 0.16, 0, 0.07, 0, M.royalYellow, ng);
        const gRoof = add(new Cone(0.20, 0.11, 4), M.greenRoof, 0, 0.16, 0, ng);
        gRoof.rotation.y = Math.PI / 4; gRoof.scale.set(1.25, 1, 0.9);
        const porch = add(new Cone(0.08, 0.06, 4), M.greenRoof, 0, 0.12, 0.09, ng);
        porch.rotation.y = Math.PI / 4;
      } else if (idx === 6) {
        // 7. Muliakerta: Miniatur Keraton Kuning-Hijau Bermahkota
        box(0.20, 0.11, 0.15, 0, 0.08, 0, M.palaceWall, ng);
        const kRoof = add(new Cone(0.16, 0.10, 4), M.roofShingle, 0, 0.18, 0, ng);
        kRoof.rotation.y = Math.PI / 4;
        add(new Cone(0.02, 0.07, 6), M.gold, 0, 0.25, 0, ng);
      } else {
        // 2, 3, 4, 5: Balai Kerajaan Panggung Melayu Beratap Limas
        box(0.16, 0.09, 0.13, 0, 0.07, 0, M.cream, ng);
        const r = add(new Cone(0.13, 0.09, 4), idx % 2 ? M.red : M.greenRoof, 0, 0.15, 0, ng);
        r.rotation.y = Math.PI / 4;
      }
      // Tiang penanda nomor emas di atas tiap situs
      const badge = plaque([String(idx + 1)], 0.12, 0.12, 0, 0.34, 0.02, ng);
      animatedMarkers.push(badge);
    });

    // Dua Perahu Menyusuri Jalur Perdagangan & Perpindahan Sungai Pawan
    animatedBoats.push(addRoyalBoat(g, -0.52, 1.07, 0.12, 0.52, false));
    animatedBoats.push(addRoyalBoat(g, 0.52, 1.07, 0.14, 0.52, false));

    plaque([
      '1 Negeri Baru • 2 Sukadana • 3 Sungai Matan • 4 Indralaya',
      '5 Kartapura • 6 Desa Tanjungpura • 7 Muliakerta (Benua Kayong)'
    ], 2.46, 0.36, 0, 1.36, -0.71);
  }

  // ============================================================================
  // KOLEKSI 3: matanZainuddin (Sultan Muhammad Zainuddin / foto10.jpg, Singgasana, & Kapal Pinisi Opu Lima Bugis)
  // ============================================================================
  if (kind === 'matanZainuddin') {
    // Lantai Balairung Istana di Kiri-Tengah & Perairan Pelabuhan Matan di Kanan
    box(1.62, 0.04, 1.38, -0.42, 1.05, 0, M.wood);
    box(1.54, 0.015, 1.28, -0.42, 1.075, 0, M.velvet);
    box(0.88, 0.035, 1.38, 0.80, 1.05, 0, M.water);
    // Dermaga Kayu Penghubung Istana dan Pelabuhan
    box(0.32, 0.04, 0.38, 0.38, 1.08, 0.15, M.wood);

    // 1. Balairung & Singgasana Sultan Muhammad Zainuddin (Sisi Kiri)
    addRoyalThrone(g, -0.82, 1.08, -0.08, 1.05, true);

    // Figur Kehormatan Sultan Muhammad Zainuddin (Terinspirasi foto10.jpg: Sorban Putih-Emas, Jubah Putih, Selempang Tenun Merah-Hitam-Emas & Tongkat)
    const sultan = piv(-0.46, 1.08, 0.06);
    cyl(0.11, 0.13, 0.04, 0, 0.02, 0, M.gold, 16, sultan);
    // Jubah putih panjang & selempang tenun merah-hitam-emas menyilang di dada
    cyl(0.085, 0.105, 0.38, 0, 0.22, 0, M.cream, 16, sultan);
    const sash = box(0.065, 0.36, 0.18, 0.01, 0.24, 0, M.velvet, sultan);
    sash.rotation.z = -0.42;
    const sashStripe = box(0.022, 0.37, 0.185, 0.01, 0.24, 0, M.darkUlin, sultan);
    sashStripe.rotation.z = -0.42;
    const sashGold = box(0.072, 0.36, 0.175, 0.01, 0.24, 0, M.gold, sultan);
    sashGold.rotation.z = -0.42;
    // Bahu, Kepala & Sorban Putih-Merah-Emas khas foto10.jpg
    sph(0.065, 0, 0.47, 0, std(0xc99268, 0.7), 0.92, 1.08, 0.92, sultan);
    const turban = add(new T.TorusGeometry(0.062, 0.024, 10, 20), M.cream, 0, 0.51, 0, sultan);
    turban.rotation.x = Math.PI / 2 - 0.12;
    cyl(0.058, 0.062, 0.055, 0, 0.54, 0, M.velvet, 16, sultan);
    cyl(0.060, 0.060, 0.018, 0, 0.53, 0, M.gold, 16, sultan);
    // Tangan kanan memegang Tongkat Kesultanan berhulu lengkung hitam-emas (foto10.jpg)
    cyl(0.022, 0.026, 0.22, -0.095, 0.30, 0.04, M.cream, 10, sultan).rotation.z = 0.22;
    cyl(0.009, 0.007, 0.34, -0.12, 0.18, 0.08, M.darkUlin, 8, sultan);
    const caneTop = add(new T.TorusGeometry(0.022, 0.009, 8, 12, Math.PI), M.darkUlin, -0.12, 0.35, 0.06, sultan);
    caneTop.rotation.y = Math.PI / 2;

    // 2. Monumen Persaudaraan Opu Lima Bugis (Opu Daeng Menambon & 4 Saudaranya + Ikatan Putri Kesuma)
    const opuGrp = piv(0.02, 1.08, 0.04);
    box(0.68, 0.05, 0.34, 0, 0.025, 0, M.gold, opuGrp);
    box(0.62, 0.04, 0.28, 0, 0.06, 0, M.darkUlin, opuGrp);
    for (let i = 0; i < 5; i++) {
      const ox = (i - 2) * 0.125, isCenter = i === 2;
      const fig = piv(ox, 0.08, 0, opuGrp);
      // Busana Bangsawan Bugis (Jas Tutup Merah/Hitam, Sarung Sabbe Emas, & Songkok Recca)
      cyl(0.032, 0.038, isCenter ? 0.24 : 0.21, 0, isCenter ? 0.12 : 0.105, 0, isCenter ? M.velvet : M.darkUlin, 12, fig);
      cyl(0.036, 0.039, 0.09, 0, 0.06, 0, M.gold, 12, fig);
      sph(0.032, 0, isCenter ? 0.27 : 0.24, 0, std(0xc99268, 0.7), 1, 1.08, 1, fig);
      cyl(0.033, 0.034, 0.035, 0, isCenter ? 0.305 : 0.275, 0, M.darkUlin, 12, fig);
      cyl(0.035, 0.035, 0.012, 0, isCenter ? 0.295 : 0.265, 0, M.gold, 12, fig);
      // Keris Pusaka Bugis terselip di pinggang
      box(0.012, 0.09, 0.018, 0.02, 0.11, 0.035, M.gold, fig).rotation.z = -0.45;
    }

    // 3. Kapal Layar Pinisi Opu Lima Bugis Berlabuh di Perairan Kanan
    const pinisi = addRoyalBoat(g, 0.82, 1.07, 0.08, 1.05, true);
    pinisi.rotation.y = -0.35;
    animatedBoats.push(pinisi);

    plaque([
      'OPU LIMA BUGIS & KESULTANAN MATAN',
      'Opu Daeng Menambon + Putri Kesuma • Ikatan Keluarga & Politik Nusantara'
    ], 1.65, 0.38, 0.22, 1.38, -0.71);
  }

  // ============================================================================
  // KOLEKSI 4: matanKeraton (Anjungan Tangga Kembar Keraton Matan Muliakerta 1924 & Singgasana Kembar sesuai foto36.jpg)
  // ============================================================================
  if (kind === 'matanKeraton') {
    // Halaman Keraton Muliakerta
    box(2.48, 0.04, 1.42, 0, 1.05, 0, M.terrain);
    box(0.56, 0.045, 0.42, 0.18, 1.052, 0.46, M.stone);

    // 1. Sayap Bangunan Utama Keraton Kuning-Hijau di Sisi Kiri (Sesuai foto36.jpg)
    const leftWing = piv(-0.62, 1.07, -0.14);
    box(1.12, 0.12, 0.62, 0, 0.06, 0, M.emerald, leftWing);
    box(1.08, 0.48, 0.58, 0, 0.36, 0, M.palaceWall, leftWing);
    // Serambi berpagar teralis silang kuning-hijau
    box(1.12, 0.04, 0.22, 0, 0.12, 0.38, M.emerald, leftWing);
    box(1.10, 0.10, 0.022, 0, 0.18, 0.48, M.lattice, leftWing);
    for (let i = -2; i <= 2; i++) {
      cyl(0.015, 0.015, 0.36, i * 0.24, 0.30, 0.48, M.royalYellow, 8, leftWing);
    }
    // Atap Sayap Kiri & Anjungan Balkon Lantai 2 (foto36.jpg)
    const lwRoof = add(new Cone(0.84, 0.34, 4), M.roofShingle, 0, 0.76, 0, leftWing);
    lwRoof.rotation.y = Math.PI / 4; lwRoof.scale.set(1.05, 1, 0.62);
    // Dormer/Balkon atas di tengah sayap kiri
    box(0.42, 0.22, 0.36, 0.08, 0.68, 0.18, M.royalYellow, leftWing);
    box(0.46, 0.08, 0.18, 0.08, 0.58, 0.42, M.lattice, leftWing);
    const dmRoof = add(new Cone(0.34, 0.20, 4), M.roofShingle, 0.08, 0.88, 0.18, leftWing);
    dmRoof.rotation.y = Math.PI / 4;
    add(new Cone(0.018, 0.12, 6), M.gold, 0.08, 1.02, 0.18, leftWing);

    // 2. Anjungan Gerbang Utama Bertangga Kembar & Ukiran Kerawang Kayu Ulin (Fokus Utama foto36.jpg!)
    const pavilion = piv(0.18, 1.07, -0.02);
    // Podium panggung bawah berpanel hijau-kuning
    box(0.78, 0.22, 0.68, 0, 0.11, 0, M.emerald, pavilion);
    box(0.80, 0.035, 0.70, 0, 0.22, 0, M.royalYellow, pavilion);
    // Empat Tiang Utama Kayu Ulin Hitam-Cokelat Kokoh (Sesuai foto36.jpg)
    [[-0.34, -0.28], [0.34, -0.28], [-0.34, 0.28], [0.34, 0.28]].forEach(([px, pz]) => {
      box(0.065, 0.62, 0.065, px, 0.52, pz, M.darkUlin, pavilion);
      // Lampu dinding kristal hangat pada tiang depan
      if (pz > 0) {
        sph(0.022, px, 0.56, pz + 0.04, new T.MeshBasicMaterial({color: 0xffe89e}), 1, 1.2, 1, pavilion);
      }
    });
    // Pagar kuning berukir di serambi atas anjungan
    for (const sx of [-0.23, 0.23]) {
      box(0.18, 0.12, 0.025, sx, 0.29, 0.28, M.royalYellow, pavilion);
    }
    // Lengkungan Gerbang Ukiran Kerawang Cokelat-Emas (Archway foto36.jpg)
    box(0.66, 0.16, 0.03, 0, 0.72, 0.28, M.carving, pavilion);
    for (const sx of [-0.28, 0.28]) {
      box(0.12, 0.28, 0.03, sx, 0.54, 0.28, M.carving, pavilion);
    }
    // Lampu Gantung Eropa (Chandelier Kaca Warna-Warni) di bawah plafon kayu ulin (Sesuai foto36.jpg)
    cyl(0.008, 0.008, 0.14, 0, 0.74, 0.04, M.gold, 8, pavilion);
    sph(0.045, 0, 0.65, 0.04, new T.MeshBasicMaterial({color: 0xffdf80}), 1, 1.25, 1, pavilion);
    add(new C(0.055, 0.035, 0.03, 12), M.gold, 0, 0.68, 0.04, pavilion);

    // Atap Pelana Anjungan dengan Lisplang Kuning Berlubang & Mahkota Bubungan Cokelat-Merah Berukir (foto36.jpg)
    for (const s of [-1, 1]) {
      const rSlope = box(0.56, 0.035, 0.82, s * 0.22, 0.94, 0.02, M.roofShingle, pavilion);
      rSlope.rotation.z = -s * 0.48;
      const fascia = box(0.54, 0.065, 0.025, s * 0.21, 0.90, 0.42, M.royalYellow, pavilion);
      fascia.rotation.z = -s * 0.48;
      const crest = box(0.52, 0.05, 0.018, s * 0.20, 0.98, 0.42, M.carving, pavilion);
      crest.rotation.z = -s * 0.48;
    }
    // Puncak Mahkota Bulan Sabit / Sulur di Ujung Bubungan Atap Anjungan
    cyl(0.022, 0.028, 0.14, 0, 1.12, 0.42, M.carving, 10, pavilion);
    sph(0.035, 0, 1.20, 0.42, M.gold, 1, 1, 0.5, pavilion);

    // Tanggadepan Berpagar Kuning-Hijau (Tangga Kembar / Utama di foto36.jpg)
    const stairGrp = piv(0, 0, 0.30, pavilion);
    for (let st = 0; st < 5; st++) {
      box(0.26, 0.04, 0.06, 0, 0.02 + st * 0.042, 0.22 - st * 0.048, M.stone, stairGrp);
    }
    for (const sx of [-0.14, 0.14]) {
      const rail = box(0.03, 0.12, 0.28, sx, 0.14, 0.12, M.royalYellow, stairGrp);
      rail.rotation.x = 0.68;
      const railGreen = box(0.034, 0.06, 0.24, sx, 0.12, 0.12, M.emerald, stairGrp);
      railGreen.rotation.x = 0.68;
      // Tiang pangkal tangga kuning-hijau
      box(0.048, 0.16, 0.048, sx, 0.08, 0.25, M.royalYellow, stairGrp);
      box(0.052, 0.09, 0.052, sx, 0.06, 0.25, M.emerald, stairGrp);
    }

    // 3. Podium Koleksi Museum Keraton di Sisi Kanan: Singgasana Sultan & Permaisuri
    box(0.68, 0.04, 0.56, 0.90, 1.07, 0.12, M.wood);
    box(0.64, 0.015, 0.52, 0.90, 1.095, 0.12, M.velvet);
    addRoyalThrone(g, 0.75, 1.10, 0.10, 0.58, false);
    addRoyalThrone(g, 1.05, 1.10, 0.10, 0.52, false);

    plaque([
      'KERATON MATAN MULIAKERTA (1924)',
      'Masa Panembahan G. M. Saunan (1922–1942) • Kini Museum Bersejarah'
    ], 1.38, 0.36, 0.62, 1.40, -0.71);
  }

  // Kaca Pelindung Samping Etalase (Bagian depan tetap terbuka agar jelas dilihat)
  const glass = new T.MeshPhongMaterial({
    color: 0xc8e4dc, transparent: true, opacity: 0.12, shininess: 90, specular: 0xffffff, depthWrite: false, side: T.DoubleSide
  });
  [-1.32, 1.32].forEach(x => {
    const p = new T.Mesh(new T.PlaneGeometry(1.62, 1.06), glass);
    p.rotation.y = Math.PI / 2;
    p.position.set(x, 1.56, 0);
    g.add(p);
  });

  g.traverse(o => {
    if (o.isMesh && o.material !== glass) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Animasi Halus untuk Perahu, Air Sungai, dan Penanda Situs
  g.userData.anim = t => {
    waterTex.offset.x = (t * 0.04) % 1;
    waterTex.offset.y = Math.sin(t * 0.5) * 0.02;
    animatedBoats.forEach((b, i) => {
      b.position.y = 1.07 + Math.sin(t * 2.2 + i * 1.5) * 0.008;
      b.rotation.z = Math.sin(t * 1.8 + i) * 0.03;
    });
    animatedMarkers.forEach((m, i) => {
      m.position.y = 0.34 + Math.sin(t * 2.5 + i * 0.8) * 0.012;
    });
  };

  return g;
};
