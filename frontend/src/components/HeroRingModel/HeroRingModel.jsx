import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import ringModelUrl from "../../3d/doji_diamond_ring.glb?url";

const createStudioEnvironment = () => {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#151515");

  const addPanel = (color, intensity, position, rotation, scale) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    panel.position.set(...position);
    panel.rotation.set(...rotation);
    panel.scale.set(...scale);
    envScene.add(panel);
  };

  addPanel("#ffffff", 2.2, [0, 3.2, 3], [-0.85, 0, 0], [4.5, 1.1, 1]);
  addPanel("#dff6ff", 1.8, [-3.3, 0.4, 2.4], [0, 0.85, 0], [1.1, 3.2, 1]);
  addPanel("#ffffff", 1.6, [3.4, 0.2, 1.5], [0, -0.85, 0], [0.8, 2.8, 1]);
  addPanel("#ffffff", 2.4, [0, -0.35, 3.4], [0.05, 0, 0], [3.8, 0.85, 1]);
  addPanel("#b5b5b5", 1.25, [0, -2.1, 2.5], [0.9, 0, 0], [4.2, 0.7, 1]);

  return envScene;
};

function HeroRingModel() {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);
  const frameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const isInteractingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#151515");

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.34, 5.05);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.36;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const studioEnvironment = createStudioEnvironment();
    scene.environment = pmremGenerator.fromScene(studioEnvironment, 0.02).texture;

    const ambientLight = new THREE.HemisphereLight("#ffffff", "#686868", 2.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#ffffff", 4.8);
    keyLight.position.set(1.7, 3.4, 4.8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#f7fbff", 3.8);
    fillLight.position.set(-3.4, 1.5, 4.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight("#ffffff", 4.2);
    rimLight.position.set(-2.5, 3.4, -2.5);
    scene.add(rimLight);

    const frontLight = new THREE.PointLight("#ffffff", 5.8, 8);
    frontLight.position.set(0, 0.65, 3.1);
    scene.add(frontLight);

    const sparkleLight = new THREE.PointLight("#ffffff", 3.6, 9);
    sparkleLight.position.set(0, 1.85, 2.35);
    scene.add(sparkleLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.addEventListener("start", () => {
      isInteractingRef.current = true;
    });
    controls.addEventListener("end", () => {
      isInteractingRef.current = false;
      clockRef.current.start();
    });
    controlsRef.current = controls;

    const applyModelLayout = (canvasWidth) => {
      const model = modelRef.current;
      if (!model?.userData?.centeredPosition || !model.userData.maxAxis) return;

      const isMobile = canvasWidth < 640;
      model.position.copy(model.userData.centeredPosition);
      model.position.x += isMobile ? -0.16 : -0.58;
      model.position.y += isMobile ? 0.2 : 0.58;
      model.scale.setScalar((isMobile ? 1.72 : 2.05) / model.userData.maxAxis);
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const canvasWidth = Math.max(width, 320);
      const canvasHeight = Math.max(height, 360);
      renderer.setSize(canvasWidth, canvasHeight, false);
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
      applyModelLayout(canvasWidth);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const loader = new GLTFLoader();
    loader.load(
      ringModelUrl,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        model.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z);
        model.userData.centeredPosition = model.position.clone();
        model.userData.maxAxis = maxAxis;
        modelRef.current = model;
        applyModelLayout(container.getBoundingClientRect().width);
        model.rotation.set(-0.38, 0.22, -0.08);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];

              materials.forEach((material) => {
                const materialName = material.name?.toLowerCase() || "";

                if (materialName.includes("white_gold")) {
                  material.color?.set("#f4f7f8");
                  material.metalness = materialName.includes("_2") ? 0.72 : 0.82;
                  material.roughness = materialName.includes("_2") ? 0.13 : 0.075;
                  material.envMapIntensity = 2.25;
                } else if (materialName.includes("material_2")) {
                  material.color?.set("#ffffff");
                  material.metalness = 0;
                  material.roughness = 0.015;
                  material.envMapIntensity = 3.4;
                  material.transparent = true;
                  material.opacity = 0.78;
                  material.depthWrite = false;

                  if ("transmission" in material) {
                    material.transmission = 0.92;
                    material.thickness = 0.55;
                    material.ior = 2.4;
                  }
                } else {
                  material.color?.set("#cfd3d6");
                  material.metalness = 0.7;
                  material.roughness = 0.2;
                  material.envMapIntensity = 2.1;
                }

                material.needsUpdate = true;
              });
            }
          }
        });

        scene.add(model);
        setIsLoading(false);
      },
      undefined,
      () => {
        setLoadError("3D model could not be loaded");
        setIsLoading(false);
      }
    );

    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      studioEnvironment.traverse((object) => {
        if (object.isMesh) {
          object.geometry?.dispose();
          object.material?.dispose();
        }
      });
      pmremGenerator.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-md bg-[#151515] shadow-soft md:min-h-[520px]">
      <div ref={containerRef} className="absolute inset-0" aria-label="Interactive 3D diamond ring model" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.13),rgba(21,21,21,0)_58%)]" />
      {(isLoading || loadError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#151515] text-sm font-semibold text-white/70">
          {loadError || "Loading 3D model..."}
        </div>
      )}
    </div>
  );
}

export default HeroRingModel;
