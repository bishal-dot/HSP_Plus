import React, { useRef, useEffect, useState } from "react";

export type Stroke = { x: number; y: number; radius: number };
export type Drawing = Stroke[][];

interface DrawableCanvasProps {
  width: number;
  height: number;
  backgroundColor?: string;
  onChange?: (strokes: Drawing) => void; // send strokes JSON
  existingStrokes?: Drawing; // replay previous strokes
}

const DrawableCanvas: React.FC<DrawableCanvasProps> = ({
  width,
  height,
  backgroundColor = "#f9fafb",
  onChange,
  existingStrokes = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Drawing>(existingStrokes);

  // Draw all strokes on canvas
  const redraw = (ctx: CanvasRenderingContext2D, strokes: Drawing) => {
    ctx.fillStyle = "black";
    strokes.forEach(stroke => {
      stroke.forEach(({ x, y, radius }) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // clear + background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // draw strokes
    redraw(ctx, strokes);
  }, [strokes, width, height, backgroundColor]);

  const startDrawing = () => setDrawing(true);
  const endDrawing = () => {
    setDrawing(false);
    onChange?.(strokes);
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStrokes(prev => {
      const newStrokes = [...prev];
      if (!drawing || newStrokes.length === 0) newStrokes.push([]);
      newStrokes[newStrokes.length - 1].push({ x, y, radius: 2 });
      return newStrokes;
    });

    // draw immediate point
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-4 border-gray-800 rounded-full"
      onMouseDown={startDrawing}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onMouseMove={draw}
    />
  );
};

export default DrawableCanvas;