// Purpose: Provides a subtle glassmorphism parallax backdrop behind the entire app shell.
import { useEffect, useRef } from "react";

const ParallaxBackdrop = () => {
  const ref = useRef(null);

  useEffect(() => {
    const update = () => {
      const node = ref.current;
      if (!node) return;
      const scroll = window.scrollY || 0;
      node.style.setProperty("--parallax-sheet-one", `${scroll * -0.025}px`);
      node.style.setProperty("--parallax-sheet-two", `${scroll * 0.035}px`);
      node.style.setProperty("--parallax-sheet-three", `${scroll * -0.018}px`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div ref={ref} className="parallax-backdrop" aria-hidden="true">
      <div className="parallax-layer parallax-layer-one" />
      <div className="parallax-layer parallax-layer-two" />
      <div className="parallax-layer parallax-layer-three" />
    </div>
  );
};

export default ParallaxBackdrop;
