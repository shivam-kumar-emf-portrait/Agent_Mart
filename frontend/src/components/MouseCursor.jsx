import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MouseCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useSpring(0, { damping: 20, stiffness: 100 });
  const cursorY = useSpring(0, { damping: 20, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleHover = (e) => {
      const target = e.target;
      if (target.closest('button') || target.closest('a') || target.closest('.hover-target')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-indigo-500 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          scale: isHovering ? 2 : 1,
          backgroundColor: isHovering ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 bg-indigo-500 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: 14,
          translateY: 14,
        }}
      />
    </>
  );
}
