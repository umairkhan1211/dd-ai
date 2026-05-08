import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { CastMemberType } from "./CastMemberCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CastMemberProps {
  castMember: CastMemberType;
  isEnabled: boolean;
  onToggleEnabled: (id: string) => void;
}


export function CastMember({
  castMember,
  isEnabled,
  onToggleEnabled,
}: CastMemberProps) {
  const handleSwitchChange = () => {
    onToggleEnabled(castMember.id);
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card
        className={`border-none overflow-hidden ${isEnabled ? "" : ""
          } transition-all`}
      >
        <CardContent className="pb-3">
          {castMember.instruction && (
            <p className="text-sm mb-2 line-clamp-2">
              {castMember.instruction}
            </p>
          )}

          {/* <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Tone:</span> {castMember.defaultTone}
          </div> */}
        </CardContent>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-primary/10 text-primary">
              {castMember.avatar ? (
                typeof castMember.avatar === "string" ? (
                  <AvatarImage src={castMember.avatar} alt={castMember.name} />
                ) : (
                  <AvatarImage
                    src={URL.createObjectURL(castMember.avatar)}
                    alt={castMember.name}
                  />
                )
              ) : null}
              <AvatarFallback>
                {castMember.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold">{castMember.name}</h3>
              <p className="text-sm text-muted-foreground">
                {castMember.functionalRole}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {castMember.description && (
            <p className="text-sm mb-2 line-clamp-2">
              {castMember.description}
            </p>
          )}

          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Tone:</span> {castMember.defaultTone}
          </div>

          {/* <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium">Priority:</span> {castMember.priority}
          </div> */}

          {/* <div className="mt-2 flex flex-wrap gap-1">
            {castMember.invocationPhrases?.map(phrase => (
              <span key={phrase} className="text-xs bg-secondary/40 px-2 py-0.5 rounded-full">
                {phrase}
              </span>
            ))}
            {(castMember.invocationPhrases?.length === 0 || !castMember.invocationPhrases) && <span className="text-xs text-muted-foreground italic">No invocation phrases.</span>}
          </div> */}
        </CardContent>

        <CardFooter className="flex justify-end items-center pt-2 pb-3 border-t border-border/30 mt-auto">
          <Label
            htmlFor={`cast-member-toggle-${castMember.id}`}
            className="text-sm mr-2 text-muted-foreground"
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id={`cast-member-toggle-${castMember.id}`}
            checked={isEnabled}
            onCheckedChange={handleSwitchChange}
            aria-label={`Toggle ${castMember.name}`}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
