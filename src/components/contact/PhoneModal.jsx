"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const PHONE_SCALE = 100;
const HANDSET_REST_POSITION = [0, 14.358, -10.402];
const HANDSET_REST_ROTATION = [-Math.PI / 2, 0, 0];

const PhoneModal = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const modelGroup = new THREE.Group();
    const clock = new THREE.Clock();
    const createdMaterials = [];
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    let animationFrameId = 0;
    let isDisposed = false;
    let isMobile = window.innerWidth <= 768;
    let handset = null;
    let isHoveringDialer = false;

    camera.position.set(10, 10, 45);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2));
    scene.add(modelGroup);

    const blackMaterial = new THREE.MeshStandardMaterial({
      color: "black",
      roughness: 0.2,
      metalness: 0.1,
    });
    createdMaterials.push(blackMaterial);

    const setVector = (target, values) => {
      target.set(values[0], values[1], values[2]);
    };

    const updateSize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      isMobile = window.innerWidth <= 768;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      modelGroup.scale.setScalar(isMobile ? 2.3 : 1.1);
      // Slight downward nudge for better visual centering in the left panel.
      modelGroup.position.set(0, isMobile ? -17 : -3, 0);
    };

    const addMesh = (parent, nodes, name, material, position, rotation, scale) => {
      const source = nodes[name];
      if (!source?.geometry) return null;

      const mesh = new THREE.Mesh(source.geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (position) setVector(mesh.position, position);
      if (rotation) setVector(mesh.rotation, rotation);
      if (scale) mesh.scale.setScalar(scale);

      parent.add(mesh);
      return mesh;
    };

    const addGroup = (parent, position, rotation, scale) => {
      const group = new THREE.Group();
      if (position) setVector(group.position, position);
      if (rotation) setVector(group.rotation, rotation);
      if (scale) group.scale.setScalar(scale);
      parent.add(group);
      return group;
    };

    const loadEnvironment = () => {
      new RGBELoader().load("/models/gem.hdr", (texture) => {
        if (isDisposed) {
          texture.dispose();
          return;
        }

        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      });
    };

    const buildPhone = (gltf) => {
      const nodes = {};
      gltf.scene.traverse((object) => {
        if (object.name) nodes[object.name] = object;
      });

      const numberMaterial =
        nodes.Cube018_Material002_0?.material ||
        gltf.scene.getObjectByName("Cube018_Material002_0")?.material ||
        blackMaterial;

      const base = addGroup(modelGroup, null, [-Math.PI / 2, 0, 0], PHONE_SCALE);
      addMesh(base, nodes, "Cube_Material_0", blackMaterial);
      addMesh(base, nodes, "Cube_Material001_0", blackMaterial);

      handset = addMesh(
        modelGroup,
        nodes,
        "Cube001_Material_0",
        blackMaterial,
        HANDSET_REST_POSITION,
        HANDSET_REST_ROTATION,
        PHONE_SCALE
      );

      [
        [[2.551, 8.674, 1.698], ["Cube002_M_Button_0", "Cube002_Material001_0"]],
        [[0.063, 8.674, 1.698], ["Cube003_M_Button_0", "Cube003_Material001_0"]],
        [[-2.52, 8.674, 1.698], ["Cube004_M_Button_0", "Cube004_Material001_0"]],
        [[2.551, 7.568, 3.88], ["Cube005_M_Button_0", "Cube005_Material001_0"]],
        [[0.063, 7.568, 3.88], ["Cube006_M_Button_0", "Cube006_Material001_0"]],
        [[-2.52, 7.568, 3.88], ["Cube007_M_Button_0", "Cube007_Material001_0"]],
        [[2.551, 6.432, 6.108], ["Cube008_M_Button_0", "Cube008_Material001_0"]],
        [[0.063, 6.432, 6.108], ["Cube009_M_Button_0", "Cube009_Material001_0"]],
        [[-2.52, 6.432, 6.108], ["Cube010_M_Button_0", "Cube010_Material001_0"]],
        [[0.063, 5.409, 8.015], ["Cube011_Material002_0", "Cube011_Material001_0"]],
        [[2.551, 9.809, -0.474], ["Cube015_M_Button_0", "Cube015_Material001_0"]],
        [[0.063, 9.809, -0.474], ["Cube016_M_Button_0", "Cube016_Material001_0"]],
        [[-2.5, 9.809, -0.474], ["Cube017_M_Button_0", "Cube017_Material001_0"]],
      ].forEach(([position, names]) => {
        const group = addGroup(modelGroup, position, [-1.089, 0, 0], PHONE_SCALE);
        names.forEach((name) => addMesh(group, nodes, name, blackMaterial));
      });

      addMesh(
        modelGroup,
        nodes,
        "Cube012_Material_0",
        blackMaterial,
        [-8.841, 1.321, -4.518],
        [-Math.PI / 2, 0, -0.033],
        PHONE_SCALE
      );
      addMesh(
        modelGroup,
        nodes,
        "Cube014_Material001_0",
        blackMaterial,
        [6.36, 1.247, -17.447],
        [-Math.PI / 2, 0, -Math.PI / 2],
        PHONE_SCALE
      );

      [
        ["Cube018_Material002_0", [-2.52, 9.809, -0.474]],
        ["Cube019_Material002_0", [0.048, 9.809, -0.474]],
        ["Cube020_Material002_0", [2.536, 9.809, -0.474]],
        ["Cube021_Material002_0", [-2.52, 8.672, 1.702]],
        ["Cube022_Material002_0", [0.048, 8.672, 1.702]],
        ["Cube023_Material002_0", [2.536, 8.672, 1.702]],
        ["Cube024_Material002_0", [-2.52, 7.569, 3.888]],
        ["Cube025_Material002_0", [0.048, 7.569, 3.888]],
        ["Cube026_Material002_0", [2.536, 7.569, 3.888]],
        ["Cube027_Material002_0", [-2.52, 6.415, 6.098]],
        ["Cube028_Material002_0", [0.048, 6.415, 6.098]],
        ["Cube029_Material002_0", [2.536, 6.415, 6.098]],
      ].forEach(([name, position]) => {
        addMesh(modelGroup, nodes, name, numberMaterial, position, [-1.089, 0, 0], PHONE_SCALE);
      });
    };

    const handleHover = () => {
      if (!handset) return;

      gsap.to(handset.position, {
        x: isMobile ? -4 : -6,
        y: isMobile ? 15 : 23,
        z: -10.402,
        duration: 0.5,
      });

      gsap.to(handset.rotation, {
        x: -Math.PI / 1.7,
        y: -0.5,
        z: 0,
        duration: 0.5,
      });
    };

    const handleHoverOut = () => {
      if (!handset) return;

      gsap.to(handset.position, {
        x: HANDSET_REST_POSITION[0],
        y: HANDSET_REST_POSITION[1],
        z: HANDSET_REST_POSITION[2],
        duration: 0.5,
      });

      gsap.to(handset.rotation, {
        x: HANDSET_REST_ROTATION[0],
        y: HANDSET_REST_ROTATION[1],
        z: HANDSET_REST_ROTATION[2],
        duration: 0.5,
      });
    };

    const updatePointerNdc = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointerNdc.set(x * 2 - 1, -(y * 2 - 1));
    };

    const isPartOfHandset = (object) => {
      if (!handset || !object) return false;
      return object === handset || handset.children?.includes?.(object) || handset.uuid === object.uuid;
    };

    const isPointerOnDialer = () => {
      raycaster.setFromCamera(pointerNdc, camera);
      // Hover anywhere on the dialer body, but exclude handset/handle.
      const hits = raycaster.intersectObject(modelGroup, true);
      return hits.some((hit) => !isPartOfHandset(hit.object));
    };

    const handlePointerMove = (event) => {
      updatePointerNdc(event);
      const nowHovering = isPointerOnDialer();
      if (nowHovering === isHoveringDialer) return;
      isHoveringDialer = nowHovering;
      if (isHoveringDialer) handleHover();
      else handleHoverOut();
    };

    const handlePointerLeaveCanvas = () => {
      if (!isHoveringDialer) return;
      isHoveringDialer = false;
      handleHoverOut();
    };

    const handlePointerDown = (event) => {
      updatePointerNdc(event);
      if (!isPointerOnDialer()) return;
      handleHover();
    };

    const handlePointerUp = () => {
      if (!isHoveringDialer) return;
      handleHoverOut();
    };

    const animate = () => {
      const t = clock.getElapsedTime();
      camera.position.x = 5 + Math.sin(t) * 5;
      camera.position.y = 20;
      camera.position.z = 45;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
    };

    loadEnvironment();
    new GLTFLoader().load("/models/phone.glb", (gltf) => {
      if (!isDisposed) buildPhone(gltf);
    });

    updateSize();
    animate();

    window.addEventListener("resize", updateSize);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeaveCanvas);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateSize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeaveCanvas);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);

      gsap.killTweensOf(handset?.position);
      gsap.killTweensOf(handset?.rotation);

      scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
      });

      createdMaterials.forEach((material) => material.dispose());
      scene.environment?.dispose?.();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="phone_container" ref={containerRef} />;
};

export default PhoneModal;
