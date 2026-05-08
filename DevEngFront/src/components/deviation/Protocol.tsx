import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ProtocolProps {
  id: string;
  name: string;
  description: string;
  color: string;
  triggerButton: string;
  disabled?: boolean;
  onActivate?: (id: string) => void;
}

export function Protocol({
  id,
  name,
  description,
  color,
  triggerButton,
  disabled = false,
  onActivate,
}: ProtocolProps) {
  const { toast } = useToast();

  const handleClick = () => {
    if (onActivate) {
      onActivate(id);
    } else {
      toast({
        title: `${name} Protocol Activated`,
        description: `The ${name} protocol has been triggered.`,
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={handleClick}
              className={`w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-border/40 ${
                color ? `hover:border-${color}` : ""
              }`}
              disabled={disabled}
            >
              <div className="w-full">
                <h3 className="font-medium text-primary">{name}</h3>
                <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {description}
                </p>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs z-50">
            <p className="text-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}
