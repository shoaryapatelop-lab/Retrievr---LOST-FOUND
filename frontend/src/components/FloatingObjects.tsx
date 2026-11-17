import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'

interface FloatingItem {
  id: string
  name: string
  src: string
  // Base percentage positions
  top: string
  left?: string
  right?: string
  // Sizing (width in px for mobile / desktop)
  size: { base: number; sm: number; md: number; lg: number }
  // Animation personality
  floatDuration: number
  floatDelay: number
  yOffset: number
  initialRotate: number
  rotateRange: [number, number]
  // Parallax factor (-1 to 1)
  parallaxFactor: number
  // Responsive visibility
  visibilityClass?: string
  zIndex: number
}

const OBJECTS: FloatingItem[] = [
  // 1. Smartphone - Top Left corner (well above headline)
  {
    id: 'smartphone',
    name: 'Smartphone',
    src: '/assets/3d-objects/smartphone.png',
    top: '2%',
    left: '1%',
    size: { base: 50, sm: 65, md: 80, lg: 95 },
    floatDuration: 6.2,
    floatDelay: 0.1,
    yOffset: -14,
    initialRotate: -14,
    rotateRange: [-18, -10],
    parallaxFactor: 0.35,
    visibilityClass: 'hidden sm:block',
    zIndex: 25,
  },
  // 2. Wireless Earbuds - Top Left upper lane (above "Campus Lost & Found")
  {
    id: 'wireless-earbuds',
    name: 'Wireless Earbuds',
    src: '/assets/3d-objects/wireless-earbuds.png',
    top: '3%',
    left: '18%',
    size: { base: 45, sm: 55, md: 70, lg: 80 },
    floatDuration: 5.6,
    floatDelay: 0.8,
    yOffset: -12,
    initialRotate: 14,
    rotateRange: [10, 18],
    parallaxFactor: 0.45,
    visibilityClass: 'hidden md:block',
    zIndex: 26,
  },
  // 3. Modern Backpack - Left gutter (outside text block)
  {
    id: 'backpack',
    name: 'Modern Backpack',
    src: '/assets/3d-objects/backpack.png',
    top: '28%',
    left: '0.5%',
    size: { base: 55, sm: 70, md: 85, lg: 100 },
    floatDuration: 8.4,
    floatDelay: 0.4,
    yOffset: -12,
    initialRotate: -8,
    rotateRange: [-12, -4],
    parallaxFactor: 0.2,
    visibilityClass: 'hidden lg:block',
    zIndex: 24,
  },
  // 4. House Keys - Left margin (left of search bar)
  {
    id: 'house-keys',
    name: 'House Keys',
    src: '/assets/3d-objects/house-keys.png',
    top: '56%',
    left: '0.5%',
    size: { base: 45, sm: 55, md: 68, lg: 80 },
    floatDuration: 7.0,
    floatDelay: 1.4,
    yOffset: -16,
    initialRotate: 8,
    rotateRange: [4, 14],
    parallaxFactor: 0.25,
    visibilityClass: 'hidden sm:block',
    zIndex: 25,
  },
  // 5. Student ID Card - Bottom Left corner (below trust badges)
  {
    id: 'student-id',
    name: 'Student ID Card',
    src: '/assets/3d-objects/student-id.png',
    top: '88%',
    left: '1.5%',
    size: { base: 60, sm: 75, md: 95, lg: 110 },
    floatDuration: 6.8,
    floatDelay: 1.9,
    yOffset: -14,
    initialRotate: -6,
    rotateRange: [-10, -2],
    parallaxFactor: 0.4,
    visibilityClass: 'hidden md:block',
    zIndex: 26,
  },
  // 6. Notebook - Bottom Center-Left (under search area)
  {
    id: 'notebook',
    name: 'Notebook',
    src: '/assets/3d-objects/notebook.png',
    top: '89%',
    left: '19%',
    size: { base: 50, sm: 65, md: 75, lg: 90 },
    floatDuration: 7.4,
    floatDelay: 0.6,
    yOffset: -12,
    initialRotate: 12,
    rotateRange: [8, 16],
    parallaxFactor: 0.3,
    visibilityClass: 'hidden lg:block',
    zIndex: 25,
  },
  // 7. Water Bottle - Top Center (between left copy and right cards)
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    src: '/assets/3d-objects/water-bottle.png',
    top: '2%',
    left: '52%',
    size: { base: 40, sm: 50, md: 60, lg: 75 },
    floatDuration: 6.5,
    floatDelay: 1.2,
    yOffset: -15,
    initialRotate: 16,
    rotateRange: [12, 20],
    parallaxFactor: 0.3,
    visibilityClass: 'hidden md:block',
    zIndex: 25,
  },
  // 8. Over-Ear Headphones - Top Right corner (above right card)
  {
    id: 'headphones',
    name: 'Over-Ear Headphones',
    src: '/assets/3d-objects/headphones.png',
    top: '2%',
    right: '1.5%',
    size: { base: 55, sm: 70, md: 85, lg: 105 },
    floatDuration: 7.2,
    floatDelay: 0.3,
    yOffset: -18,
    initialRotate: 10,
    rotateRange: [6, 15],
    parallaxFactor: 0.4,
    zIndex: 26,
  },
  // 9. Wristwatch - Top Right upper (above right illustration cards)
  {
    id: 'wristwatch',
    name: 'Wristwatch',
    src: '/assets/3d-objects/wristwatch.png',
    top: '3%',
    right: '22%',
    size: { base: 45, sm: 58, md: 70, lg: 85 },
    floatDuration: 5.8,
    floatDelay: 1.6,
    yOffset: -14,
    initialRotate: -14,
    rotateRange: [-18, -10],
    parallaxFactor: 0.45,
    visibilityClass: 'hidden md:block',
    zIndex: 27,
  },
  // 10. Sunglasses - Middle Right edge (outside the card)
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    src: '/assets/3d-objects/sunglasses.png',
    top: '46%',
    right: '0.5%',
    size: { base: 55, sm: 68, md: 82, lg: 100 },
    floatDuration: 6.0,
    floatDelay: 2.1,
    yOffset: -14,
    initialRotate: -10,
    rotateRange: [-14, -6],
    parallaxFactor: 0.35,
    visibilityClass: 'hidden sm:block',
    zIndex: 26,
  },
  // 11. Scientific Calculator - Bottom Right lower lane (below the front card)
  {
    id: 'calculator',
    name: 'Scientific Calculator',
    src: '/assets/3d-objects/calculator.png',
    top: '84%',
    right: '17%',
    size: { base: 45, sm: 55, md: 68, lg: 82 },
    floatDuration: 7.6,
    floatDelay: 0.9,
    yOffset: -14,
    initialRotate: 12,
    rotateRange: [8, 16],
    parallaxFactor: 0.4,
    visibilityClass: 'hidden lg:block',
    zIndex: 26,
  },
  // 12. Cricket Bat - Bottom Right extreme corner
  {
    id: 'cricket-bat',
    name: 'Cricket Bat',
    src: '/assets/3d-objects/cricket-bat.png',
    top: '68%',
    right: '0.5%',
    size: { base: 50, sm: 65, md: 80, lg: 95 },
    floatDuration: 8.0,
    floatDelay: 1.1,
    yOffset: -16,
    initialRotate: -20,
    rotateRange: [-24, -16],
    parallaxFactor: 0.3,
    visibilityClass: 'hidden sm:block',
    zIndex: 25,
  },
  // 13. Stylish Wallet - Bottom Center-Right
  {
    id: 'wallet',
    name: 'Leather Wallet',
    src: '/assets/3d-objects/wallet.png',
    top: '89%',
    right: '33%',
    size: { base: 45, sm: 58, md: 70, lg: 85 },
    floatDuration: 6.4,
    floatDelay: 1.7,
    yOffset: -12,
    initialRotate: 6,
    rotateRange: [2, 10],
    parallaxFactor: 0.35,
    visibilityClass: 'hidden lg:block',
    zIndex: 25,
  },
]

interface FloatingObjectsProps {
  containerRef?: React.RefObject<HTMLElement>
}

export default function FloatingObjects({ containerRef }: FloatingObjectsProps) {
  const prefersReducedMotion = useReducedMotion()
  const localRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Spring physics for smooth parallax
  const springConfig = { damping: 25, stiffness: 120 }
  const mouseX = useSpring(0, springConfig)
  const mouseY = useSpring(0, springConfig)

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const target = containerRef?.current || localRef.current
      if (!target) return
      const rect = target.getBoundingClientRect()
      // Normalize to range [-1, 1] relative to container center
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      mouseX.set(Math.max(-1, Math.min(1, x)))
      mouseY.set(Math.max(-1, Math.min(1, y)))
    }

    const handleMouseLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }

    const targetEl = containerRef?.current || window
    targetEl.addEventListener('mousemove', handleMouseMove as EventListener)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      targetEl.removeEventListener('mousemove', handleMouseMove as EventListener)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [containerRef, mouseX, mouseY, prefersReducedMotion])

  return (
    <div
      ref={localRef}
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-10"
      aria-hidden="true"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-primary-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />

      {OBJECTS.map((item) => (
        <FloatingItemElement
          key={item.id}
          item={item}
          mouseX={mouseX}
          mouseY={mouseY}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          prefersReducedMotion={Boolean(prefersReducedMotion)}
        />
      ))}
    </div>
  )
}

interface ItemElementProps {
  item: FloatingItem
  mouseX: any
  mouseY: any
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
  prefersReducedMotion: boolean
}

function FloatingItemElement({
  item,
  mouseX,
  mouseY,
  hoveredId,
  setHoveredId,
  prefersReducedMotion,
}: ItemElementProps) {
  const isHovered = hoveredId === item.id
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMoveItem = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    // 3D tilt angles
    setTilt({ x: -y * 24, y: x * 24 })
  }

  const handleMouseLeaveItem = () => {
    setTilt({ x: 0, y: 0 })
    setHoveredId(null)
  }

  // Calculate parallax offset based on spring motion
  const [parallaxX, setParallaxX] = useState(0)
  const [parallaxY, setParallaxY] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) return
    const unsubX = mouseX.on('change', (latest: number) => {
      setParallaxX(latest * 30 * item.parallaxFactor)
    })
    const unsubY = mouseY.on('change', (latest: number) => {
      setParallaxY(latest * 25 * item.parallaxFactor)
    })
    return () => {
      unsubX()
      unsubY()
    }
  }, [mouseX, mouseY, item.parallaxFactor, prefersReducedMotion])

  return (
    <motion.div
      className={`pointer-events-auto absolute ${item.visibilityClass || ''}`}
      style={{
        top: item.top,
        left: item.left,
        right: item.right,
        zIndex: isHovered ? 40 : item.zIndex,
        perspective: 800,
      }}
      initial={false}
      animate={
        prefersReducedMotion
          ? {
              x: 0,
              y: 0,
              rotate: item.initialRotate,
            }
          : {
              x: parallaxX,
              y: [parallaxY, parallaxY + item.yOffset, parallaxY],
              rotate: item.rotateRange,
            }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              y: {
                duration: item.floatDuration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: item.floatDelay,
              },
              rotate: {
                duration: item.floatDuration * 1.3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: item.floatDelay * 0.7,
              },
              x: { duration: 0.1 },
            }
      }
    >
      <motion.div
        className="group relative cursor-pointer"
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseMove={handleMouseMoveItem}
        onMouseLeave={handleMouseLeaveItem}
        animate={{
          scale: isHovered ? 1.15 : 1.0,
          rotateX: isHovered ? tilt.x : 0,
          rotateY: isHovered ? tilt.y : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glowing cyan rim aura on hover */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(6, 230, 255, 0.45) 0%, rgba(46, 91, 255, 0.2) 60%, transparent 80%)',
            filter: 'blur(16px)',
            transform: 'scale(1.3)',
          }}
        />

        {/* 3D Render Image */}
        <img
          src={item.src}
          alt={item.name}
          loading="eager"
          className="relative block select-none transition-all duration-300 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_24px_rgba(6,230,255,0.85)] group-hover:brightness-110"
          style={{
            width: `${item.size.base}px`,
            maxWidth: 'none',
          }}
        />

        {/* Responsive sizing overrides */}
        <style>{`
          @media (min-width: 640px) {
            img[alt="${item.name}"] { width: ${item.size.sm}px !important; }
          }
          @media (min-width: 768px) {
            img[alt="${item.name}"] { width: ${item.size.md}px !important; }
          }
          @media (min-width: 1024px) {
            img[alt="${item.name}"] { width: ${item.size.lg}px !important; }
          }
        `}</style>

        {/* Hover label badge with cyan accent */}
        <div
          className={`pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-400/40 bg-ink-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-200 backdrop-blur-md shadow-[0_0_15px_rgba(6,230,255,0.4)] transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          {item.name}
        </div>
      </motion.div>
    </motion.div>
  )
}
