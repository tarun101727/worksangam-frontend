import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SIZE = 260;

const ProfilePreviewforhirer = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const imgRef = useRef(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const [scale, setScale] = useState(1); // ✅ zoom state
  const lastDistance = useRef(null);
  const { t } = useTranslation();

  if (!state?.profileImage) return null;

  /* =======================
     HELPERS
  ======================= */
  const getPoint = (e) => {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /* =======================
     DRAG START
  ======================= */
  const startDrag = (e) => {
    if (e.touches?.length === 2) return; // pinch ignore
    e.preventDefault();
    const point = getPoint(e);
    setDragging(true);
    setStart({
      x: point.x - pos.x,
      y: point.y - pos.y,
    });
  };

  /* =======================
     DRAG MOVE + PINCH
  ======================= */
  const onDrag = (e) => {
    if (e.touches && e.touches.length === 2) {
      // ✅ PINCH ZOOM
      const dist = getTouchDistance(e.touches);

      if (lastDistance.current) {
        const diff = dist - lastDistance.current;
        setScale((prev) =>
          Math.min(3, Math.max(0.5, prev + diff * 0.005))
        );
      }

      lastDistance.current = dist;
      return;
    }

    if (!dragging) return;

    e.preventDefault();
    const point = getPoint(e);

    setPos({
      x: point.x - start.x,
      y: point.y - start.y,
    });
  };

  /* =======================
     DRAG END
  ======================= */
  const stopDrag = () => {
    setDragging(false);
    lastDistance.current = null;
  };

  /* =======================
     MOUSE WHEEL ZOOM
  ======================= */
  const handleWheel = (e) => {
    e.preventDefault();

    const zoomSpeed = 0.001;
    setScale((prev) =>
      Math.min(3, Math.max(0.5, prev - e.deltaY * zoomSpeed))
    );
  };

  /* =======================
     CROP & SAVE
  ======================= */
  const cropAndSave = async () => {
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = SIZE;
    canvas.height = SIZE;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const centerX = rect.width / 2 - pos.x;
    const centerY = rect.height / 2 - pos.y;

    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      img,
      (centerX - SIZE / 2) * scaleX,
      (centerY - SIZE / 2) * scaleY,
      SIZE * scaleX,
      SIZE * scaleY,
      0,
      0,
      SIZE,
      SIZE
    );

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.9)
    );

    const croppedURL = URL.createObjectURL(blob);
    const file = new File([blob], "profile.jpg", { type: "image/jpeg" });

    navigate("/signup/hirer", {
      state: { profileImage: croppedURL, file },
    });
  };

  /* =======================
     UI
  ======================= */
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black touch-none"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={onDrag}
      onTouchEnd={stopDrag}
      onWheel={handleWheel} // ✅ desktop zoom
    >
      <div className="relative w-full max-w-md h-[420px] overflow-hidden">

        {/* BLURRED BACKGROUND */}
        <img
          src={state.profileImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
        />

        {/* DRAG + ZOOM IMAGE */}
        <img
          ref={imgRef}
          src={state.profileImage}
          alt="Adjust profile"
          draggable={false}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="absolute cursor-grab active:cursor-grabbing select-none"
          style={{
            top: "50%",
            left: "50%",
            transform: `
              translate(${pos.x}px, ${pos.y}px)
              translate(-50%, -50%)
              scale(${scale})
            `,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />

        {/* CIRCLE */}
        <div
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{
            width: SIZE,
            height: SIZE,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            border: "3px solid #6366F1",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={cropAndSave}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold"
        >
          {t("Use This Photo")}
        </button>
      </div>
    </div>
  );
};

export default ProfilePreviewforhirer;
