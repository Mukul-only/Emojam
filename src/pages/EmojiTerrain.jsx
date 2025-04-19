// EmojiTerrain.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";

function createTextTerrain(anisotropy) {
  const simplex = new SimplexNoise();
  const group = new THREE.Object3D();
  const alphabet = [
    "☻",
    "★",
    "☆",
    "☀",
    "☁",
    "☂",
    "☃",
    "✈",
    "✉",
    "❤",
    "✦",
    "✧",
    "❄",
    "☯",
    "☮",
    "☢",
    "☠",
    "♠",
    "♣",
    "♥",
    "♦",
    "♪",
    "♩",
    "♫",
    "",
    "☘",
    "⚔",
    "⚙",
    "",
    "⚖",
    "☂",
    "",
    "✝",
    "",
    "",
    "",
    "",

    "",
    "",
    "",
    "",
    "☑",
    "✓",
    "✔",
    "✕",
    "✖",
    "✗",
    "✘",
    "☓",
    "☒",
    "✪",
  ];

  const textTexture = (() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const texSize = 2048;
    canvas.width = texSize;
    canvas.height = texSize;
    ctx.clearRect(0, 0, texSize, texSize);
    const dim = 8;
    const dimStep = texSize / dim;

    for (let i = 0; i < alphabet.length; i++) {
      const tileX = i % 8;
      const tileY = Math.floor(i / 8);
      const x = (tileX + 0.5) * dimStep;
      const y = texSize - (tileY + 0.5) * dimStep;
      ctx.fillStyle = "#E4E4E7";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${dimStep * 0.9}px Arial`;
      ctx.fillText(alphabet[i], x, y);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = "srgb";
    texture.anisotropy = anisotropy;
    return texture;
  })();

  const tileDim = 200;
  const planeGeo = new THREE.PlaneGeometry();
  const letterIndices = new Float32Array(tileDim * tileDim).map(() =>
    THREE.MathUtils.randInt(0, alphabet.length - 1)
  );
  planeGeo.setAttribute(
    "letterIdx",
    new THREE.InstancedBufferAttribute(letterIndices, 1)
  );

  const planeMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    alphaTest: 0.01,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
      shader.vertexShader = `
          attribute float letterIdx;
          varying float vLetterIdx;
          ${shader.vertexShader}
        `.replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>\nvLetterIdx = letterIdx;`
      );

      shader.fragmentShader = `
          varying float vLetterIdx;
          ${shader.fragmentShader}
        `.replace(
        "#include <map_fragment>",
        `float letterIdx = floor(vLetterIdx + 0.1);
          float tileStep = 1. / 8.;
          float u = mod(letterIdx, 8.);
          float v = floor(letterIdx / 8.);
          vec2 iUv = (vec2(u, v) + vMapUv) * tileStep;
          vec4 sampledDiffuseColor = texture2D(map, iUv);
          diffuseColor *= sampledDiffuseColor;`
      );
    },
  });

  const instancedMesh = new THREE.InstancedMesh(
    planeGeo,
    planeMat,
    tileDim * tileDim
  );
  group.add(instancedMesh);

  const dummy = new THREE.Object3D();
  const finals = [];

  const getY = (x, z) => simplex.noise(x * 0.01, z * 0.01) * 7.5;

  for (let z = 0; z < tileDim; z++) {
    for (let x = 0; x < tileDim; x++) {
      dummy.position.x = -(tileDim - 1) * 0.5 + x;
      dummy.position.z = -(tileDim - 1) * 0.5 + z;
      const y0 = getY(dummy.position.x, dummy.position.z);
      const y1 = getY(dummy.position.x, dummy.position.z - 1);
      const y2 = getY(dummy.position.x + 1, dummy.position.z);
      dummy.position.y = y0;

      const tri = new THREE.Triangle(
        new THREE.Vector3(dummy.position.x, y1, dummy.position.z - 1),
        new THREE.Vector3(dummy.position.x, y0, dummy.position.z),
        new THREE.Vector3(dummy.position.x + 1, y2, dummy.position.z)
      );

      const n = new THREE.Vector3();
      const la = new THREE.Vector3();
      tri.getNormal(n);
      la.copy(dummy.position).add(n);
      dummy.lookAt(la);
      dummy.rotation.z = 0;
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(z * tileDim + x, dummy.matrix);

      finals.push({
        y: y0,
        pos: dummy.position.clone(),
        rot: dummy.rotation.clone(),
        dummy: new THREE.Object3D(),
        inAction: false,
        mediators: { v: new THREE.Vector3(), v2: new THREE.Vector3() },
      });
    }
  }

  const actions = Array.from({ length: 5000 }, () => {
    const action = (delay) => {
      const getFreeLetterIndex = () => {
        const idx = Math.floor(Math.random() * finals.length);
        return !finals[idx].inAction ? idx : getFreeLetterIndex();
      };

      const idx = getFreeLetterIndex();
      const letter = finals[idx];
      const height = 30;
      const { v, v2 } = letter.mediators;

      v2.random()
        .multiplyScalar(0.5)
        .addScalar(0.5)
        .multiplyScalar(Math.PI * 3 * Math.sign(Math.random() - 0.5));

      new TWEEN.Tween({ val: 0 })
        .to({ val: 1 }, 10000)
        .delay(delay)
        .onStart(() => {
          letter.inAction = true;
        })
        .onUpdate((obj) => {
          v.lerpVectors(v2, letter.rot, obj.val);
          letter.dummy.rotation.set(v.x, v.y, v.z);
          letter.dummy.position.copy(letter.pos);
          letter.dummy.position.y = THREE.MathUtils.lerp(
            height,
            letter.y,
            obj.val
          );
          letter.dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx, letter.dummy.matrix);
        })
        .onComplete(() => {
          letter.inAction = false;
          action(Math.random() * 10000);
        })
        .start();
    };
    return action;
  });

  group.instancedMesh = instancedMesh;
  group.actions = actions;

  return group;
}

const EmojiTerrain = () => {
  const containerRef = useRef();

  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Prevent duplicate canvas on refresh
    if (containerRef.current.hasChildNodes()) {
      containerRef.current.innerHTML = "";
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#1f1e24", 100, 150);
    scene.background = new THREE.Color("#1f1e24");

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
    camera.position.set(0, 3, 8).setLength(50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const textTerrain = createTextTerrain(
      renderer.capabilities.getMaxAnisotropy()
    );
    scene.add(textTerrain);

    textTerrain.actions.forEach((action) =>
      action((Math.random() * 0.9 + 0.1) * 10000)
    );

    const animate = () => {
      TWEEN.update();
      controls.update();
      textTerrain.instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = ""; // cleanup canvas
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );
};

export default EmojiTerrain;
