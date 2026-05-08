import { FeatureItem } from "./FeatureItem";

export interface ReusableHomeFeatureProps {
  title?: string;
  heading?: string;
  heading2?: string;
  description?: string | React.ReactNode;
  features?: FeatureItem[];
  rightContent?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}
