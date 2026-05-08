import { FeatureItem } from "./FeatureItem";

export interface ReusableFeatureProps {
  title?: string;
  heading?: string;
  description?: string | React.ReactNode;
  features?: FeatureItem[];
  rightContent?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}
