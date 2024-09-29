import React, { useState, useEffect, useRef, WheelEvent } from "react";

interface ItemSize {
  ratio: string;
  width: number;
  height: number;
  weight: number;
  color: string; // Added color property to ItemSize
}

const App: React.FC = () => {
  const [items, setItems] = useState<ItemSize[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Define moodboard templates with assorted color visualizations
  const sizes: ItemSize[] = [
    {
      ratio: "1:1",
      width: 100,
      height: 100,
      weight: 1,
      color: "rgba(255, 87, 34, 0.5)",
    },
    {
      ratio: "16:9",
      width: 160,
      height: 90,
      weight: 2,
      color: "rgba(33, 150, 243, 0.5)",
    },
    {
      ratio: "4:3",
      width: 120,
      height: 90,
      weight: 2,
      color: "rgba(76, 175, 80, 0.5)",
    },
    {
      ratio: "3:2",
      width: 150,
      height: 100,
      weight: 3,
      color: "rgba(156, 39, 176, 0.5)",
    },
    {
      ratio: "9:16",
      width: 90,
      height: 160,
      weight: 4,
      color: "rgba(255, 193, 7, 0.5)",
    },
  ];

  // Picking a color and size based on defined templates
  const pickSize = (): ItemSize => {
    const totalWeight = sizes.reduce((acc, size) => acc + size.weight, 0);
    let random = Math.floor(Math.random() * totalWeight);

    for (const size of sizes) {
      random -= size.weight;
      if (random < 0) {
        return {
          ...size,
          color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        }; // Generate random color shades for variation
      }
    }
    return {
      ...sizes[0],
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
    }; // Default return with color if none selected
  };

  useEffect(() => {
    if (items.length >= 200) {
      return; // Stop if we reached the limit
    }

    const interval = setInterval(() => {
      setItems((currentItems) => [...currentItems, pickSize()]);
    }, 500); // Add an item every 0.5 seconds

    return () => clearInterval(interval);
  }, [items]);

  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setScale((prevScale) => Math.max(0.1, prevScale + delta));
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.buttons === 1) {
      setPosition({
        x: position.x + event.movementX,
        y: position.y + event.movementY,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return; // Exit if context could not be obtained
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.scale(scale, scale);

      let x = 0,
        y = 0;

      items.forEach((item, index) => {
        ctx.fillStyle = item.color; // Use the pre-assigned color for moodboard aesthetics
        const itemWidth = item.width * scale;
        const itemHeight = item.height * scale;
        const gap = 10 * scale; // Maintain a gap based on scale

        ctx.fillRect(x, y, itemWidth, itemHeight);

        x += itemWidth + gap;
        if (x + itemWidth > canvas.width) {
          x = 0;
          y += itemHeight + gap;
        }
      });

      ctx.restore();
    }
  }, [items, scale, position]);

  return (
    <canvas
      ref={canvasRef}
      width="800"
      height="600"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
    />
  );
};

export default App;
