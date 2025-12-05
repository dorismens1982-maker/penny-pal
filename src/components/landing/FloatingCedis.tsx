import { useEffect, useState } from 'react';

interface Cedi {
    id: number;
    left: string;
    delay: string;
    duration: string;
    size: string;
    opacity: number;
    rotation: string;
}

export const FloatingCedis = () => {
    const [cedis, setCedis] = useState<Cedi[]>([]);

    useEffect(() => {
        // Generate constant positions on mount to avoid re-renders causing jumps
        const newCedis: Cedi[] = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${15 + Math.random() * 10}s`,
            size: `${40 + Math.random() * 50}px`, // Larger size for better 3D visibility
            opacity: 0.4 + Math.random() * 0.3, // Semi-transparent (0.4 - 0.7)
            rotation: `${Math.random() * 360}deg`
        }));
        setCedis(newCedis);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-50 h-full w-full">
            <style>
                {`
          @keyframes float-up-spin {
            0% {
              transform: translateY(0) rotate(0deg) rotateX(0deg);
              opacity: 0;
            }
            10% {
               opacity: var(--target-opacity);
            }
            90% {
               opacity: var(--target-opacity);
            }
            100% {
              transform: translateY(-110vh) rotate(360deg) rotateX(180deg);
              opacity: 0;
            }
          }
        `}
            </style>
            {cedis.map((cedi) => (
                <div
                    key={cedi.id}
                    className="absolute bottom-0 text-primary font-bold flex items-center justify-center select-none"
                    style={{
                        left: cedi.left,
                        fontSize: cedi.size,
                        width: cedi.size,
                        height: cedi.size,
                        '--target-opacity': cedi.opacity,
                        animation: `float-up-spin ${cedi.duration} linear infinite`,
                        animationDelay: cedi.delay,
                        transform: `rotate(${cedi.rotation})`,
                        // 3D Translucent Gold Coin Effect
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(184, 134, 11, 0.6) 50%, rgba(255, 215, 0, 0.6) 100%)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        border: '2px solid rgba(218, 165, 32, 0.7)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        borderRadius: '50%',
                        position: 'absolute',
                        bottom: '-100px',
                    } as React.CSSProperties}
                >
                    ₵
                </div>
            ))}
        </div>
    );
};
