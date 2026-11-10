import React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import PhoneModel from '../../../public/models/PhoneModel'

const AnimatedCamera = () => {
  const { camera } = useThree()

  // r3f's own clock (THREE.Clock is deprecated in current three)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    camera.position.x = 5 + Math.sin(t) * 5 
    camera.position.y = 20
    camera.position.z = 45
    camera.lookAt(0, 0, 0)
  })

  return null
}

const PhoneModal = () => {
  return (
    <div className="phone_container">
      <Canvas camera={{ position: [10, 10, 45], fov: 75 }}>
        <ambientLight intensity={2} />
        <PhoneModel />
        <Environment files="/models/gem.hdr" />
        <AnimatedCamera />
      </Canvas>
    </div>
  )
}

export default PhoneModal;
