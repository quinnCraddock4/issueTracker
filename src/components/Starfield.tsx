import { useEffect, useRef } from 'react';

function generateStarShadows(count: number): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
}

const Starfield = () => {
  const starsRef = useRef<HTMLDivElement>(null);
  const stars2Ref = useRef<HTMLDivElement>(null);
  const stars3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (starsRef.current) {
      starsRef.current.style.boxShadow = generateStarShadows(700);
    }
    if (stars2Ref.current) {
      stars2Ref.current.style.boxShadow = generateStarShadows(200);
    }
    if (stars3Ref.current) {
      stars3Ref.current.style.boxShadow = generateStarShadows(100);
    }
  }, []);

  return (
    <>
      <div id="stars" ref={starsRef}></div>
      <div id="stars2" ref={stars2Ref}></div>
      <div id="stars3" ref={stars3Ref}></div>
    </>
  );
};

export default Starfield;

