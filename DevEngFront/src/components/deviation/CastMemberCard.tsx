import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, }
  from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useAiModels } from "@/services/aiModelService";
export interface CastMemberType {
  id: string;
  instruction?: string; name: string; functionalRole: string;
  description?: string; defaultTone: string; avatar: string | File;
  aiModelId?: string;
  aiModelName?: string;
  invocationPhrases?: string[];
  deductedDucks?:string;  
  
}
interface CastMemberCardProps {
  castMember: CastMemberType;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}


export function CastMemberCard({ castMember, onDelete, onEdit }: CastMemberCardProps) {
  const { data: aiModelsResponse  } = useAiModels();

  // find the selected model by id
  const selectedModel = aiModelsResponse?.data.find(
    (model) => model.id === castMember.aiModelId
  );
  // helper: trim description to max 10 words
  const truncateDescription = (text: string, wordLimit = 10) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };


   return (
    <Card className="relative glass-project-card w-full max-w-[320px] h-[260px] mx-auto overflow-hidden border border-white/30 shadow-lg transition-all duration-300">

      {/* Background image */}
      <div
        className="card-inner-background"
        style={{
          backgroundImage: `url(${
            typeof castMember.avatar === "string"
              ? castMember.avatar
              : URL.createObjectURL(castMember.avatar)
          })`,
        }}
      />

      {/* bottom fade overlay */}
      <div className="card-bottom-fade-blur" />

      {/* top bar with profile + name + role + menu */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="text-white">
            <div className="text-sm font-semibold">{castMember.name}</div>
            <div className="text-xs opacity-80">
              {castMember.functionalRole}
            </div>
          </div>
        </div>

        {/* three dots dropdown */}
        {castMember.name !== "Duck" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="glass-more-button h-8 w-8 flex items-center justify-center">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-dropdown-menu">
              <DropdownMenuItem asChild>
                <button
                  onClick={() => onEdit && onEdit(castMember.id)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button
                  onClick={() => onDelete(castMember.id)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* bottom section fixed layout */}
      <div className="relative z-10  p-4 h-full flex flex-col gap-2 justify-end">
        {/* Fixed AI model label */}
        <div className="glass-label-gpt inline-flex items-center gap-2 px-2 py-2 rounded-full text-[10px] justify-center font-medium font-ubuntu uppercase">
          {selectedModel ? (
            <>
              {selectedModel.icon && (
                <img
                  src={selectedModel.icon}
                  alt={selectedModel.displayName}
                  className="h-4 w-4"
                />
              )}
              {selectedModel.displayName}
            </>
          ) : (
            "Unknown Model"
          )}
        </div>
        {/* Description (trimmed) */}
        {castMember.description && (
          <div className="text-xs text-white font-medium font-ubuntu drop-shadow-lg mb-2">
            {truncateDescription(castMember.description, 10)}
          </div>
        )}

      </div>
    </Card>
  );
}