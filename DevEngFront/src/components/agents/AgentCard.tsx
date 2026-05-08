
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface AgentType {
  id: string;
  name: string;
  role: string;
  description: string;
  specialty: string[];
}

interface AgentCardProps {
  agent: AgentType;
  onDelete: (id: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  return (
    <Card className="notion-card h-full flex flex-col">
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
        <CardDescription className="font-medium">{agent.role}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
        <div className="flex flex-wrap gap-2">
          {agent.specialty.map((spec, index) => (
            <Badge key={index} variant="secondary">{spec}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Link to={`/dashboard/agents/${agent.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(agent.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
