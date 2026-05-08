import { SessionType } from "../services/sessionService"; // Adjust path as necessary

// Define the structure for a tree node, extending the session type and adding children
export interface SessionTreeNode
  extends Omit<SessionType, "branchSessions" | "children"> {
  children: SessionTreeNode[];
  // Add any other UI-specific properties for the tree node, e.g., depth, isExpanded
}

/**
 * Builds a hierarchical tree from a flat list of sessions.
 * @param flatSessions The flat list of sessions (typically from sessionData.branchSessions).
 * @param rootId The ID of the session to be considered the root of the desired tree.
 *               If null/undefined, it will try to build trees for all top-level items.
 * @returns An array of root SessionTreeNode objects.
 */
export function buildSessionTree(
  flatSessions: Omit<SessionType, "branchSessions" | "children">[] | undefined,
  currentSessionIdForRoot: string | undefined
): SessionTreeNode[] {
  if (!flatSessions || flatSessions.length === 0) {
    return [];
  }

  const map = new Map<string, SessionTreeNode>();
  // Temporary array to hold all nodes as they are processed.
  // We will identify the true root later.
  const allNodes: SessionTreeNode[] = [];

  flatSessions.forEach((session) => {
    const node = { ...session, children: [] };
    map.set(session.id, node);
    allNodes.push(node); // Add to allNodes as well
  });

  // Link children to their parents
  allNodes.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      const parentNode = map.get(node.parentId)!;
      parentNode.children.push(node);
    }
  });

  // Determine the actual root ID of the entire branch.
  // All sessions in branchSessions should share the same rootId,
  // or if a session is the root itself, its rootId will be null/undefined, and its id is the rootId.
  let ultimateRootId: string | undefined = undefined;
  if (currentSessionIdForRoot) {
    const currentSessionInFlatList = flatSessions.find(
      (s) => s.id === currentSessionIdForRoot
    );
    if (currentSessionInFlatList) {
      ultimateRootId =
        currentSessionInFlatList.rootId || currentSessionInFlatList.id;
    } else {
      console.warn(
        "[buildSessionTree] currentSessionIdForRoot not found in flatSessions. Cannot determine ultimateRootId."
      );
      // Fallback or error handling: if current session isn't in the list,
      // we might not be able to build the correct tree.
      // For now, if flatSessions is not empty, try to use the rootId of the first session,
      // or its id if it has no rootId. This is a guess.
      if (flatSessions.length > 0) {
        ultimateRootId = flatSessions[0].rootId || flatSessions[0].id;
        console.warn(
          "[buildSessionTree] Using root from first session as fallback:",
          ultimateRootId
        );
      }
    }
  } else if (flatSessions.length > 0) {
    // If no specific current session, assume the first session's rootId (or its id) is the target.
    // This case might need more robust handling depending on usage.
    ultimateRootId = flatSessions[0].rootId || flatSessions[0].id;
  }

  if (!ultimateRootId) {
    return [];
  }

  const rootNode = map.get(ultimateRootId);

  if (rootNode) {
    // Sort children recursively at each level if needed, or do it in the component
    // For now, sorting children of the root node as an example
    rootNode.children.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return [rootNode];
  } else {
    // This case means the determined ultimateRootId is not present in the flatSessions,
    // which indicates a potential data consistency issue or an incorrect ultimateRootId determination.
    console.error(
      "[buildSessionTree] Ultimate root node with id",
      ultimateRootId,
      "not found in map. Returning empty tree. Map content:",
      Array.from(map.keys())
    );
    return [];
  }
}
