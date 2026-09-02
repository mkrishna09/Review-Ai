import {
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  Info,
  FileCode2,
} from "lucide-react";
import Link from "next/link";

import Panel from "@/components/core/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IssueCardProps {
  title: string;
  severity: "High" | "Medium" | "Low";
  file: string;
  description: string;
  href?: string;
}

const severityStyles = {
  High: {
    icon: ShieldAlert,
    badge: "destructive",
    color: "text-red-500",
  },
  Medium: {
    icon: AlertTriangle,
    badge: "secondary",
    color: "text-yellow-500",
  },
  Low: {
    icon: Info,
    badge: "outline",
    color: "text-blue-500",
  },
} as const;

export default function IssueCard({
  title,
  severity,
  file,
  description,
  href,
}: IssueCardProps) {
  const Icon = severityStyles[severity].icon;

  return (
    <Panel className="group p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-8">
        <div className="flex flex-1 gap-4">
          <div
            className={`mt-1 rounded-xl bg-muted p-2 ${severityStyles[severity].color}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{title}</h3>

              <Badge variant={severityStyles[severity].badge as never}>
                {severity}
              </Badge>
            </div>

            <p className="max-w-2xl text-muted-foreground">{description}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCode2 className="h-4 w-4" />
              {file}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          render={href ? <Link href={href} /> : undefined}
        >
          Review
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Panel>
  );
}
