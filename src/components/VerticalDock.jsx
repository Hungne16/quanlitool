import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import './VerticalDock.css';

const DEFAULT_SPRING = {
  stiffness: 400,
  damping: 25,
  mass: 0.4,
};

function DockIcon({
  item,
  mouseY,
  magnification,
  distance,
  iconSize,
  borderRadius,
  springOptions,
  onHover,
  iconRef,
  isActive
}) {
  const wrapperRef = useRef(null);

  const distanceFromMouse = useTransform(mouseY, (val) => {
    const el = wrapperRef.current;
    if (!el) return distance * 100;
    const rect = el.getBoundingClientRect();
    // Calculate distance from the mouse Y to the vertical center of the icon
    return Math.abs(val - (rect.top + rect.height / 2));
  });

  const gaussian = (d) =>
    (magnification - 1) * Math.exp(-(d * d) / (2 * distance * distance)) + 1;

  const sizeRaw = useTransform(distanceFromMouse, (d) => iconSize * gaussian(d));
  const size = useSpring(sizeRaw, springOptions);

  return (
    <motion.div
      ref={wrapperRef}
      className="dock-icon-wrapper"
      style={{ height: size, width: iconSize }}
    >
      <motion.div
        ref={iconRef}
        style={{ width: size, height: size }}
        className="dock-icon-inner"
      >
        <Link
          to={item.path}
          onMouseEnter={() => onHover(iconRef)}
          onMouseLeave={() => onHover(null)}
          aria-label={item.name}
          style={{ borderRadius }}
          className={`dock-icon-button ${isActive ? 'active' : ''}`}
        >
          {item.icon}
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function VerticalDock({
  items,
  magnification = 1.8,
  distance = 120,
  iconSize = 44,
  gap = 8,
  borderRadius = 14,
  springOptions = DEFAULT_SPRING,
}) {
  const location = useLocation();
  const mouseY = useMotionValue(Infinity);
  const dockRef = useRef(null);

  const iconRefs = useRef(items.map(() => React.createRef()));

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [tooltipLeftOffset, setTooltipLeftOffset] = useState(0);

  useEffect(() => {
    if (hoveredIndex === null) return;

    let raf;
    const update = () => {
      const iconEl = iconRefs.current[hoveredIndex]?.current;
      const dockEl = dockRef.current;
      if (iconEl && dockEl) {
        const iconRect = iconEl.getBoundingClientRect();
        const dockRect = dockEl.getBoundingClientRect();
        setTooltipY(iconRect.top - dockRect.top + iconRect.height / 2);
        // Position tooltip to the right of the icon bounding box
        setTooltipLeftOffset(iconRect.right - dockRect.left);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [hoveredIndex]);

  const handleHover = useCallback(
    (ref) => {
      if (ref === null) {
        setHoveredIndex(null);
        return;
      }
      const idx = iconRefs.current.findIndex((r) => r === ref);
      setHoveredIndex(idx >= 0 ? idx : null);
    },
    [],
  );

  return (
    <motion.div
      ref={dockRef}
      className="vertical-dock"
      style={{ gap }}
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
    >
      {items.map((item, i) => {
        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
        return (
          <React.Fragment key={i}>
            <DockIcon
              item={item}
              mouseY={mouseY}
              magnification={magnification}
              distance={distance}
              iconSize={iconSize}
              borderRadius={borderRadius}
              springOptions={springOptions}
              onHover={handleHover}
              iconRef={iconRefs.current[i]}
              isActive={isActive}
            />
          </React.Fragment>
        );
      })}

      <AnimatePresence>
        {hoveredIndex !== null && items[hoveredIndex] && (
          <motion.div
            key="dock-tooltip"
            layoutId="dock-tooltip"
            className="dock-tooltip"
            style={{
              top: tooltipY,
              left: tooltipLeftOffset + 12,
              y: "-50%",
            }}
            initial={{ opacity: 0, x: -6, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.94 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
          >
            <svg
              width="6"
              height="10"
              viewBox="0 0 6 10"
              className="dock-tooltip-arrow"
              style={{ marginRight: '-1px' }}
              aria-hidden
            >
              <path d="M6 0L0 5L6 10" fill="currentColor" />
            </svg>
            <span className="dock-tooltip-text">
              {items[hoveredIndex].name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
