import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useDragControls, useMotionValue } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Pengganti ringan react-swipeable-views berbasis framer-motion.
 *
 * API yang direplikasi (dipakai Portofolio.jsx):
 *  - index: panel aktif
 *  - onChangeIndex(nextIndex): dipanggil saat panel berpindah (swipe/keyboard)
 *  - axis: "x" (LTR) atau "x-reverse" (RTL)
 *
 * Cara kerja: track berisi panel-panel sejajar; tiap langkah index
 * menggeser track sebesar satu lebar viewport (diukur via ResizeObserver).
 * Swipe sentuh/pen memakai drag framer-motion dengan constraints berupa ref
 * viewport sehingga track bisa mengikuti jari lalu terkunci di panel
 * terdekat. Drag mouse sengaja dinonaktifkan agar seleksi teks dan klik di
 * desktop tidak terganggu. Navigasi keyboard (arrow kiri/kanan) tetap aktif.
 */
export default function SwipeablePanels({
  index,
  onChangeIndex,
  axis = "x",
  containerStyle,
  children,
  ...rest
}) {
  const count = Array.isArray(children) ? children.length : 1;
  const isRtl = axis === "x-reverse";
  const dirSign = isRtl ? 1 : -1; // arah translasi track per langkah index

  const viewportRef = useRef(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const dragControls = useDragControls();

  // Ukur lebar viewport; reposition track saat resize.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const targetX = dirSign * index * width;

  // Animasikan track ke panel aktif setiap index/lebar berubah.
  useEffect(() => {
    if (width > 0) {
      animate(x, targetX, { type: "tween", ease: "easeOut", duration: 0.4 });
    }
  }, [targetX, width, x]);

  const clampIndex = useCallback(
    (i) => Math.max(0, Math.min(count - 1, i)),
    [count]
  );

  const commitIndex = useCallback(
    (next) => {
      const clamped = clampIndex(next);
      if (clamped !== index && onChangeIndex) onChangeIndex(clamped);
    },
    [index, onChangeIndex, clampIndex]
  );

  // Navigasi keyboard (pengganti fitur aksesibilitas SwipeableViews).
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") commitIndex(index + (isRtl ? 1 : -1));
      if (e.key === "ArrowRight") commitIndex(index + (isRtl ? -1 : 1));
    },
    [index, commitIndex, isRtl]
  );

  // Mulai drag hanya untuk sentuh/pen (bukan mouse).
  const handlePointerDown = useCallback(
    (e) => {
      if (e.pointerType !== "mouse") dragControls.start(e);
    },
    [dragControls]
  );

  const handleDragEnd = useCallback(
    (_, info) => {
      const threshold = Math.min(120, Math.max(50, width * 0.15));
      const travelled = isRtl ? info.offset.x : -info.offset.x; // >0 = maju ke panel berikutnya
      const flick = Math.abs(info.velocity.x) > 500 && Math.abs(travelled) > 24;

      if (travelled > threshold || (flick && travelled > 0)) {
        commitIndex(index + 1);
      } else if (travelled < -threshold || (flick && travelled < 0)) {
        commitIndex(index - 1);
      } else {
        // Kembali ke panel semula.
        animate(x, targetX, { type: "tween", ease: "easeOut", duration: 0.3 });
      }
    },
    [index, commitIndex, isRtl, width, targetX, x]
  );

  return (
    <div
      ref={viewportRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      aria-live="polite"
      style={{ overflow: "hidden", outline: "none", ...containerStyle }}
      {...rest}
    >
      <motion.div
        drag="x"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={viewportRef}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          x,
          display: "flex",
          width: `${count * 100}%`,
          touchAction: "pan-y",
        }}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={child?.key ?? i}
                aria-hidden={i !== index}
                style={{
                  width: `${100 / count}%`,
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                {child}
              </div>
            ))
          : children}
      </motion.div>
    </div>
  );
}

SwipeablePanels.propTypes = {
  index: PropTypes.number.isRequired,
  onChangeIndex: PropTypes.func,
  axis: PropTypes.oneOf(["x", "x-reverse"]),
  containerStyle: PropTypes.object,
  children: PropTypes.node,
};
