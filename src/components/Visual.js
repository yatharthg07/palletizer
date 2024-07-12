import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Visual = ({ coordinates, palletDimensions }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const [size, setSize] = useState({ width: 500, height: 400 });

    useEffect(() => {
        const updateSize = () => {
            if (mountRef.current) {
                setSize({
                    width: mountRef.current.clientWidth,
                    height: mountRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;

        // Setup scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Setup camera
        const aspect = size.width / size.height;
        const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
        camera.position.set(800, 400, 800);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(size.width, size.height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Setup controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Pallet
        const palletGeometry = new THREE.BoxGeometry(palletDimensions.width * 100, 1 , palletDimensions.height * 100);
        const palletMaterial = new THREE.MeshPhongMaterial({ color: 0xE1C16E });
        const pallet = new THREE.Mesh(palletGeometry, palletMaterial);
        pallet.position.set(0, 0, 0);
        scene.add(pallet);

        // Grid helper
        // const gridHelper = new THREE.GridHelper(Math.max(palletDimensions.width, palletDimensions.height) * 100, 1);
        // gridHelper.position.y = 0;
        // scene.add(gridHelper);

        // Boxes
        coordinates.forEach(box => {
            const geometry = new THREE.BoxGeometry(box.width * 100, box.height * 100, box.length * 100);
            const material = new THREE.MeshPhongMaterial({ color: 0xDAA06D });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                box.x * 100 - palletDimensions.width * 50, 
                box.z * 100 +1/2, 
                box.y * 100 - palletDimensions.height * 50
            );
            scene.add(cube);

            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
            line.position.copy(cube.position);
            scene.add(line);
        });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => {
            controls.dispose();
            if (rendererRef.current && mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [coordinates, palletDimensions, size]);

    return <div ref={mountRef} style={{ width: '100%', height: '400px' }}></div>;
};

export default Visual;