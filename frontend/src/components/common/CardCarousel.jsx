// Purpose: Provides reusable horizontal card carousel scrolling with compact controls.
import { Children, useRef } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CardCarousel = ({ children, itemClassName = "min-w-[300px] max-w-[360px]" }) => {
  const scrollerRef = useRef(null);

  const scrollBy = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.min(420, node.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-3 flex justify-end gap-2">
        <button type="button" className="ghost-button h-9 w-9 min-h-9 p-0" onClick={() => scrollBy(-1)} aria-label="Scroll cards left">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" className="ghost-button h-9 w-9 min-h-9 p-0" onClick={() => scrollBy(1)} aria-label="Scroll cards right">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div ref={scrollerRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2">
        {Children.map(children, (child) => (
          <div className={`shrink-0 snap-start ${itemClassName}`}>{child}</div>
        ))}
      </div>
    </div>
  );
};

CardCarousel.propTypes = {
  children: PropTypes.node.isRequired,
  itemClassName: PropTypes.string,
};

export default CardCarousel;
