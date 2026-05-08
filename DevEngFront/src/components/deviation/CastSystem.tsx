import { useState, useEffect } from "react";
import { CastMember } from "./CastMember";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "react-router-dom";
import { useCastMembers } from "../../hooks/use-cast-members";
import { CastMemberType } from "./CastMemberCard";
import { useSessionQuery, useUpdateSessionMeta } from "../../hooks/use-session";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface CastSystemProps {
  sessionId: string;
}

export default function CastSystem({ sessionId }: CastSystemProps) {
  const { useCastMembersQuery } = useCastMembers();
  const {
    data: castMembers,
    isLoading: isLoadingCast,
    isError: isErrorCast,
    error: errorCast,
  } = useCastMembersQuery();

  const {
    data: sessionData,
    isLoading: isLoadingSession,
    refetch: refetchSession,
  } = useSessionQuery(sessionId);
  const updateSessionMetaMutation = useUpdateSessionMeta(sessionId);

  const [enabledCastIds, setEnabledCastIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (sessionData?.meta?.enabledCastIds) {
      setEnabledCastIds(new Set(sessionData.meta.enabledCastIds));
    }
  }, [sessionData]);

  const handleToggleCastEnabled = async (castId: string) => {
    const newEnabledIdsSet = new Set(enabledCastIds);
    if (newEnabledIdsSet.has(castId)) {
      newEnabledIdsSet.delete(castId);
    } else {
      newEnabledIdsSet.add(castId);
    }
    setEnabledCastIds(newEnabledIdsSet);

    try {
      await updateSessionMetaMutation.mutateAsync({
        enabledCastIds: Array.from(newEnabledIdsSet),
      });
    } catch (e) {
      setEnabledCastIds((current) => {
        const reverted = new Set(current);
        if (newEnabledIdsSet.has(castId)) {
          reverted.delete(castId);
        } else {
          reverted.add(castId);
        }
        return reverted;
      });
      console.error("Failed to update session meta with enabled cast IDs:", e);
    }
  };

  if (isLoadingCast || isLoadingSession) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading Cast System...</p>
      </div>
    );
  }

  if (isErrorCast) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="mt-2 text-destructive-foreground text-center">
          Error loading cast members: {errorCast?.message || "Unknown error"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4 mb-4 mt-4 w-full px-2 sm:px-4 "
      >
        {/*  Heading */}
        <h2
          className=" text-lg sm:text-xl md:text-2xl font-medium text-color text-center sm:text-left w-full sm:w-auto"
        >
          Cast System
        </h2>

        {/*  Button */}
        <Link to="/dashboard/cast-members/new" className="w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            className="
        w-full sm:w-auto 
        flex items-center justify-center 
        bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
        text-white font-medium 
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
        hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
        border border-white/50 
        backdrop-blur-3xl
        transition duration-300 ease-out
        py-2 px-4 md:px-5
        rounded-xl
      "
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="truncate">Add Cast Member</span>
          </Button>
        </Link>
      </div>


      {castMembers && castMembers.length > 0 ? (
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 "
          >
            {castMembers.map((cast) => (
              <motion.div key={cast.id} variants={itemVariants} className={enabledCastIds.has(cast.id) ? "glass-search-cc " : "glass-tabs"}>
                <CastMember
                  castMember={cast}
                  isEnabled={enabledCastIds.has(cast.id)}
                  onToggleEnabled={handleToggleCastEnabled}
                />
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-lg font-medium text-muted-foreground">
            No cast members found.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Create a new cast member to get started.
          </p>
          <Link to="/dashboard/cast-members/new">
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Create Cast Member
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
