
import React from 'react';
import { FoodItem } from '../types';

interface FoodOverlayProps {
  image: string;
  items: FoodItem[];
}

const FoodOverlay: React.FC<FoodOverlayProps> = ({ image, items }) => {
  return (
    <div className="relative w-full aspect-square bg-neutral-100 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
      <img 
        src={`data:image/jpeg;base64,${image}`} 
        className="w-full h-full object-cover" 
        alt="Analyzed meal" 
      />
      <svg 
        viewBox="0 0 1000 1000" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        {items.map((item) => {
          const { xmin, ymin, xmax, ymax } = item.boundingBox;
          const width = xmax - xmin;
          const height = ymax - ymin;
          
          return (
            <g key={item.id}>
              <rect
                x={xmin}
                y={ymin}
                width={width}
                height={height}
                fill="none"
                stroke="#4ade80"
                strokeWidth="4"
                rx="10"
              />
              <rect
                x={xmin}
                y={ymin - 35 > 0 ? ymin - 35 : ymin}
                width={Math.min(width, 200)}
                height="35"
                fill="#4ade80"
                rx="4"
              />
              <text
                x={xmin + 10}
                y={ymin - 10 > 25 ? ymin - 10 : ymin + 25}
                fill="black"
                fontSize="24"
                fontWeight="bold"
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default FoodOverlay;
