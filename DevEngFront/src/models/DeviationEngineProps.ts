// deviation-engine-props.ts
import { ReactNode } from "react";

export interface CardData {
  title: string;
  description: string;
  imageUrl?: string; // Optional image per card
}

export interface DeviationEngineSectionProps {
  title?: string;
  heading: ReactNode;
  description?: string;
  cards: CardData[];
  showLearnMore: boolean;
}
