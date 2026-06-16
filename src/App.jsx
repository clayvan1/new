import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Sparkles, OrbitControls, Html } from '@react-three/drei';
import './App.css'; 

// --- Import custom effects ---
import DecryptedText from './DecryptedText';
import MagicRings from './MagicRings';

// --- 3D Balloon Component (Slowly Bobs Up & Down) ---
const Balloon = ({ position, color, speedOffset = 0 }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + speedOffset;
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.8) * 0.05;
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[0.04, 0.06, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1.4, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

// --- Custom Falling Confetti Engine ---
const ConfettiRain = ({ count = 75 }) => {
  const pointsRef = useRef();
  const particles = useRef([]);

  useEffect(() => {
    particles.current = Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 8, 
        Math.random() * 5 + 2,     
        (Math.random() - 0.5) * 6  
      ],
      speed: Math.random() * 0.02 + 0.015,
      rotationSpeed: Math.random() * 0.05,
      color: ['#ff69b4', '#00ffcc', '#ffaa00', '#df2020', '#fff34f'][Math.floor(Math.random() * 5)]
    }));
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    
    particles.current.forEach((p) => {
      p.position[1] -= p.speed; 
      if (p.position[1] < -2) {
        p.position[1] = 4;
        p.position[0] = (Math.random() - 0.5) * 8;
      }
    });

    if (pointsRef.current.children) {
      particles.current.forEach((p, idx) => {
        const child = pointsRef.current.children[idx];
        if (child) {
          child.position.set(...p.position);
          child.rotation.y += p.rotationSpeed;
          child.rotation.x += p.rotationSpeed * 0.5;
        }
      });
    }
  });

  return (
    <group ref={pointsRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.08, 0.04, 0.01]} />
          <meshBasicMaterial color={particles.current[i]?.color || '#ffaa00'} />
        </mesh>
      ))}
    </group>
  );
};

// --- Beautiful 3D Flower Decoration Component ---
const Flower = ({ position, scale = 0.15, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fff34f" roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * 2 * Math.PI) / 5;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#ff69b4" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Cinematic Rising Candle Component ---
const RisingCandle = ({ candleLit, setCandleLit }) => {
  const candleGroupRef = useRef();
  const targetY = 1.35;
  const startY = 0.4;
  
  useFrame(() => {
    if (candleGroupRef.current) {
      candleGroupRef.current.position.y += (targetY - candleGroupRef.current.position.y) * 0.04;
    }
  });

  return (
    <group ref={candleGroupRef} position={[0, startY, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 32]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00cc99" emissiveIntensity={0.2} /> 
      </mesh>

      {candleLit ? (
        <group onClick={() => setCandleLit(false)}>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.06, 0.22, 16]} />
            <meshBasicMaterial color="#ffaa00" />
          </mesh>
          <Sparkles count={45} scale={0.8} size={4} position={[0, 0.3, 0]} color="#ffcc00" speed={1.1} />
        </group>
      ) : (
        <group position={[0, 0.3, 0]}>
          <Sparkles count={8} scale={0.3} size={2} color="#cccccc" speed={0.3} />
        </group>
      )}
    </group>
  );
};

// --- High-Impact Animated Wish Reveal Component ---
const AnimatedWishText = () => {
  const groupRef = useRef();
  const progressRef = useRef(0);

  useFrame(() => {
    if (groupRef.current) {
      if (progressRef.current < 1) {
        progressRef.current += 0.035; 
      }
      const t = progressRef.current;
      const p = 0.3; 
      const springScale = Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
      
      groupRef.current.scale.setScalar(springScale);
      groupRef.current.rotation.z = (1 - t) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.3, 0]} scale={[0, 0, 0]}>
      <Text fontSize={0.38} color="#ffff00" fontWeight="bold" anchorX="center" textAlign="center">
        ✨ WISH GRANTED! ✨
      </Text>
      <Text position={[0, -0.32, 0]} fontSize={0.18} color="#ffffff" anchorX="center" textAlign="center">
        May all your birthday dreams come true, Ash!
      </Text>
    </group>
  );
};

// --- Scene Scaling/Fitting Engine Component ---
const SceneFitter = ({ children }) => {
  const { size } = useThree();
  const aspect = size.width / size.height;

  const dynamicScale = aspect < 1.35 ? Math.max(0.44, (aspect / 1.35) * 0.95) : 0.65;
  const dynamicPosY = aspect < 1 ? -0.15 : -0.35;

  return (
    <group scale={dynamicScale} position={[0, dynamicPosY, 0]}>
      {children}
    </group>
  );
};

// --- CLI Component with Spacing and MagicRings Background ---
const CliScreen = ({ onComplete }) => {
  const [text, setText] = useState('');
  const message = "> SYSTEM BOOTING...\n> SCANNING DATABASE FOR THE COOLEST GIRL...\n> LOCATING ASH...\n> TARGET FOUND (100% MATCH).\n> INITIATING SURPRISE SEQUENCE...\n> LOADING ..................";
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setText(message.slice(0, i));
      i++;
      if (i > message.length) {
        clearInterval(typingInterval);
        setTimeout(() => onComplete(), 1000); 
      }
    }, 50); 
    
    return () => clearInterval(typingInterval);
  }, [onComplete]);

  return (
    <div className="cli-container">
      <div className="cli-rings-bg">
        <MagicRings
          color="#A855F7"
          colorTwo="#6366F1"
          ringCount={6}
          speed={1}
          attenuation={10}
          lineThickness={2}
          baseRadius={0.35}
          radiusStep={0.1}
          scaleRate={0.1}
          opacity={0.45} 
          blur={0}
          noiseAmount={0.1}
          rotation={0}
          ringGap={1.5}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={false}
          mouseInfluence={0.2}
          hoverScale={1.2}
          parallax={0.05}
          clickBurst={false}
        />
      </div>

      <div className="cli-text-wrapper">
        <div className="cli-text">
          {text}
          <span className="cursor">_</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Party 3D Scene Component ---
const BirthdayScene = ({ candleLit, setCandleLit }) => {
  const totalDots = 16;
  const dotsArray = Array.from({ length: totalDots });

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
      {candleLit && (
        <div className="game-instruction-banner">
          Click or Tap the candle flame to blow it out!
        </div>
      )}

      <Canvas 
        camera={{ position: [0, 2.4, 6.6], fov: 50 }} 
        style={{ height: '100vh', width: '100vw', background: 'transparent' }} 
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <OrbitControls autoRotate={candleLit} autoRotateSpeed={0.3} maxPolarAngle={Math.PI / 2.1} />
        
        <ambientLight intensity={candleLit ? 0.9 : 0.4} />
        <pointLight position={[0, 4, 2]} color={candleLit ? "#ffffff" : "#ff99aa"} intensity={candleLit ? 1.5 : 0.8} />
        <directionalLight position={[-5, 5, 5]} intensity={candleLit ? 1.2 : 0.5} color="#ffffff" />
        <directionalLight position={[5, -2, 2]} intensity={0.6} color="#ffd1dc" />

        <ConfettiRain count={75} />

        <SceneFitter>
          
          <Balloon position={[-2.2, 0.5, -1.0]} color="#ff69b4" speedOffset={0} />
          <Balloon position={[-2.6, 0.9, -0.5]} color="#00ffcc" speedOffset={2.5} />
          <Balloon position={[2.2, 0.5, -1.0]} color="#fff34f" speedOffset={4.2} />
          <Balloon position={[2.6, 0.9, -0.5]} color="#ffaa00" speedOffset={1.1} />

          {!candleLit && <AnimatedWishText />}

          {/* === THE CAKE GROUP === */}
          <group position={[0, -0.4, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[1.4, 1.4, 0.6, 64]} />
              <meshStandardMaterial color="#ffb6c1" roughness={0.4} /> 
            </mesh>

            {dotsArray.map((_, i) => {
              const angle = (i * 2 * Math.PI) / totalDots;
              return (
                <mesh key={`b-dot-${i}`} position={[Math.cos(angle) * 1.42, 0.58, Math.sin(angle) * 1.42]}>
                  <sphereGeometry args={[0.04, 16, 16]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.1} />
                </mesh>
              );
            })}

            <Flower position={[1.1, 0.4, 0.8]} rotation={[0, Math.PI / 4, 0]} scale={0.14} />
            <Flower position={[-1.1, 0.4, 0.8]} rotation={[0, -Math.PI / 4, 0]} scale={0.14} />
            <Flower position={[0, 0.4, -1.3]} rotation={[0, Math.PI, 0]} scale={0.14} />

            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.9, 0.9, 0.5, 64]} />
              <meshStandardMaterial color="#fffdfa" roughness={0.4} />
            </mesh>

            {dotsArray.map((_, i) => {
              const angle = (i * 2 * Math.PI) / totalDots;
              return (
                <mesh key={`t-dot-${i}`} position={[Math.cos(angle) * 0.92, 1.08, Math.sin(angle) * 0.92]}>
                  <sphereGeometry args={[0.035, 16, 16]} />
                  <meshStandardMaterial color="#ffecf2" roughness={0.1} />
                </mesh>
              );
            })}

            <Flower position={[0.5, 1.12, 0.4]} rotation={[-Math.PI / 2, 0, 0]} scale={0.15} />
            <Flower position={[-0.5, 1.12, -0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={0.15} />
            <Flower position={[0.2, 1.12, -0.5]} rotation={[-Math.PI / 2, 0, 0]} scale={0.12} />

            <RisingCandle candleLit={candleLit} setCandleLit={setCandleLit} />
          </group>

          {/* === THE CARD WITH DECRYPTED TEXT EFFECT === */}
          <group position={[0, -1.3, 2.3]} rotation={[-Math.PI / 11, 0, 0]}>
            <mesh>
              <planeGeometry args={[4.6, 2.4]} />
              <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
            
            <Text position={[0, 0.6, 0.02]} fontSize={0.32} color="#d81b60" fontWeight="bold" anchorX="center">
              Happy Birthday, Ash! 🎉
            </Text>
            
            <Html
              position={[0, -0.2, 0.05]} 
              transform                  
              occlude                    
              distanceFactor={3.2}       
              style={{ width: '450px', textAlign: 'center', pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="card-custom-text-layer">
                <DecryptedText
                  text="You bring so much joy and positive energy everywhere you go, and having you around always makes the day ten times better. You are an absolutely awesome and incredible person. I hope your special day is packed with fun, happiness, and everything you've been wishing for! Cheers to you!"
                  animateOn="view"
                  revealDirection="start"
                  sequential
                  speed={40}
                  useOriginalCharsOnly={false}
                />
              </div>
            </Html>
          </group>

        </SceneFitter>
      </Canvas>
    </div>
  );
};

// --- Main App Entry ---
export default function App() {
  const [show3D, setShow3D] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const audioRef = useRef(null);

  // Background window listener handles implicit browser rules
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            window.removeEventListener('keydown', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
          })
          .catch(err => console.log("Audio waiting for player interaction context:", err));
      }
    };

    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    return () => {
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  const handleTransition = () => {
    setIsFading(true);
    setTimeout(() => {
      setShow3D(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, 400);
  };

  return (
    <div className={`main-wrapper ${isFading ? 'fade-active' : ''}`}>
      
      {!show3D ? (
        <CliScreen onComplete={handleTransition} />
      ) : (
        <div className="scene-container global-fade-in">
          <BirthdayScene candleLit={candleLit} setCandleLit={setCandleLit} />
        </div>
      )}

      {/* Visible media dock at bottom of the body viewport layout */}
      <div className="audio-player-dock">
        <span className="audio-hint">🎵 Press any key, tap screen, or play manually:</span>
        <audio 
          ref={audioRef} 
          src="/cold.mp3" 
          controls 
          loop 
          preload="auto"
        />
      </div>
    </div>
  );
}