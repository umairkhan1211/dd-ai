import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ProjectCard, ProjectType } from "@/components/projects/ProjectCard";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  CastMemberCard,
  CastMemberType,
} from "@/components/deviation/CastMemberCard";
import { Link, useLocation } from "react-router-dom";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useProjects } from "@/hooks/use-projects";
import { useCastMembers } from "@/hooks/use-cast-members";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { useProjectsQuery } = useProjects();
  const location = useLocation();


  const [castMemberToDelete, setCastMemberToDelete] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  const user = location.state?.user;
  const {
    data: allProjects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: errorProjects,
  } = useProjectsQuery();

  const { useCastMembersQuery, useDeleteCastMember } = useCastMembers();
  const {
    data: allCastMembers,
    isLoading: isLoadingCastMembers,
    isError: isErrorCastMembers,
    error: errorCastMembers,
  } = useCastMembersQuery();

  const deleteMutation = useDeleteCastMember();

  const RECENT_ITEMS_COUNT = 3;

  const recentProjects = useMemo(() => {
    if (!allProjects) return [];
    return [...allProjects]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, RECENT_ITEMS_COUNT);
  }, [allProjects]);

  const recentCastMembers = useMemo(() => {
    if (!allCastMembers) return [];
    return allCastMembers.slice(0, RECENT_ITEMS_COUNT);
  }, [allCastMembers]);

  const handleEditCastMember = (id: string) => {
    navigate(`/dashboard/cast-members/${id}/edit`)
  };


  


  const handleDeleteCastMember = (id: string) => {
    setCastMemberToDelete(id)
    setIsDeleteDialogOpen(true)
  };

  const confirmDelete = () => {
    if (castMemberToDelete) {
      deleteMutation.mutate(castMemberToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setCastMemberToDelete(null);
        },
        onError: () => {
          setIsDeleteDialogOpen(false);
        },
      });
    }
  };


  const sectionVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // function Divider() {
  //   return (
  //     <div className="w-[100%] mx-auto my-2 border-[2px]  border-[#C6C5C5]/50 rounded-r-3xl" />
  //   )
  // }


  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (isLoadingProjects || isLoadingCastMembers) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">
            Loading Dashboard Data...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isErrorProjects || isErrorCastMembers) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Dashboard
          </h2>
          {isErrorProjects && (
            <p className="text-muted-foreground">
              Could not load projects:{" "}
              {errorProjects?.message || "Unknown error"}
            </p>
          )}
          {isErrorCastMembers && (
            <p className="text-muted-foreground">
              Could not load cast members:{" "}
              {errorCastMembers?.message || "Unknown error"}
            </p>
          )}
          <Button onClick={() => window.location.reload()} className="mt-6">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout user={user} >

      <motion.div
        className="space-y-4 p-6 md:p-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >

        <div className="flex items-center justify-between max-sm:justify-center ">
          <div>

            <h1 className=" dashboard-page py-[5px] font-ubuntu text-5xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>

        </div>

        {/* <Divider /> */}

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between mb-5 gap-3 mt-3 max-sm:flex-col max-sm:items-center">
            <h2 className="text-2xl font-medium text-foreground tracking-tight font-ubuntu z-0">
              Recent Projects
            </h2>
            <Link to="/dashboard/projects/new">
              <Button
                size="sm"
                variant="outline"
                className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
   hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[1px] border-white/50
    backdrop-blur-3xl
    transition duration-300 ease-out max-sm:text-sm"
              >
                <Plus className="h-4 w-4 " /> New Project
              </Button>
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-5 ">
              {recentProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="dashboard-item"
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-card/50 p-8 rounded-2xl text-center border shadow-sm"
            >
              <p className="text-muted-foreground mb-4">
                You haven't created any projects yet.
              </p>
              <Link to="/dashboard/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            </motion.div>
          )}
          {allProjects && allProjects.length > RECENT_ITEMS_COUNT && (
            <motion.div variants={itemVariants} className="mt-4 text-right mr-2">
              <Link
                to="/dashboard/projects"
                className="text-lg font-ubuntu gradient-text2 hover:underline transition-all dashboard-page "
              >
                View all projects
              </Link>
            </motion.div>
          )}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between mb-5 gap-3 mt-3 max-sm:flex-col max-sm:items-center">
            <h2 className="text-2xl font-medium text-foreground tracking-tight font-ubuntu z-0">
              Recent Cast Members
            </h2>
            <Link to="/dashboard/cast-members/new">
              <Button
                size="sm"
                variant="outline"
                className="  bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[1px] border-white/50
    backdrop-blur-3xl
    transition duration-300 ease-out max-sm:text-sm max-sm:px-2"
              >
                <Plus className="h-4 w-4 mr-2" /> New Cast Member
              </Button>
            </Link>
          </div>
          {recentCastMembers.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-5 ">
              {recentCastMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="dashboard-item"
                >
                  <CastMemberCard
                    castMember={member}
                    onDelete={handleDeleteCastMember}
                    onEdit={handleEditCastMember}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-card/50 p-8 rounded-2xl text-center border shadow-sm"
            >
              <p className="text-muted-foreground mb-4">
                You haven't created any cast members yet.
              </p>
              <Link to="/dashboard/cast-members/new">
                <Button>Create Your First Cast Member</Button>
              </Link>
            </motion.div>
          )}
          {allCastMembers && allCastMembers.length > RECENT_ITEMS_COUNT && (
            <motion.div variants={itemVariants} className="mt-4 text-right relative z-20">
              <Link
                to="/dashboard/cast-members"
                className="text-lg font-ubuntu gradient-text2 hover:underline transition-all "
              >
                View all cast members
              </Link>
            </motion.div>
          )}
        </motion.section>
      </motion.div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="glass-tabs-alert">
          <AlertDialogHeader
          >
            <AlertDialogTitle className="text-color">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this cast member. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-color">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Dashboard;
