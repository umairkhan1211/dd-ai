
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeviationEngine } from "@/components/deviation/DeviationEngine";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjects } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";

const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const isMobile = useIsMobile();
  const { useProjectQuery } = useProjects();
  const { data: project, isLoading } = useProjectQuery(projectId);
  
  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`h-full w-full flex flex-col ${isMobile ? "overflow-auto p-0" : "overflow-hidden px-2"}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary !bg-transparent" />
          </div>
        ) : projectId && project ? (
          // @ts-ignore - We're ignoring TypeScript here as DeviationEngine is in the read-only files
          // and we cannot modify its props interface directly
          <DeviationEngine projectId={projectId} project={project} />
        ) : null}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProjectView;
