// File: components/Box3DView.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Box3DView = ({ boxes, palletWidth, palletHeight }) => {
    const mount = useRef(null);

    useEffect(() => {
        const width = palletWidth * 100;  // Convert meters to pixels
        const height = palletHeight * 100; // Convert meters to pixels
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        mount.current.appendChild(renderer.domElement);

        const palletGeometry = new THREE.BoxGeometry(width, 10, height);  // Thin, flat pallet
        const palletMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const pallet = new THREE.Mesh(palletGeometry, palletMaterial);
        pallet.position.set(0, -5, 0);  // Center the pallet and slightly lower
        scene.add(pallet);

        boxes.forEach(box => {
            const geometry = new THREE.BoxGeometry(box.width * 100, box.height * 100, box.length * 100);
            const material = new THREE.MeshBasicMaterial({ color: 0x4682B4, wireframe: true });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(box.x * 100 - width / 2, box.z * 100, box.y * 100 - height / 2);
            scene.add(cube);
        });

        camera.position.z = 500;
        camera.position.y = -500;
        camera.lookAt(0, 0, 0);

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            mount.current.removeChild(renderer.domElement);
        };
    }, [boxes, palletWidth, palletHeight]);

    return <div ref={mount} style={{ width: '100%', height: '100%' }} />;
};

export default Box3DView;
