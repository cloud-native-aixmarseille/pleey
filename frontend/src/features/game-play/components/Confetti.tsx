import { useEffect, useState } from 'react';
import { createStyles } from "../../../shared/ui/styles";

const styles = createStyles("Confetti", {
  slot1: "fixed inset-0 pointer-events-none z-50 overflow-hidden",
});


interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  shape: 'square' | 'circle' | 'triangle';
  size: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#6b48ff', '#ff33c6', '#00ffcc', '#00ff41', '#ff0000', '#ffff00'];
    const shapes: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle'];
    
    // Create confetti pieces
    const confettiPieces: ConfettiPiece[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 50,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: Math.random() * 10 + 5,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2 + 1
      },
      rotationSpeed: (Math.random() - 0.5) * 10
    }));

    setPieces(confettiPieces);

    // Animate confetti
    const interval = setInterval(() => {
      setPieces(prevPieces =>
        prevPieces.map(piece => {
          const newY = piece.y + piece.velocity.y;
          const newX = piece.x + piece.velocity.x;
          const newRotation = piece.rotation + piece.rotationSpeed;

          // Reset piece if it falls off screen
          if (newY > 110) {
            return {
              ...piece,
              y: -10,
              x: Math.random() * 100,
              rotation: Math.random() * 360
            };
          }

          // Bounce off sides
          let velocityX = piece.velocity.x;
          let x = newX;
          if (newX < 0 || newX > 100) {
            velocityX = -velocityX;
            x = newX < 0 ? 0 : 100;
          }

          return {
            ...piece,
            x,
            y: newY,
            rotation: newRotation,
            velocity: { ...piece.velocity, x: velocityX }
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const renderShape = (piece: ConfettiPiece) => {
    const style = {
      left: `${piece.x}%`,
      top: `${piece.y}%`,
      transform: `rotate(${piece.rotation}deg)`,
      width: `${piece.size}px`,
      height: `${piece.size}px`,
      backgroundColor: piece.color,
      position: 'absolute' as const,
      transition: 'all 0.05s linear',
      pointerEvents: 'none' as const,
      opacity: 0.8
    };

    switch (piece.shape) {
      case 'circle':
        return (
          <div
            key={piece.id}
            style={{ ...style, borderRadius: '50%' }}
          />
        );
      case 'triangle':
        return (
          <div
            key={piece.id}
            style={{
              ...style,
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`
            }}
          />
        );
      default: // square
        return (
          <div
            key={piece.id}
            style={style}
          />
        );
    }
  };

  return (
    <div 
      {...styles.slot1}
      aria-hidden="true"
    >
      {pieces.map(renderShape)}
    </div>
  );
}
