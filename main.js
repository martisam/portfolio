
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

//setting up background
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

//Creating the Donut/Torus geometry
const geometry = new THREE.TorusGeometry( 10, 3, 15, 100);
const material = new THREE.MeshStandardMaterial( { color: 0xFFFFFF});
const torus = new THREE.Mesh( geometry, material );

scene.add(torus);

//Setting the ligthning
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial( {color: 0xffffff});
  const star = new THREE.Mesh( geometry, material);

  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x,y,z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

//space background
const spaceTexture = new THREE.TextureLoader().load('space.jpeg');
scene.background = spaceTexture;


//Profile
const profTexture = new THREE.TextureLoader().load('Profile.png');

const profile = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial( { map: profTexture})
);

scene.add(profile)

//mars
const marsTexture = new THREE.TextureLoader().load('mars.jpeg');

const mars = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial( {
    map: marsTexture,
  })
);

scene.add(mars);

mars.position.z = 30;
mars.position.setX(-10);

profile.position.z = -5;
profile.position.x = 2;

//Animation Scroll
function moveCamera() {

  const t = document.body.getBoundingClientRect().top;
  mars.rotation.x += 0.05;
  mars.rotation.y += 0.075;
  mars.rotation.z += 0.05;

  profile.rotation.y += 0.01;
  profile.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.position.y = t * -0.0002;

}

document.body.onscroll = moveCamera;
moveCamera();

function animate(){
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  mars.rotation.x += 0.005;
  //controls.update();
  renderer.render( scene, camera);
}

animate();
