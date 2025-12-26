
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  boundingBox: BoundingBox;
}

export interface MealRecord {
  id: string;
  timestamp: number;
  image: string;
  items: FoodItem[];
  totalCalories: number;
}

export type ViewType = 'home' | 'scan' | 'history' | 'stats';
