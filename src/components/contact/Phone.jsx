import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import PhoneModel from '../../../public/models/PhoneModel'

const AnimatedCamera = () => {
  const { camera } = useThree()
  const clock = useRef(new THREE.Clock())

  useFrame(() => {
    const t = clock.current.getElapsedTime()
    camera.position.x = 5 + Math.sin(t) * 5 
    camera.position.y = 20
    camera.position.z = 45
    camera.lookAt(0, 0, 0)
  })

  return null
}

const Phone = () => {
  return (
      <Canvas camera={{ position: [10, 10, 45], fov: 75 }}>
        <ambientLight intensity={2} />
        <PhoneModel />
        <Environment files="/models/gem.hdr" />
        <AnimatedCamera />
      </Canvas>
  )
}

export default Phone;
