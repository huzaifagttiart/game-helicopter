(() => {
"use strict";
const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c7ee);
scene.fog = new THREE.Fog(0x87c7ee, 70, 230);
const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, .1, 500);

scene.add(new THREE.HemisphereLight(0xdaf2ff, 0x65734b, 2.0));
const sun = new THREE.DirectionalLight(0xfff1cf, 2.5);
sun.position.set(-30,60,35); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const green=mat(0x354d35,.48,.35), dark=mat(0x17251d,.4,.4), glass= new THREE.MeshStandardMaterial({color:0x4db6d8,metalness:.45,roughness:.2,transparent:true,opacity:.82});
const groundMat=mat(0x6f8d4e), sandMat=mat(0xb5a06d), rockMat=mat(0x77828b), redMat=mat(0x9d2821,.45,.2), yellowMat=mat(0xffc247,.35,.2);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),groundMat);
ground.rotation.x=-Math.PI/2; ground.position.y=-.8; ground.receiveShadow=true; scene.add(ground);

// Ground patches and roads
for(let i=0;i<24;i++){
 const p=new THREE.Mesh(new THREE.CircleGeometry(5+Math.random()*13,24), i%3===0?sandMat:mat(i%2?0x7b9657:0x657f48));
 p.rotation.x=-Math.PI/2;p.position.set((Math.random()-.5)*240,-.77,(Math.random()-.5)*240);p.scale.y=.45;scene.add(p);
}
const road=new THREE.Mesh(new THREE.PlaneGeometry(12,250),mat(0x555b58));
road.rotation.x=-Math.PI/2;road.position.set(-30,-.75,0);scene.add(road);
for(let z=-120;z<130;z+=12){const line=new THREE.Mesh(new THREE.PlaneGeometry(.35,5),yellowMat);line.rotation.x=-Math.PI/2;line.position.set(-30,-.73,z);scene.add(line);}

// Mountains around arena
for(let i=0;i<45;i++){
 const h=12+Math.random()*35, r=8+Math.random()*18;
 const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,5),rockMat);
 const a=i/45*Math.PI*2, dist=105+Math.random()*45;
 m.position.set(Math.cos(a)*dist,h/2-1,Math.sin(a)*dist);m.rotation.y=Math.random()*Math.PI;m.castShadow=true;scene.add(m);
}
// Buildings / crates / trees
for(let i=0;i<28;i++){
 const x=(Math.random()-.5)*130,z=(Math.random()-.5)*130;
 if(Math.abs(x+30)<12) continue;
 const w=3+Math.random()*7,h=2+Math.random()*5,d=3+Math.random()*7;
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(i%3===0?0x8b9a9e:i%2?0x9a8e70:0x5b6b70));
 b.position.set(x,h/2-.7,z);b.castShadow=true;b.receiveShadow=true;scene.add(b);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.35,d+.3),dark);roof.position.set(x,h-.5,z);scene.add(roof);
}
for(let i=0;i<38;i++){
 const x=(Math.random()-.5)*170,z=(Math.random()-.5)*170;
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,2.2,6),mat(0x5b422a));trunk.position.set(x,.3,z);scene.add(trunk);
 const crown=new THREE.Mesh(new THREE.ConeGeometry(2.1,5,7),mat(0x315b36));crown.position.set(x,3.3,z);crown.castShadow=true;scene.add(crown);
}

// Helicopter model
function buildHelicopter(isEnemy=false){
 const g=new THREE.Group();
 const bodyMat=isEnemy?redMat:green;
 const body=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),bodyMat);
 body.scale.set(1.25,.72,1.85);body.castShadow=true;g.add(body);
 const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.7,16,12),glass);
 cockpit.scale.set(1.02,.52,.78);cockpit.position.set(0,.35,-1.03);g.add(cockpit);
 const tail=new THREE.Mesh(new THREE.CylinderGeometry(.16,.28,4.1,10),bodyMat);
 tail.rotation.x=Math.PI/2;tail.position.set(0,.25,3.1);g.add(tail);
 const fin=new THREE.Mesh(new THREE.BoxGeometry(.12,1.15,.8),bodyMat);fin.position.set(0,.75,4.65);g.add(fin);
 // skids
 for(const x of [-.9,.9]){
  const skid=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,3.2,8),dark);
  skid.rotation.z=Math.PI/2;skid.position.set(x,-.72,.1);g.add(skid);
  for(const z of [-.8,.8]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.65,7),dark);leg.position.set(x*.78,-.42,z);g.add(leg);}
 }
 const rotorGroup=new THREE.Group();rotorGroup.position.y=.85;g.add(rotorGroup);
 const mast=new THREE.Mesh(new THREE.CylinderGeometry(.1,.13,.55,8),dark);mast.position.y=.1;rotorGroup.add(mast);
 for(let i=0;i<4;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.22,.055,7),dark);blade.position.y=.37;blade.rotation.y=i*Math.PI/2;rotorGroup.add(blade);}
 const tailRotor=new THREE.Group();tailRotor.position.set(.28,.55,4.65);g.add(tailRotor);
 for(let i=0;i<3;i++){const bl=new THREE.Mesh(new THREE.BoxGeometry(.09,.15,1.2),dark);bl.rotation.z=i*Math.PI*2/3;tailRotor.add(bl);}
 g.userData.rotor=rotorGroup;g.userData.tailRotor=tailRotor;
 return g;
}
const player=buildHelicopter(false);player.position.set(0,5,18);scene.add(player);
let yaw=0, health=100, level=1, missiles=8, bullets=0, running=false, gameOver=false;
const keys={}; const shots=[], enemies=[], effects=[];
const raycaster=new THREE.Raycaster(), mouse=new THREE.Vector2(0,0);
const hud={health:document.getElementById('health'),healthbar:document.getElementById('healthbar'),level:document.getElementById('level'),enemyCount:document.getElementById('enemyCount'),missiles:document.getElementById('missiles'),objective:document.getElementById('objective')};
const center=document.getElementById('centerMessage'), startBtn=document.getElementById('startBtn'), cross=document.getElementById('crosshair'),toast=document.getElementById('toast');
let toastTimer=0;
function showToast(s){toast.textContent=s;toast.style.display='block';toastTimer=1.8;}
function updateHUD(){hud.health.textContent=Math.max(0,Math.round(health));hud.healthbar.style.width=Math.max(0,health)+'%';hud.level.textContent=level;hud.enemyCount.textContent=enemies.filter(e=>e.userData.hp>0).length;hud.missiles.textContent=missiles;}
function addEnemy(){
 const e=buildHelicopter(true);
 const a=Math.random()*Math.PI*2, r=32+Math.random()*35;
 e.position.set(Math.cos(a)*r,5+Math.random()*9,Math.sin(a)*r);
 e.rotation.y=Math.random()*Math.PI*2;
 e.userData.hp=2+level; e.userData.speed=2+Math.random()*1.5+level*.25; e.userData.cooldown=1+Math.random()*2;
 scene.add(e);enemies.push(e);
}
function setupLevel(){for(let i=0;i<3+level*2;i++)addEnemy();hud.objective.textContent='Mission: Destroy all enemies';updateHUD();}
function makeShot(from,dir,enemy=false,missile=false){
 const color=missile?0xff8b2b:enemy?0xff3737:0x7cf5ff;
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(missile?.22:.09,8,8),mat(color,.25,.15));
 mesh.position.copy(from);scene.add(mesh);
 const speed=missile?34:enemy?24:65;
 shots.push({mesh,vel:dir.clone().normalize().multiplyScalar(speed),life:missile?3:2.1,enemy,missile,damage:missile?3:1});
 if(missile){
  const flame=new THREE.PointLight(0xff6a20,2,5);mesh.add(flame);
 }
}
function explode(pos,big=false){
 const group=new THREE.Group();group.position.copy(pos);scene.add(group);
 for(let i=0;i<(big?22:10);i++){
  const p=new THREE.Mesh(new THREE.SphereGeometry(.18+Math.random()*.22,7,7),mat([0xff5b20,0xffbb38,0x777777][i%3]));
  p.position.set((Math.random()-.5)*1.5,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5);group.add(p);
 }
 effects.push({group,life:.65,big});
}
function fire(missile=false){
 if(!running||gameOver)return;
 if(missile){if(missiles<=0){showToast('No missiles left!');return;}missiles--;updateHUD();}
 const dir=new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion);
 // mouse aim direction: project target from camera ray onto a point in front of helicopter
 if(!missile){
  raycaster.setFromCamera(mouse,camera);
  const aimPoint=raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(100));
  dir.copy(aimPoint.sub(player.position).normalize());
 }
 const start=player.position.clone().add(new THREE.Vector3(0,.1,-1.7).applyQuaternion(player.quaternion));
 makeShot(start,dir,false,missile);
}
function damagePlayer(amount){health-=amount;updateHUD();if(health<=0){health=0;gameOver=true;running=false;center.classList.remove('hidden');center.querySelector('h1').textContent='MISSION FAILED';center.querySelector('p').textContent='Your helicopter was destroyed.';startBtn.textContent='RESTART MISSION';cross.style.display='none';updateHUD();}}
function restart(){
 shots.forEach(s=>scene.remove(s.mesh));shots.length=0;
 enemies.forEach(e=>scene.remove(e));enemies.length=0;
 effects.forEach(e=>scene.remove(e.group));effects.length=0;
 health=100;level=1;missiles=8;bullets=0;gameOver=false;running=true;
 player.position.set(0,5,18);yaw=0;player.rotation.set(0,0,0);
 center.classList.add('hidden');cross.style.display='block';setupLevel();showToast('Mission started!');
}
startBtn.addEventListener('click',restart);
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space'&&!e.repeat)fire(true);if(e.code==='KeyR')restart();});
addEventListener('keyup',e=>keys[e.code]=false);
addEventListener('mousemove',e=>{mouse.x=(e.clientX/innerWidth)*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;});
addEventListener('mousedown',e=>{if(e.button===0&&running)fire(false);});
addEventListener('contextmenu',e=>e.preventDefault());

const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.035), t=clock.elapsedTime;
 player.userData.rotor.rotation.y+=dt*24;player.userData.tailRotor.rotation.z+=dt*35;
 if(running&&!gameOver){
  const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));
  const move=new THREE.Vector3();
  if(keys.KeyW||keys.ArrowUp)move.add(forward);
  if(keys.KeyS||keys.ArrowDown)move.sub(forward);
  if(keys.KeyA)move.sub(right);if(keys.KeyD)move.add(right);
  if(keys.ArrowLeft)yaw+=dt*1.65;if(keys.ArrowRight)yaw-=dt*1.65;
  if(keys.KeyQ)yaw+=dt*3.3;if(keys.KeyE)yaw-=dt*3.3;
  if(move.lengthSq())player.position.add(move.normalize().multiplyScalar(dt*18));
  if(keys.ShiftLeft||keys.ShiftRight)player.position.y+=dt*9;
  if(keys.ControlLeft||keys.ControlRight)player.position.y-=dt*9;
  player.position.y=Math.max(1.5,Math.min(23,player.position.y));
  player.position.x=Math.max(-90,Math.min(90,player.position.x));player.position.z=Math.max(-90,Math.min(90,player.position.z));
  player.rotation.y=yaw;
  player.rotation.z=move.lengthSq()?Math.sin(t*8)*.045:0;
  player.position.y+=Math.sin(t*3)*dt*.18;
  // enemies follow and fire toward player
  for(const e of enemies){
   if(e.userData.hp<=0)continue;
   e.userData.rotor.rotation.y+=dt*25;e.userData.tailRotor.rotation.z+=dt*32;
   const to=player.position.clone().sub(e.position);const dist=to.length();
   if(dist>13)e.position.add(to.normalize().multiplyScalar(dt*e.userData.speed));
   e.rotation.y=Math.atan2(to.x,-to.z);
   e.userData.cooldown-=dt;
   if(e.userData.cooldown<=0&&dist<65){makeShot(e.position.clone().add(new THREE.Vector3(0,0,-1).applyQuaternion(e.quaternion)),to.normalize(),true,false);e.userData.cooldown=1.5+Math.random()*1.2;}
   if(dist<3.5){damagePlayer(12*dt);}
  }
  for(let i=shots.length-1;i>=0;i--){
   const s=shots[i];s.mesh.position.addScaledVector(s.vel,dt);s.life-=dt;
   let hit=false;
   if(s.enemy){
    if(s.mesh.position.distanceTo(player.position)<2.1){damagePlayer(s.damage*9);hit=true;}
   }else{
    for(const e of enemies){if(e.userData.hp>0&&s.mesh.position.distanceTo(e.position)<2.4){e.userData.hp-=s.damage;hit=true;if(e.userData.hp<=0){explode(e.position,true);scene.remove(e);if(enemies.every(x=>x.userData.hp<=0)){level++;if(level<=5){showToast('LEVEL COMPLETE! Level '+level);setupLevel();}else{running=false;gameOver=true;center.classList.remove('hidden');center.querySelector('h1').textContent='MISSION COMPLETE';center.querySelector('p').textContent='You cleared all five levels!';startBtn.textContent='PLAY AGAIN';cross.style.display='none';}}}break;}}
   }
   if(hit||s.life<=0){if(s.missile)explode(s.mesh.position,true);scene.remove(s.mesh);shots.splice(i,1);}
  }
  for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;e.group.scale.multiplyScalar(1+dt*2);e.group.children.forEach(c=>{c.material.transparent=true;c.material.opacity=Math.max(0,e.life/.65)});if(e.life<=0){scene.remove(e.group);effects.splice(i,1);}}
  updateHUD();
 }
 // camera follows helicopter from behind and above
 const offset=new THREE.Vector3(0,8,15).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
 const desired=player.position.clone().add(offset);
 camera.position.lerp(desired,1-Math.pow(.001,dt));
 const look=player.position.clone().add(new THREE.Vector3(0,1,-7).applyAxisAngle(new THREE.Vector3(0,1,0),yaw));
 camera.lookAt(look);
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toast.style.display='none';}
 renderer.render(scene,camera);
}
setupLevel(); // preview enemies before starting
// hide preview HUD enemy count remains informative
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
})();