import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


import {
  CastMemberCard,
  CastMemberType,
} from "@/components/deviation/CastMemberCard";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { useCastMembers } from "@/hooks/use-cast-members";

const CastMembersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTone, setFilterTone] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [castMemberToDelete, setCastMemberToDelete] = useState<string | null>(
    null
  );

  const { useCastMembersQuery, useDeleteCastMember } = useCastMembers();

  const {
    data: castMembers,
    isLoading,
    isError,
    error,
  } = useCastMembersQuery();
  const deleteMutation = useDeleteCastMember();

  const allTones = useMemo(() => {
    if (!castMembers) return [];
    return Array.from(
      new Set(castMembers.map((member) => member.defaultTone.split(", ")[0]))
    ).sort();
  }, [castMembers]);

  const handleDeleteIntent = (id: string) => {
    setCastMemberToDelete(id);
    setIsDeleteDialogOpen(true);
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

  const handleEdit = (id: string) => {
    navigate(`/dashboard/cast-members/${id}/edit`);
  };

  function getNavClss(path: string) {
    const isActive = location.pathname === path
    return isActive
      ? "relative !w-[25svh] flex items-center " +
      "bg-transparent  backdrop-blur-sm " +
      "rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none " +

      "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)] " +

      "before:content-[''] before:absolute before:left-[-2px] before:top-0 before:h-full before:w-3 " +
      "before:bg-[#7B69FF] before:rounded-r-[8px] before:shadow-[0_0_12px_4px_rgba(123,105,255,0.9)] " +


      "text-white"
      : "text-muted-foreground hover:bg-accent/20 " +
      "rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none"
  }

  function Divider() {
    return (
      <div className="w-[100%] mx-auto my-2 border-[2px]  border-[#C6C5C5]/50 rounded-r-3xl" />
    )
  }

  const filteredCastMembers = useMemo(() => {
    if (!castMembers) return [];
    return castMembers.filter((member) => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        member.name.toLowerCase().includes(searchLower) ||
        member.functionalRole.toLowerCase().includes(searchLower) ||
        (member.description &&
          member.description.toLowerCase().includes(searchLower)) ||
        member.defaultTone.toLowerCase().includes(searchLower);
      // 🔹 Commented out invocationPhrases search to avoid errors
      // || member.invocationPhrases.some(phrase =>
      //     phrase.toLowerCase().includes(searchLower)
      // );

      const matchesTone =
        filterTone === "all" ||
        member.defaultTone.toLowerCase().includes(filterTone.toLowerCase());

      return matchesSearch && matchesTone;
    });
  }, [castMembers, searchTerm, filterTone]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-[calc(100vh-theme(space.24))]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-muted-foreground">Loading Cast Members...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="CastMembers space-y-5 p-4 md:p-6 w-full overflow-hidden transition-all duration-300">

          <p>Error loading cast members: {error?.message || "Unknown error"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className=" CastMembers space-y-5 p-4 md:p-6 ">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5 w-full">
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-ubuntu text-color text-center sm:text-left w-full sm:w-auto z-999 relative">
            Cast Members
          </h1>



          {/* Add New Button */}
          <Link to="/dashboard/cast-members/new" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
      text-white font-medium font-ubuntu shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
      border border-white/50 backdrop-blur-3xl transition duration-300 ease-out
      text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" /> New Cast Member
            </Button>
          </Link>
        </div>
        {/* <div className="py-[1.5px] z-0" >

          <Divider />
        </div> */}

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full mt-4">
          <div className="glass-search flex items-center px-3 py-2 w-full md:w-3/4 rounded-lg">
            <Search className="h-4 w-4 text-white/60 mr-2" />
            <input
              type="text"
              placeholder="Search by name, role, tone, description..."
              className="flex-1 bg-transparent outline-none border-none text-white placeholder:text-white/60 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={filterTone}
            onValueChange={setFilterTone}
            disabled={allTones.length === 0}
          >
            <SelectTrigger className="glass-select-trigger w-full md:w-[180px]">
              <SelectValue placeholder="Filter by tone" />
            </SelectTrigger>
            <SelectContent className="glass-select-content">
              <SelectItem value="all" className="glass-select-item font-ubuntu" >
                All Tones
              </SelectItem>
              {allTones.map((tone) => (
                <SelectItem key={tone} value={tone} className="tick-icon flex font-ubuntu ">
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredCastMembers && filteredCastMembers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 transition-all duration-300" >


            {filteredCastMembers.map((member) => (
              <CastMemberCard
                key={member.id}
                castMember={member}
                onDelete={handleDeleteIntent}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className=" bg-card border border-border p-10 rounded-lg text-center flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-xl font-semibold text-foreground mb-2">
              No Cast Members Found
            </p>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters, or create a new cast member.
            </p>
            <Link to="/dashboard/cast-members/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create New Cast Member
              </Button>
            </Link>
          </div>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="glass-tabs-alert">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this cast member. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

export default CastMembersPage;
