import { Link } from "@tanstack/react-router";
import logo from "@/assets/sj-logo.png.asset.json";
import logoWhite from "@/assets/sj-logo-white.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  imgClassName,
  variant = "color",
}: {
  className?: string;
  imgClassName?: string;
  variant?: "color" | "white";
}) {
  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label="S & J Baby Mart home">
      <img
        src={variant === "white" ? logoWhite.url : logo.url}
        alt="S & J Baby Mart and Njau Children's Clinic logo"
        className={cn("h-20 w-auto md:h-24", imgClassName)}
      />
    </Link>
  );
}
