import { useTranslation } from "react-i18next";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import getCroppedImg from "./utils/cropImage";

// Paint brush style cursor
const BRUSH_CURSOR = `url('data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <circle cx="16" cy="16" r="6" fill="black" />
</svg>
`)}') 16 16, crosshair`;


const ERASER_CURSOR = `url('data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
<rect x="4" y="4" width="16" height="16" fill="white" stroke="black" stroke-width="2"/>
</svg>
`)}') 12 12, crosshair`;

export default function ChatMediaEditor() {
const { t } = useTranslation();
const { state } = useLocation();
const navigate = useNavigate();

const { imageUrl , file , chatId } = state || {};

const imgRef = useRef(null);
const containerRef = useRef(null);
const textRef = useRef(null);

const [caption,setCaption] = useState("");
const [editMode,setEditMode] = useState(false);

const [text,setText] = useState("");
const [isEditingText,setIsEditingText] = useState(false);

const [color,setColor] = useState("#ffffff");
const [fontSize,setFontSize] = useState(16);
const [fontStyle,setFontStyle] = useState("normal");

const [box,setBox] = useState({
x:250,
y:200,
width:260,
height:120
});

const dragRef = useRef(false);
const resizeRef = useRef(false);
const resizeDir = useRef("");

const offset = useRef({x:0,y:0});
const startMouse = useRef({x:0,y:0});
const startSize = useRef({width:0,height:0});

/* CROP */

const [cropMode,setCropMode] = useState(false);

const [crop,setCrop] = useState({
unit:"px",
x:50,
y:50,
width:200,
height:200
});
// Add this with other useState hooks
const [buttonLabel, setButtonLabel] = useState("Send");
// Store the current image file (original or cropped)
const [currentFile, setCurrentFile] = useState(file); 
const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
const [penMode, setPenMode] = useState(false); // pen/eraser active
const [eraserMode, setEraserMode] = useState(false); // eraser toggle
const [drawing, setDrawing] = useState(false);
const [paths, setPaths] = useState([]);
const currentPath = useRef([]);
const currentPathType = useRef("pen"); 
const [cursorStyle, setCursorStyle] = useState("move");
const [textActive, setTextActive] = useState(false); // whether text box exists on canvas
const isVideo =
file?.type?.startsWith("video") ||
imageUrl?.match(/\.(mp4|webm|ogg)$/i);
// Keep a reference to the original box size to prevent shrinking
const originalBox = useRef(box);
const [textBoxes, setTextBoxes] = useState([]); // stores all text boxes
const [currentBoxId, setCurrentBoxId] = useState(null); // current editing box
const [toolbarVisible, setToolbarVisible] = useState(false);
const [undoStack, setUndoStack] = useState([]);
const [redoStack, setRedoStack] = useState([]);


const closeToolbar = () => {
  setToolbarVisible(false);
};


useEffect(() => {
  const handleGlobalClick = (e) => {
    const toolbar = document.getElementById("editor-toolbar");

    // ✅ Close toolbar if clicked outside
    if (toolbarVisible) {
      if (!toolbar || !toolbar.contains(e.target)) {
        setToolbarVisible(false);
      }
    }

    // ✅ Handle text box behavior
    if (textActive) {
      let clickedInsideBox = false;

      textBoxes.forEach(box => {
        const el = document.getElementById(`textbox-${box.id}`);

        if (el && (el === e.target || el.contains(e.target))) {
          clickedInsideBox = true;
        }
      });

      // ❌ Clicked outside
      if (!clickedInsideBox) {
        const currentBox = textBoxes.find(b => b.id === currentBoxId);

        // 🔥 DELETE if empty
        if (currentBox && (!currentBox.text || currentBox.text.trim() === "")) {
          setTextBoxes(prev => prev.filter(b => b.id !== currentBoxId));
        }

        // ✅ Stop editing
        setIsEditingText(false);
        setCurrentBoxId(null);
        setTextActive(false);
      }
    }
  };

  window.addEventListener("mousedown", handleGlobalClick);
  return () => window.removeEventListener("mousedown", handleGlobalClick);
}, [toolbarVisible, textActive, textBoxes, currentBoxId]);

const saveState = () => {
  setUndoStack(prev => [
    ...prev,
    {
      textBoxes: JSON.parse(JSON.stringify(textBoxes)),
      paths: JSON.parse(JSON.stringify(paths))
    }
  ]);

  // Clear redo on new action
  setRedoStack([]);
};

const handleUndo = () => {
  if (undoStack.length === 0) return;

  const lastState = undoStack[undoStack.length - 1];

  setRedoStack(prev => [
    ...prev,
    {
      textBoxes: JSON.parse(JSON.stringify(textBoxes)),
      paths: JSON.parse(JSON.stringify(paths))
    }
  ]);

  setTextBoxes(lastState.textBoxes);
  setPaths(lastState.paths);

  setUndoStack(prev => prev.slice(0, -1));
};

const handleRedo = () => {
  if (redoStack.length === 0) return;

  const nextState = redoStack[redoStack.length - 1];

  setUndoStack(prev => [
    ...prev,
    {
      textBoxes: JSON.parse(JSON.stringify(textBoxes)),
      paths: JSON.parse(JSON.stringify(paths))
    }
  ]);

  setTextBoxes(nextState.textBoxes);
  setPaths(nextState.paths);

  setRedoStack(prev => prev.slice(0, -1));
};

const addText = () => {
  saveState();
  const container = containerRef.current;
  if (!container) return;

  setIsEditingText(false);
  setCurrentBoxId(null);

  const newId = textBoxes.length + 1;

  const initialBox = {
    id: newId,
    x: container.clientWidth / 2,
    y: container.clientHeight / 2,
    width: 260,
    height: 120,
    text: "",
    color: "#000000",
    fontSize: fontSize,
    fontStyle: fontStyle
  };

  setTextBoxes(prev => [...prev, initialBox]);
  setCurrentBoxId(newId);
  setIsEditingText(true);
  setTextActive(true);
  setText(initialBox.text); // current text value

  originalBox.current = { ...initialBox }; // store original size

  setTimeout(() => textRef.current?.focus(), 100);
};


const startDrag = (e, boxItem) => {
  saveState();
  if (!editMode || !isEditingText || resizeRef.current) return;

  e.preventDefault();
  e.stopPropagation();

  dragRef.current = true;
  setCursorStyle("grabbing");

  offset.current = {
    x: e.clientX - boxItem.x,
    y: e.clientY - boxItem.y
  };

  setCurrentBoxId(boxItem.id);
};

const stopAll = () => {
  dragRef.current = false;
  resizeRef.current = false;
  setCursorStyle("move"); // reset cursor
};


/* RESIZE */

const startResize = (dir,e)=>{
saveState();
e.preventDefault();
e.stopPropagation();

if (!editMode) return;
resizeRef.current=true;
resizeDir.current=dir;

startMouse.current={
x:e.clientX,
y:e.clientY
};

startSize.current={
width:box.width,
height:box.height
};

};


/* MOUSE MOVE */

const moveMouse = (e)=>{

const container = containerRef.current;
if(!container) return;

const rect = container.getBoundingClientRect();

/* DRAG */

if (dragRef.current && currentBoxId !== null) {

  const img = imgRef.current;
  if (!img) return;

  const imgRect = img.getBoundingClientRect();

  let newX = e.clientX - offset.current.x;
  let newY = e.clientY - offset.current.y;

  setTextBoxes(prev =>
    prev.map(box => {
      if (box.id !== currentBoxId) return box;

      const halfW = box.width / 2;
      const halfH = box.height / 2;

      const minX = imgRect.left - rect.left + halfW;
      const maxX = imgRect.right - rect.left - halfW;

      const minY = imgRect.top - rect.top + halfH;
      const maxY = imgRect.bottom - rect.top - halfH;

      if (newX < minX) newX = minX;
      if (newX > maxX) newX = maxX;

      if (newY < minY) newY = minY;
      if (newY > maxY) newY = maxY;

      return {
        ...box,
        x: newX,
        y: newY
      };
    })
  );

}

if (resizeRef.current && currentBoxId !== null) {
  setTextBoxes(prev =>
    prev.map(b => {
      if (b.id !== currentBoxId) return b;

      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container) return b;

      const rect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      let { x, y, width, height } = b;
      const minWidth = 80;
      const minHeight = 40;

      let left = x - width / 2;
      let right = x + width / 2;
      let top = y - height / 2;
      let bottom = y + height / 2;

      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      const imgLeft = imgRect.left - rect.left;
      const imgRight = imgRect.right - rect.left;
      const imgTop = imgRect.top - rect.top;
      const imgBottom = imgRect.bottom - rect.top;

      switch (resizeDir.current) {
        case "right":
          right = Math.min(startSize.current.width + dx + (x - width / 2), imgRight);
          width = Math.max(right - left, minWidth);
          x = left + width / 2;
          break;

        case "left":
          left = Math.max(startSize.current.width * -1 + dx + (x + width / 2), imgLeft);
          width = Math.max(right - left, minWidth);
          x = left + width / 2;
          break;

        case "bottom":
          bottom = Math.min(startSize.current.height + dy + (y - height / 2), imgBottom);
          height = Math.max(bottom - top, minHeight);
          y = top + height / 2;
          break;

        case "top":
          top = Math.max(startSize.current.height * -1 + dy + (y + height / 2), imgTop);
          height = Math.max(bottom - top, minHeight);
          y = top + height / 2;
          break;
      }

      return { ...b, x, y, width, height };
    })
  );
}

};

// UPDATE BOX DURING TYPING
const handleTextChange = (e) => {
  saveState();
  const el = e.target;
  const container = containerRef.current;
  const img = imgRef.current;
  if (!el || !container || !img || currentBoxId === null) return;

  setText(el.value);

  // Existing expansion logic (do not change)
  el.style.height = "auto";
  const imgRect = img.getBoundingClientRect();
  const maxWidth = imgRect.width - 10;
  const maxHeight = imgRect.height - 10;

  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${fontStyle === "italic" ? "italic" : ""} ${fontStyle === "bold" ? "bold" : ""} ${fontSize}px sans-serif`;

  const words = el.value.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const buffer = 10;
  let widest = 0;
  lines.forEach(line => {
    const w = ctx.measureText(line).width + 2 * buffer;
    if (w > widest) widest = w;
  });
  const newWidth = Math.min(Math.max(originalBox.current.width, widest), maxWidth);
  const lineHeight = fontSize * 1.2;
  let contentHeight = lineHeight * lines.length + 2 * buffer;
  let newHeight = Math.min(Math.max(originalBox.current.height, contentHeight, el.scrollHeight), maxHeight);

  setBox(prev => ({
    ...prev,
    width: newWidth,
    height: newHeight,
  }));
  el.style.height = `${newHeight}px`;

  setTextBoxes(prev =>
  prev.map(b => {
    if (b.id !== currentBoxId) return b;

    return {
      ...b,
      text: el.value,
      width: newWidth,
      height: newHeight,
      x: b.x, // keep same position
      y: b.y
    };
  })
);
};


const canvasRef = useRef(null);

const drawPaths = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Draw saved paths
  paths
    .filter(p => p.points.length > 0)
    .forEach((p, idx) => {
      ctx.beginPath();
      p.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = p.type === "eraser" ? "rgba(0,0,0,1)" : "#ff0000";
      ctx.lineWidth = p.type === "eraser" ? 15 : 3;
      ctx.globalCompositeOperation = p.type === "eraser" ? "destination-out" : "source-over";
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    });

  // Draw current path while drawing
  if (currentPath.current.length > 0) {
    ctx.beginPath();
    currentPath.current.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = currentPathType.current === "eraser" ? "rgba(0,0,0,1)" : "#ff0000";
    ctx.lineWidth = currentPathType.current === "eraser" ? 15 : 3;
    ctx.globalCompositeOperation = currentPathType.current === "eraser" ? "destination-out" : "source-over";
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }
};

useEffect(() => {
  if (!penMode || !canvasRef.current) return;
  drawPaths();
}, [paths, penMode, currentImageUrl]);

const sendMedia = async () => {
  let finalFile = currentFile; // fallback if no edits

  if (textBoxes.length > 0 || paths.length > 0) {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // 1️⃣ Create canvas matching original image pixels (base layer)
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2️⃣ Create temporary canvas for drawings (pen & eraser)
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = canvas.width;
    drawCanvas.height = canvas.height;
    const drawCtx = drawCanvas.getContext("2d");

    const displayedWidth = img.width;
    const displayedHeight = img.height;
    const offsetX = (container.clientWidth - displayedWidth) / 2;
    const offsetY = (container.clientHeight - displayedHeight) / 2;

    const scaleX = canvas.width / displayedWidth;
    const scaleY = canvas.height / displayedHeight;

    // Draw pen/eraser paths on drawCanvas only
    paths.forEach(path => {
      if (!path.points || path.points.length === 0) return;

      drawCtx.beginPath();
      path.points.forEach((p, i) => {
        const x = (p.x - offsetX) * scaleX;
        const y = (p.y - offsetY) * scaleY;
        if (i === 0) drawCtx.moveTo(x, y);
        else drawCtx.lineTo(x, y);
      });

      drawCtx.lineWidth = path.type === "eraser" ? 15 * scaleX : 3 * scaleX;
      drawCtx.strokeStyle = path.type === "eraser" ? "rgba(0,0,0,1)" : "#ff0000";
      drawCtx.globalCompositeOperation = path.type === "eraser" ? "destination-out" : "source-over";
      drawCtx.stroke();
      drawCtx.globalCompositeOperation = "source-over";
    });

    // Draw text boxes on drawCanvas
    textBoxes.forEach(box => {
      if (!box.text) return;

      const relX = (box.x - offsetX - box.width / 2) / displayedWidth;
      const relY = (box.y - offsetY - box.height / 2) / displayedHeight;
      const relWidth = box.width / displayedWidth;

      const realX = relX * canvas.width;
      const realY = relY * canvas.height;
      const realWidth = relWidth * canvas.width;

      drawCtx.fillStyle = box.color || "#fff";
      drawCtx.font = `${box.fontStyle === "italic" ? "italic " : ""}${box.fontStyle === "bold" ? "bold " : ""}${box.fontSize * scaleX}px sans-serif`;
      drawCtx.textAlign = "left";
      drawCtx.textBaseline = "top";

      const inputLines = box.text.split("\n");
      const lines = [];
      inputLines.forEach(rawLine => {
        let currentLine = "";
        rawLine.split(" ").forEach(word => {
          const testLine = currentLine ? currentLine + " " + word : word;
          if (drawCtx.measureText(testLine).width > realWidth && currentLine !== "") {
            lines.push(currentLine);
            currentLine = word;
          } else currentLine = testLine;
        });
        lines.push(currentLine);
      });

      const lineHeight = box.fontSize * 1.2 * scaleY;
      const padding = 5 * scaleX;
      const startY = realY + padding;

      lines.forEach((line, i) => {
        drawCtx.fillText(line.trim(), realX + padding, startY + i * lineHeight);
      });
    });

    // 3️⃣ Merge drawing layer onto base image
    ctx.drawImage(drawCanvas, 0, 0, canvas.width, canvas.height);

    // 4️⃣ Export final image
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));
    finalFile = new File([blob], "edited.jpg", { type: "image/jpeg" });
  }

  // 5️⃣ Apply crop if needed
  if (cropMode && crop.width && crop.height) {
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const croppedBlob = await getCroppedImg(imgRef.current, {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY
    });

    finalFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
  }

  // 6️⃣ Send to backend
  const formData = new FormData();
  formData.append("image", finalFile);
  formData.append("caption", caption);

  await axios.post(
    `${BASE_URL}/api/chat/send-media/${chatId}`,
    formData,
    { withCredentials: true }
  );

  navigate(-1);
};

const previewHeight = "70vh"; // keep constant

const handleButtonClick = async () => {
  if(buttonLabel === "Save" && cropMode){
    // --- Save the cropped image ---
    const image = imgRef.current;
    if(image && crop.width && crop.height){
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const croppedBlob = await getCroppedImg(image, {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        width: crop.width * scaleX,
        height: crop.height * scaleY
      });

      // Replace original image with cropped one
      const croppedFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
      const newUrl = URL.createObjectURL(croppedFile);
      imgRef.current.src = newUrl; // update preview

      // Reset crop mode and button
      setCropMode(false);
      setButtonLabel("Send");

      setCurrentFile(croppedFile);
setCurrentImageUrl(newUrl);
    }
  } else {
    // Normal send
    await sendMedia();
  }
};

const endDrawing = () => {
  if (currentPath.current.length === 0) return;
  saveState();
  const newPath = {
    points: currentPath.current.map(p => ({ ...p })),
    type: currentPathType.current
  };

  setPaths(prev => {
    const updated = [...prev, newPath];
    return updated;
  });

  currentPath.current = [];
  setDrawing(false);
};

useEffect(() => {
  if (!eraserMode || !drawing) return;

  const eraseText = (x, y) => {
    const textBox = box;
    const halfW = textBox.width / 2;
    const halfH = textBox.height / 2;
    const left = textBox.x - halfW;
    const right = textBox.x + halfW;
    const top = textBox.y - halfH;
    const bottom = textBox.y + halfH;

    if (x >= left && x <= right && y >= top && y <= bottom) {
      setText(""); // erase text
    }
  };

    const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    eraseText(x, y);
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [drawing, eraserMode, box]);


const handleBoxClick = (id) => {
  const box = textBoxes.find(b => b.id === id);
  if (!box) return;

  setCurrentBoxId(id);       // make this box active
  setText(box.text);         // load saved text
  setIsEditingText(true);    // show border
  setTextActive(true);       // mark text active

  originalBox.current = { ...box }; // keep expansion logic intact

  // Use requestAnimationFrame to ensure textarea is focused after render
  requestAnimationFrame(() => textRef.current?.focus());
};

const startDrawing = (clientX, clientY) => {
  if (isEditingText) return;
  if (!editMode || !penMode) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const img = imgRef.current.getBoundingClientRect();

  let x = clientX - rect.left;
  let y = clientY - rect.top;

  x = Math.max(img.left - rect.left, Math.min(x, img.right - rect.left));
  y = Math.max(img.top - rect.top, Math.min(y, img.bottom - rect.top));

  currentPath.current = [{ x, y }];
  currentPathType.current = eraserMode ? "eraser" : "pen";
  setDrawing(true);

  drawPaths();
};

const moveDrawing = (clientX, clientY) => {
  if (!drawing) return;
  if (isEditingText) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const img = imgRef.current.getBoundingClientRect();

  let x = clientX - rect.left;
  let y = clientY - rect.top;

  x = Math.max(img.left - rect.left, Math.min(x, img.right - rect.left));
  y = Math.max(img.top - rect.top, Math.min(y, img.bottom - rect.top));

  currentPath.current.push({ x, y });

  drawPaths();
};


return(

<div className="flex flex-col h-screen text-white backdrop-blur-md">

{/* TOP BAR */}

<div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">

<button
onClick={()=>navigate(-1)}
className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
>
{t("Cancel")}
</button>

<div className="flex gap-3">


<button
  onClick={() => {
    if (!cropMode) {
      console.log("Entering crop mode");
      setCropMode(true);
      setButtonLabel("Save");

      const img = imgRef.current;
      if (img) {
        
        const previewWidth = img.width;
        const previewHeight = img.height;
        const initialWidth = Math.min(200, previewWidth - 20);
        const initialHeight = Math.min(200, previewHeight - 20);

        setCrop({
          unit: "px",
          x: (previewWidth - initialWidth) / 2,
          y: (previewHeight - initialHeight) / 2,
          width: initialWidth,
          height: initialHeight,
        });
      }
    } else {
      console.log("Exiting crop mode");
      setCropMode(false);
      setButtonLabel("Send");
    }
  }}
  className="px-3 py-1 rounded-lg bg-white/10"
>
  {t("Crop")}
</button>

{!isVideo && (
<button
  onClick={() => {
    setEditMode(true);       // keep editMode on
    setToolbarVisible(true);  // always show toolbar on click
  }}
  className="px-3 py-1 rounded-lg bg-white/10"
>
  {t("Edit")}
</button>
)}

<div className="flex gap-2">
  <button
    onClick={handleUndo}
    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
  >
    ←
  </button>

  <button
    onClick={handleRedo}
    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
  >
    →
  </button>
</div>

</div>

<button
  onClick={handleButtonClick}
  className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg"
>
  {t(buttonLabel)}
</button>

</div>


{/* TOOLBAR */}
{editMode && toolbarVisible && !isVideo && (
  <div
   id="editor-toolbar" 
    className="absolute z-[9999] flex flex-wrap gap-3 items-center bg-black/30 p-3 rounded-xl shadow-lg backdrop-blur-sm"
        onMouseDown={(e)=>e.stopPropagation()}
  onClick={() => {
  addText();
  setPenMode(false);
  closeToolbar(); // ✅
}}
    style={{
      top: "10%", // slightly higher above the image
      left: "50%",
      transform: "translateX(-50%)",
    }}
  >
    {/* Text */}
    <button
      onClick={() => {
        addText();
       closeToolbar();
        setPenMode(false); 
        
      }}
      className="px-4 py-1 bg-[#020617]/90  rounded-lg transition"
    >
      {t("Text")}
    </button>

    {/* Font size */}
    <select
      value={fontSize}
      onChange={(e) => setFontSize(Number(e.target.value))}
      className="bg-[#020617]/90 border border-white/20 rounded-lg px-2 py-1 text-sm hover:border-white/40 transition"
    >
      <option value={16}>16</option>
      <option value={24}>24</option>
      <option value={32}>32</option>
      <option value={48}>48</option>
      <option value={64}>64</option>
    </select>

    {/* Color */}
    <input
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      className="w-10 h-8 p-0 border-none rounded-lg cursor-pointer"
    />

    {/* Font style */}
    <select
      value={fontStyle}
      onChange={(e) => setFontStyle(e.target.value)}
      className="bg-[#020617]/90 border border-white/20 rounded-lg px-2 py-1 text-sm hover:border-white/40 transition"
    >
      <option value="normal">{t("Normal")}</option>
      <option value="bold">{t("Bold")}</option>
      <option value="italic">{t("Italic")}</option>
    </select>

    {/* Pen */}
    <button
      onClick={() => {
        setPenMode(true);
        setEraserMode(false);
        closeToolbar();
      }}
      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition"
    >
      ✏️
    </button>

    {/* Eraser */}
    <button
      onClick={() => {
        setPenMode(true);
        setEraserMode(true);
        closeToolbar();;
      }}
      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition"
    >
      🧽
    </button>
  </div>
)}


{/* MEDIA */}

<div
ref={containerRef}
className="flex-1 flex items-center justify-center relative overflow-hidden"
onMouseMove={moveMouse}
onMouseUp={stopAll}
onMouseLeave={stopAll}
onTouchMove={(e)=>{
  const touch = e.touches[0];

  moveMouse({
    clientX: touch.clientX,
    clientY: touch.clientY
  });
}}

onTouchEnd={stopAll}
>

{isVideo ? (

<video
src={imageUrl}
controls
autoPlay
style={{
maxHeight:previewHeight,
maxWidth:"100%",
objectFit:"contain"
}}
/>

) : cropMode ? (
    <ReactCrop
      crop={crop}
      onChange={(newCrop) => {
      
        setCrop(prev => ({ ...prev, ...newCrop }));
      }}
      onComplete={(c) => {
       
        setCrop(prev => ({ ...prev, ...c }));
      }}
      keepSelection
      style={{ cursor: "grab", position: "relative", zIndex: 1000 }}
    >
      <img
        ref={imgRef}
        src={currentImageUrl}
        
        style={{
          maxHeight: previewHeight,
          maxWidth: "100%",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "auto",
        }}
      />
    </ReactCrop>

) : (

<img
ref={imgRef}
src={currentImageUrl}
style={{
maxHeight:previewHeight,
maxWidth:"100%",
objectFit:"contain"
}}
/>

)}

{textBoxes.map(boxItem => (
  <div
    id={`textbox-${boxItem.id}`}
    key={boxItem.id}
    style={{
      position: "absolute",
      top: boxItem.y - boxItem.height / 2,
      left: boxItem.x - boxItem.width / 2,
      width: boxItem.width,
      height: boxItem.height,
      cursor: currentBoxId === boxItem.id ? cursorStyle : "text",
      userSelect: "text",
      pointerEvents: penMode ? "none" : "auto",
      zIndex: 50
    }}
    className={`${currentBoxId === boxItem.id ? 'border-2 border-indigo-500 shadow-lg rounded-md' : ''}`}
    onClick={() => {
  if (editMode) handleBoxClick(boxItem.id);
}}
  >
    {currentBoxId === boxItem.id ? (
      <textarea
        ref={textRef}
        value={text}
          placeholder="Enter text..."
  onFocus={(e) => {
    if (!text) e.target.placeholder = "";
  }}
  onBlur={(e) => {
    if (!text) e.target.placeholder = "Enter text...";
  }}
        onChange={handleTextChange}
        onMouseDown={(e) => e.stopPropagation()}
onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#000000",
          fontSize: boxItem.fontSize,
          fontWeight: boxItem.fontStyle === "bold" ? "bold" : "normal",
          fontStyle: boxItem.fontStyle === "italic" ? "italic" : "normal",
          resize: "none",
          overflow: "hidden",
          textAlign: "left",
          whiteSpace: "pre-wrap",
          verticalAlign: "top",
          padding: "5px",
          pointerEvents: "auto",
          boxSizing: "border-box"
        }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "5px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: boxItem.color,
          fontSize: boxItem.fontSize,
          fontWeight: boxItem.fontStyle === "bold" ? "bold" : "normal",
          fontStyle: boxItem.fontStyle === "italic" ? "italic" : "normal",
          pointerEvents: "none", // important: allow clicks to pass to parent div
        }}
      >
        {boxItem.text}
      </div>
    )}

    {/* Resize handles */}
    {currentBoxId === boxItem.id && ["top", "right", "bottom", "left"].map(dir => (
      <div
        key={dir}
        onMouseDown={(e) => startResize(dir, e)}
        style={{
          position: "absolute",
          cursor: `${dir}-resize`,
          width: "10px",
          height: "10px",
          background: "white",
          zIndex: 30,
          ...(dir === "top" && { top: -5, left: "50%", transform: "translateX(-50%)" }),
          ...(dir === "bottom" && { bottom: -5, left: "50%", transform: "translateX(-50%)" }),
          ...(dir === "left" && { left: -5, top: "50%", transform: "translateY(-50%)" }),
          ...(dir === "right" && { right: -5, top: "50%", transform: "translateY(-50%)" }),
        }}
      />
    ))}

    {/* Drag handle button under the box */}
    {currentBoxId === boxItem.id && (
      <div
  onMouseDown={(e) => startDrag(e, boxItem)}
  onTouchStart={(e) => {
  const touch = e.touches[0];

  startDrag(
    {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault(){},
      stopPropagation(){}
    },
    boxItem
  );
}}
  style={{
    position: "absolute",
    bottom: -20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "30px",
    height: "10px",
    cursor: "grab",
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
  title="Drag to move"
 >
    <svg width="24" height="12" viewBox="0 0 24 12" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2" cy="2" r="2" fill="white" />
      <circle cx="2" cy="10" r="2" fill="white" />
      <circle cx="8" cy="2" r="2" fill="white" />
      <circle cx="8" cy="10" r="2" fill="white" />
      <circle cx="14" cy="2" r="2" fill="white" />
      <circle cx="14" cy="10" r="2" fill="white" />
      <circle cx="20" cy="2" r="2" fill="white" />
      <circle cx="20" cy="10" r="2" fill="white" />
    </svg>
  </div>
    )}
  </div>
))}

{!isVideo && (
  <canvas
    ref={canvasRef}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      cursor: penMode
    ? eraserMode
      ? ERASER_CURSOR
      :BRUSH_CURSOR
    : "default",
      zIndex: 30,
    }}
   onMouseDown={(e) => {
  if (isEditingText) return; // ❌ prevent drawing when editing text
 if (!editMode || !penMode) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const img = imgRef.current.getBoundingClientRect();

  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  // Clamp inside image bounds
  x = Math.max(img.left - rect.left, Math.min(x, img.right - rect.left));
  y = Math.max(img.top - rect.top, Math.min(y, img.bottom - rect.top));

  currentPath.current = [{ x, y }];
  currentPathType.current = eraserMode ? "eraser" : "pen";
  setDrawing(true);

  drawPaths();
}}
   onMouseMove={(e) => {
  if (!drawing) return;
  if (isEditingText) return; // ❌ prevent drawing while editing

  const rect = canvasRef.current.getBoundingClientRect();
  const img = imgRef.current.getBoundingClientRect();

  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  x = Math.max(img.left - rect.left, Math.min(x, img.right - rect.left));
  y = Math.max(img.top - rect.top, Math.min(y, img.bottom - rect.top));

  currentPath.current.push({ x, y });

  if (eraserMode && currentBoxId !== null) {
  const activeBox = textBoxes.find(b => b.id === currentBoxId);
  if (activeBox) {
    const halfW = activeBox.width / 2;
    const halfH = activeBox.height / 2;
    if (x >= activeBox.x - halfW && x <= activeBox.x + halfW &&
        y >= activeBox.y - halfH && y <= activeBox.y + halfH) {
      setText("");
      setTextBoxes(prev =>
        prev.map(b => b.id === currentBoxId ? { ...b, text: "" } : b)
      );
    }
  }
}

  drawPaths();
}}
    onMouseUp={endDrawing}
    onMouseLeave={endDrawing}

      /* TOUCH EVENTS (mobile) */
  onTouchStart={(e) => {
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
  }}

  onTouchMove={(e) => {
    const touch = e.touches[0];
    moveDrawing(touch.clientX, touch.clientY);
  }}

  onTouchEnd={endDrawing}

  />
)}
</div>


{/* CAPTION */}

<div className="border-t border-white/10 p-4">

<input
placeholder="Add a caption..."
value={caption}
onChange={(e)=>setCaption(e.target.value)}
className="w-full p-3 bg-white/10 border border-white/20 rounded-xl outline-none"
/>

</div>

</div>

);

}
