import { Link } from "@tanstack/react-router";
import logo from "@/assets/sj-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label="S & J Baby Mart home">
      <img
        src={logo.url}
        alt="S & J Baby Mart and Njau Children's Clinic logo"
        className={cn("h-12 w-auto md:h-14", imgClassName)}
      />
    </Link>
  );
}
