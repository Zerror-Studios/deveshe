import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function Model({ rotationTarget }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/models/wine_bottle.glb')

  useFrame(() => {
    if (rotationTarget?.current && group.current) {
      const rot = rotationTarget.current
      group.current.rotation.set(rot.x, rot.y, rot.z)
    }
  })

  return (
    <group ref={group} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Material_003-material'].geometry}
        material={materials.Material_003}
        position={[0, 0, -2.382]}
        scale={0.873}
      />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Material_002-material'].geometry}
          material={materials.Material_002}
          position={[0, 0, -2.408]}
          scale={0.873}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Material_002-material_1'].geometry}
          material={materials.Material_002}
          position={[0, 0, -2.382]}
          scale={0.873}
        />
        <lineSegments
          geometry={nodes.Object_9.geometry}
          material={materials.Cylinder_000}
          position={[0, 0, -2.382]}
          scale={0.873}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Material_001-material'].geometry}
          material={materials.Material_001}
          position={[0, -0.003, -2.382]}
          scale={0.873}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Material_005-material'].geometry}
          material={materials.Material_005}
          position={[0, 0, -2.382]}
          scale={0.873}
        />
    </group>
  )
}

useGLTF.preload('/models/wine_bottle.glb')
