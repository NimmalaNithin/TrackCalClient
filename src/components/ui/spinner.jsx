import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return <LoaderCircle className={cn("size-4 animate-spin", className)} aria-hidden="true" />;
}

export function PageSpinner({ label = "Loading..." }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        <span>{label}</span>
      </div>
    </div>
  );
}
