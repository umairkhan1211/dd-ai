import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ProjectCard, ProjectType } from "@/components/projects/ProjectCard";
import { Link } from "react-router-dom";
import { Plus, Search, Loader2, Divide, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { ScrollArea } from "@/components/ui/scroll-area";



const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { useProjectsQuery } = useProjects();
  const { data: projects = [], isLoading, error } = useProjectsQuery();

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function Divider() {
    return (
      <div className="w-[100%] mx-auto my-2 border-[2px]  border-[#C6C5C5]/50 rounded-r-3xl" />
    )
  }

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <DashboardLayout>
       <ScrollArea className=" pr-4">

      <div className="space-y-4 p-6 md:p-6 ">

   

        <div className="flex flex-col sm:flex-row items-start sm:items-start max-sm:items-center justify-between sm:justify-between max-sm:justify-center gap-3 sm:gap-5 w-full">
          {/* Heading */}
          <h1 className="text-5xl font-bold text-foreground tracking-tight font-ubuntu z-0 text-center max-sm:text-center">
            Projects
          </h1>

          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* New Project Button */}
            <Link to="/dashboard/projects/new" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
        text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
        hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
        border border-white/50 backdrop-blur-3xl transition duration-300 ease-out font-ubuntu text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" /> New Project
              </Button>
            </Link>

            {/* Delete Button */}
            <Link to="/dashboard/projects/new" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-red-500/80 to-red-600/80 
        text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
        hover:shadow-[0_0_12px_rgba(239,68,68,0.9),inset_1px_1px_6px_rgba(244,63,94,0.8)]
        border border-white/50 backdrop-blur-3xl transition duration-300 ease-out font-ubuntu text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete All Projects
              </Button>
            </Link>
          </div>
        </div>


        {/* <div className="py-[1.5px] z-0" >

        <Divider />
        </div>
         */}

        <div className="glass-search flex items-center px-3 py-2">
          <Search className="h-4 w-4 text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Search projects..."
            className="flex-1 bg-transparent outline-none border-none text-white placeholder:text-white/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-card p-8 rounded-2xl text-center border shadow-sm">
            <p className="text-muted-foreground mb-4">
              There was an error loading projects.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 transition-all duration-300"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="dashboard-item"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-card p-8 rounded-2xl text-center border shadow-sm">
            <p className="text-muted-foreground mb-4">
              No projects found. Try another search or create a new project.
            </p>
            <Link to="/dashboard/projects/new">
              <Button>Create New Project</Button>
            </Link>
          </div>
        )}
      </div>
       </ScrollArea>
    </DashboardLayout>
  );
};

export default Projects;
