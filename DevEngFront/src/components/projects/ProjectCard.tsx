import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Trash2, Loader2, MoreVertical, Edit } from "lucide-react";
import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ProjectType {
  id: string;
  title: string;
  description: string;
  agentCount: number;
  createdAt: Date;
  avatar?: string | null;
}

interface ProjectCardProps {
  project: ProjectType;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteProject = useProjects().useDeleteProject();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(project.createdAt);


  // const handleEditClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   navigate(`/dashboard/projects/${project.id}/edit`);
  // };

  const confirmDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <Card
     className=" glass-project-card w-full max-w-[320px] h-[260px] relative overflow-hidden transition-all duration-300 mx-auto"
      onClick={() => navigate(`/dashboard/projects/${project.id}`)}
    >
      {/* Background Image directly in component */}
      <div
        className="absolute inset-0 z-0 rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: `url(${project.avatar || "/default-placeholder.png"})`,
          opacity: 0.9,
        }}
      />

      {/* Main content above background */}
      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-end">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>

            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-18 w-18 text-white hover:bg-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-dropdown-menu">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);        // close dropdown
                  setIsDeleteDialogOpen(true); // open delete dialog
                }}
                className="flex items-center gap-2 text-white hover:bg-white/30"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-2 relative z-10 flex flex-col justify-end">
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md rounded-b-2xl">

          <div className="relative w-full flex">
            <div className="flex flex-col flex-grow">
              <CardTitle className="text-xl font-medium font-ubuntu text-color drop-shadow-sm">
                {project.title}
              </CardTitle>
              <CardDescription className="text-sm font-400 font-ubuntu text-color mt-1">
                {project.description}
              </CardDescription>
              <div className="flex items-center text-xs font-medium text-color mt-2">
                <CalendarDays className="h-4 w-4 mr-2 text-color font-ubuntu" />
                {formattedDate}
              </div>
            </div>

            <div className="absolute bottom-0 right-0">
              <Link to={`/dashboard/projects/${project.id}`}>
                <Button className="glass-dark-button text-sm font-ubuntu">
                  Open Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Bottom overlay fade */}
      <div className="absolute bottom-0 left-0 right-0 z-0 h-16 bg-gradient-to-t from-black/40 to-transparent rounded-b-2xl" />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="glass-tabs-alert">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );

}
