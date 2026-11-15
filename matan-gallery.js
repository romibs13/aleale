/* Diorama interpretatif berbasis geometri; bukan replika artefak atau potret tokoh. */
window.buildMatanExhibit = function (T, kind) {
  const g = new T.Group();
  const colors = {wood:0x493326, gold:0xc7a35b, green:0x23483e, cream:0xe9dbbb, red:0x713632, water:0x487d88};
  const materials = {};
  function mesh(geometry, color, x,y,z) {
    const material = materials[color] || (materials[color] = new T.MeshLambertMaterial({color}));
    const m = new T.Mesh(geometry, material); m.position.set(x,y,z); g.add(m); return m;
  }
  const b=(w,h,d,x,y,z,c)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z);
  const cylinder=(r,h,x,y,z,c)=>mesh(new T.CylinderGeometry(r,r,h,12),c,x,y,z);
  function plaque(lines,w,h,x,y,z) {
    const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=Math.round(1024*h/w);
    const c=canvas.getContext('2d'),H=canvas.height;
    c.fillStyle='#23483e';c.fillRect(0,0,1024,H);c.strokeStyle='#c7a35b';c.lineWidth=5;c.strokeRect(12,12,1000,H-24);
    c.textAlign='center'; c.textBaseline='middle';
    lines.forEach((line,i)=>{let size=lines.length>3?34:42;c.font=size+'px Georgia';while(c.measureText(line).width>940){size--;c.font=size+'px Georgia'}c.fillStyle=i===0?'#f2dfaf':'#e0d4bc';c.fillText(line,512,H*(i+1)/(lines.length+1))});
    const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas)}));p.position.set(x,y,z);g.add(p);
  }
  function roof(x,y,z,w,d) {
    const r=mesh(new T.ConeGeometry(1, .55,4),colors.red,x,y,z);r.rotation.y=Math.PI/4;r.scale.set(w/1.414,1,d/1.414);
    b(w+.08,.045,.055,x,y+.28,z,colors.gold);
  }
  function palace(x,y,z,w) {
    b(w,.55,.65,x,y+.36,z,colors.cream);roof(x,y+.9,z,w+.2,.9);
    for(const dx of [-.32,0,.32]){b(.13,.3,.025,x+dx*w,y+.35,z+.337,colors.green)}
    b(w+.2,.08,.85,x,y+.05,z,colors.gold);
    [-.38,.38].forEach(dx=>cylinder(.035,.43,x+dx*w,y+.3,z+.45,colors.cream));
    b(w+.15,.06,.28,x,y+.54,z+.43,colors.cream);
    for(let i=0;i<3;i++)b(w*.5,.055,.13,x,y+.025-i*.025,z+.5+i*.1,colors.wood);
  }
  function throne(x,y,z,scale=1) {
    b(.4*scale,.1,.38*scale,x,y+.22,z,colors.gold);
    b(.34*scale,.38*scale,.09,x,y+.44*scale,z-.16*scale,colors.red);
    [-.19,.19].forEach(dx=>{cylinder(.025,.5*scale,x+dx*scale,y+.33*scale,z-.17*scale,colors.gold);b(.05,.15,.35*scale,x+dx*scale,y+.3*scale,z,colors.gold)});
    mesh(new T.SphereGeometry(.09*scale,10,8),colors.gold,x,y+.69*scale,z-.16*scale);
  }
  function boat(x,y,z,s=1) {
    const hull=mesh(new T.SphereGeometry(1,12,8),colors.wood,x,y,z);hull.scale.set(.32*s,.09*s,.12*s);
    cylinder(.012,.47*s,x,y+.24*s,z,colors.gold);
    const sail=new T.Shape();sail.moveTo(0,0);sail.lineTo(.23*s,0);sail.lineTo(0,.34*s);sail.closePath();
    mesh(new T.ShapeGeometry(sail),colors.cream,x+.018,y+.12*s,z);
  }
  // Plinth, brass edging, recessed glass display and a decorated rear panel.
  b(2.65,.15,1.65,0,.13,0,colors.wood);
  b(2.7,.045,1.7,0,.23,0,colors.gold);
  b(2.55,.63,1.48,0,.57,0,colors.green);
  b(2.75,.09,1.76,0,.92,0,colors.gold);
  b(2.65,.08,1.67,0,1,0,colors.cream);
  b(2.7,1.02,.085,0,1.65,-.78,colors.wood);
  for(let i=0;i<11;i++){
    const motif=mesh(new T.ConeGeometry(.09,.2,3),colors.gold,-1.15+i*.23,2.12,-.72);motif.rotation.z=Math.PI;
  }
  const names={matanOrigins:['01 / JEJAK TANJUNGPURA','Negeri Baru • Sukadana • Sungai Matan'],matanJourney:['02 / PUSAT KERAJAAN','Alur perpindahan • bukan peta geografis'],matanZainuddin:['03 / SULTAN MUHAMMAD ZAINUDDIN','Gusti Jakar Kencana • 1665–1724'],matanKeraton:['04 / WARISAN DI MULIAKERTA','Keraton Matan • sekitar 1924']};
  plaque(names[kind],2.53,.5,0,1.83,-.728);
  plaque(['RUANG KERAJAAN MATAN','Ilustrasi simbolis • bukan replika'],2.3,.4,0,.58,.748);
  if(kind==='matanOrigins') {
    b(2.4,.035,1.3,0,1.06,0,0x99a482);
    b(2.4,.02,.21,0,1.09,.32,colors.water);
    palace(0,1.1,-.1,1.25);
    [-.94,.94].forEach(x=>{b(.3,.2,.26,x,1.2,-.02,colors.wood);roof(x,1.48,-.02,.4,.36)});
    boat(.78,1.15,.33,.6);
  }
  if(kind==='matanJourney') {
    const points=[[-1,0],[-.66,.26],[-.33,0],[0,.26],[.33,0],[.66,.26],[1,0]];
    const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,1.11,z)));
    mesh(new T.TubeGeometry(curve,40,.055,6,false),colors.water,0,0,0);
    points.forEach(([x,z],i)=>{cylinder(.06,.1,x,1.2,z,colors.gold);plaque([String(i+1)],.13,.13,x,1.35,z+.01)});
    plaque(['1 Negeri Baru • 2 Sukadana • 3 Sungai Matan','4 Indralaya • 5 Kartapura','6 Desa Tanjungpura • 7 Muliakerta'],2.48,.43,0,1.38,-.71);
    boat(.5,1.16,.46,.65);
  }
  if(kind==='matanZainuddin') {
    throne(-.68,1.06,0,1.05);
    // Five brass markers represent the brothers without inventing their likenesses.
    for(let i=0;i<5;i++){cylinder(.045,.2,-.02+i*.23,1.19,.25,colors.gold);mesh(new T.SphereGeometry(.065,10,8),colors.gold,-.02+i*.23,1.34,.25)}
    plaque(['OPU LIMA','Opu Daeng Menambon + Putri Kesuma','Ikatan keluarga dan politik'],1.45,.48,.48,1.38,-.7);
    boat(.5,1.12,-.13,.8);
  }
  if(kind==='matanKeraton') {
    palace(-.32,1.08,-.14,1.5);
    throne(.75,1.08,.2,.58);throne(1.08,1.08,.2,.5);
    plaque(['G. Muhammad Saunan','1922–1942','Menurut kajian sejarah 2024'],1.15,.43,.68,1.41,-.71);
  }
  // Glass side walls leave the front clear for viewing and reading.
  const glass=new T.MeshPhongMaterial({color:0xc3ddd5,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide});
  [-1.32,1.32].forEach(x=>{const p=new T.Mesh(new T.PlaneGeometry(1.6,1.05),glass);p.rotation.y=Math.PI/2;p.position.set(x,1.56,0);g.add(p)});
  return g;
};
