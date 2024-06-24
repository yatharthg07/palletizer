import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Pallet3DVisualization = ({ pallet, boxes }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = 800;
    const height = 600;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);  // Light gray background
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);  // Increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);  // Increased intensity
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Helper to visualize light direction
    const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
    scene.add(lightHelper);

    // Pallet
    const palletGeometry = new THREE.BoxGeometry(pallet.width, pallet.height, pallet.length);
    const palletMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const palletMesh = new THREE.Mesh(palletGeometry, palletMaterial);
    palletMesh.position.set(pallet.width / 2, pallet.height / 2, pallet.length / 2);
    scene.add(palletMesh);

    // Boxes
    boxes.forEach((box) => {
      const boxGeometry = new THREE.BoxGeometry(box.width, box.height, box.length);
      const boxMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(`hsl(${box.id * 30 % 360}, 70%, 50%)`) });
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
      boxMesh.position.set(box.x, box.z + box.height / 2, box.y);
      scene.add(boxMesh);
    });

    // Camera positioning
    const maxDimension = Math.max(pallet.width, pallet.length, pallet.height) * 2;
    camera.position.set(maxDimension, maxDimension, maxDimension);
    camera.lookAt(pallet.width / 2, pallet.height / 2, pallet.length / 2);

    // Orbit controls for interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(Math.max(pallet.width, pallet.length, pallet.height) * 1.5);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [pallet, boxes]);

  return <div ref={mountRef} />;
};

export default Pallet3DVisualization;