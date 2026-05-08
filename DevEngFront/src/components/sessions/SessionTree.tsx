import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SessionTreeNode, buildSessionTree } from "@/lib/treeUtils"; // Adjust path as necessary
import { SessionType } from "@/services/sessionService"; // Adjust path as necessary
import { cn } from "@/lib/utils"; // For conditional class names
import {
  Folder,
  FileText,
  ChevronRight,
  CornerDownRight,
  Trash2,
  Loader2,
} from "lucide-react"; // Example icons
import { useDeleteSession } from "@/hooks/use-session";
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

interface SessionTreeProps {
  branchSessions:
    | Omit<SessionType, "branchSessions" | "children">[]
    | undefined;
  currentActiveSessionId: string | undefined;
}

interface SessionTreeItemProps {
  node: SessionTreeNode;
  level: number;
  currentActiveSessionId: string | undefined;
}

const SessionTreeItem: React.FC<SessionTreeItemProps> = ({
  node,
  level,
  currentActiveSessionId,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.id === currentActiveSessionId;
  const navigate = useNavigate();
  const deleteSession = useDeleteSession();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const itemStyle = {
    paddingLeft: `${level * 1.5}rem`,
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteSession.mutate(node.id, {
      onSuccess: () => {
        if (isActive) {
          // If the deleted session was active, navigate to a parent or root
          if (node.parentId) {
            navigate(`/dashboard/projects/${node.parentId}?tab=tasks`);
          } else {
            navigate("/dashboard");
          }
        }
      },
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center w-full">
        <Link
          to={`/dashboard/projects/${node.id}?tab=tasks`}
          className={cn(
            "flex items-center py-2 px-3 my-0.5 rounded-md text-sm transition-colors flex-grow",
            "hover:bg-muted/80",
            isActive
              ? "glass-tabs-t text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
          style={itemStyle}
        >
          {level > 0 && (
            <CornerDownRight className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
          )}
          {hasChildren ? (
            <Folder
              className={cn(
                "h-4 w-4 ml-2 flex-shrink-0",
                isActive ? "text-primary" : "text-foreground/70"
              )}
            />
          ) : (
            <FileText
              className={cn(
                "h-4 w-4 ml-2 flex-shrink-0",
                isActive ? "text-primary" : "text-foreground/70"
              )}
            />
          )}
          <span className="truncate ml-2">{node.title || "Untitled Task"}</span>
        </Link>
        <button
          onClick={handleDeleteClick}
          className={cn(
            "p-1.5 rounded-md hover:bg-destructive/10 transition-colors mr-2",
            deleteSession.isPending && "opacity-50 cursor-not-allowed"
          )}
          disabled={deleteSession.isPending}
        >
          {deleteSession.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
          )}
        </button>
      </div>

      {hasChildren && (
        <div>
          {node.children.map((child) => (
            <SessionTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              currentActiveSessionId={currentActiveSessionId}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{node.title || "Untitled Task"}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const SessionTree: React.FC<SessionTreeProps> = ({
  branchSessions,
  currentActiveSessionId,
}) => {
  const currentSessionInBranch = branchSessions?.find(
    (s) => s.id === currentActiveSessionId
  );
  const ultimateRootId =
    currentSessionInBranch?.rootId || currentSessionInBranch?.id;
  const sessionTreeRoots = buildSessionTree(branchSessions, ultimateRootId);

  if (!sessionTreeRoots || sessionTreeRoots.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        No tasks or sessions in this branch yet. (Debug: ultimateRootId was{" "}
        {ultimateRootId || "undefined"})
      </p>
    );
  }

  return (
    <div className="p-2">
      {sessionTreeRoots.map((rootNode) => (
        <SessionTreeItem
          key={rootNode.id}
          node={rootNode}
          level={0}
          currentActiveSessionId={currentActiveSessionId}
        />
      ))}
    </div>
  );
};

export default SessionTree;
