import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Visual = ({ coordinates, palletDimensions }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        // Setup scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 500/400, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor("#f0f0f0");  // Light background color
        renderer.setSize(500, 400);
        
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;  // Store the renderer for cleanup
        }

        const controls = new OrbitControls(camera, renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Pallet
        const palletGeometry = new THREE.BoxGeometry(palletDimensions.width * 100, 10, palletDimensions.height * 100);
        const palletMaterial = new THREE.MeshLambertMaterial({ color: 0xE1C16E   }); // Dark brown
        const pallet = new THREE.Mesh(palletGeometry, palletMaterial);
        pallet.position.set(0, -5, 0);  // Pallet is centered at -5 in Z-axis
        scene.add(pallet);

        // Boxes
        coordinates.forEach(box => {
            const geometry = new THREE.BoxGeometry(box.width * 100, box.height * 100, box.length * 100);
            const material = new THREE.MeshLambertMaterial({ color: 0xDAA06D }); // Light brown
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                box.x * 100 - palletDimensions.width * 50, 
                box.z * 100 , 
                box.y * 100 - palletDimensions.height * 50
            );
            scene.add(cube);

            const edges = new THREE.EdgesGeometry(geometry);  // Creating an edge geometry from the box geometry
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));  // Using a basic line material for the edges
            line.position.copy(cube.position);  // Position the edges at the same position as the cube
            scene.add(line);  // Add the edges to the scene
        });

        camera.position.z = 800;
        camera.position.y = 200;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

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
    }, [coordinates, palletDimensions]);

    return <div ref={mountRef}></div>;
};

export default Visual;
