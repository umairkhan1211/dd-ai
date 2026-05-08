export interface EmpowerMindSectionProps {
  title?: string;
  description?: string | React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  imageSrc?: string | null;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}
