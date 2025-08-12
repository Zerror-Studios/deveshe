import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

export default function PhoneModel(props) {
    const { nodes, materials } = useGLTF('/models/phone.glb')
    const meshRef = useRef();
    const blackMaterial = new THREE.MeshStandardMaterial({
        color: 'black',
        roughness: 0.2,
        metalness: 0.1,
    })

    const handleHover = () => {
        gsap.to(meshRef.current.position, {
            x: -6,
            y: 23,
            z: -10.402,
            duration: .5,
        });

        gsap.to(meshRef.current.rotation, {
            x: -Math.PI / 1.7,
            y: -0.5,
            z: 0,
            duration: .5,

        });
    };

    const handleHoverOut = () => {
        gsap.to(meshRef.current.position, {
            x: 0,
            y: 14.358,
            z: -10.402,
            duration: .5,
        });

        gsap.to(meshRef.current.rotation, {
            x: -Math.PI / 2,
            y: 0,
            z: 0,
            duration: .5,
        });
    };

    return (
        <group
            onPointerOver={handleHover}
            onPointerOut={handleHoverOut}
            {...props} dispose={null}
            scale={1.1}
            position={[0, -1.5, 0]}
            >
            <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube_Material_0.geometry}
                    //   material={materials.Material}
                    material={blackMaterial}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}
                />
            </group>

            {/* animate mesh */}
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow
                geometry={nodes.Cube001_Material_0.geometry}
                // material={materials.Material}
                material={blackMaterial}
                position={[0, 14.358, -10.402]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={100}
            />
            {/* animate position */}


            <group position={[2.551, 8.674, 1.698]} rotation={[-1.089, 0, 0]} scale={100}>

                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube002_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube002_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[0.063, 8.674, 1.698]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube003_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube003_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[-2.52, 8.674, 1.698]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube004_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube004_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[2.551, 7.568, 3.88]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube005_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube005_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[0.063, 7.568, 3.88]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube006_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube006_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[-2.52, 7.568, 3.88]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube007_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube007_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[2.551, 6.432, 6.108]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube008_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube008_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[0.063, 6.432, 6.108]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube009_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube009_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[-2.52, 6.432, 6.108]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube010_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube010_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[0.063, 5.409, 8.015]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube011_Material002_0.geometry}
                    //   material={materials['Material.002']}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube011_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[2.551, 9.809, -0.474]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube015_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube015_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[0.063, 9.809, -0.474]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube016_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube016_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>
            <group position={[-2.5, 9.809, -0.474]} rotation={[-1.089, 0, 0]} scale={100}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube017_M_Button_0.geometry}
                    //   material={materials.M_Button}
                    material={blackMaterial}

                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube017_Material001_0.geometry}
                    //   material={materials['Material.001']}
                    material={blackMaterial}

                />
            </group>

            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube012_Material_0.geometry}
                // material={materials.Material}
                material={blackMaterial}
                position={[-8.841, 1.321, -4.518]}
                rotation={[-Math.PI / 2, 0, -0.033]}
                scale={100}
            />
     
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube014_Material001_0.geometry}
                // material={materials['Material.001']}
                material={blackMaterial}

                position={[6.36, 1.247, -17.447]}
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                scale={100}
            />



            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube018_Material002_0.geometry}
                material={materials['Material.002']}
                position={[-2.52, 9.809, -0.474]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube019_Material002_0.geometry}
                material={materials['Material.002']}
                position={[0.048, 9.809, -0.474]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube020_Material002_0.geometry}
                material={materials['Material.002']}
                position={[2.536, 9.809, -0.474]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube021_Material002_0.geometry}
                material={materials['Material.002']}
                position={[-2.52, 8.672, 1.702]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube022_Material002_0.geometry}
                material={materials['Material.002']}
                position={[0.048, 8.672, 1.702]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube023_Material002_0.geometry}
                material={materials['Material.002']}
                position={[2.536, 8.672, 1.702]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube024_Material002_0.geometry}
                material={materials['Material.002']}
                position={[-2.52, 7.569, 3.888]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube025_Material002_0.geometry}
                material={materials['Material.002']}
                position={[0.048, 7.569, 3.888]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube026_Material002_0.geometry}
                material={materials['Material.002']}
                position={[2.536, 7.569, 3.888]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube027_Material002_0.geometry}
                material={materials['Material.002']}
                position={[-2.52, 6.415, 6.098]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube028_Material002_0.geometry}
                material={materials['Material.002']}
                position={[0.048, 6.415, 6.098]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube029_Material002_0.geometry}
                material={materials['Material.002']}
                position={[2.536, 6.415, 6.098]}
                rotation={[-1.089, 0, 0]}
                scale={100}
            />

        </group>
    )
}

useGLTF.preload('/models/phone.glb')