import { cn } from "@/lib/utils";
import React from "react";

export const SiteLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-6 w-6", className)}
        {...props}
    >
        <circle cx="12" cy="12" r="12" fill="#00A9E0" />
        <g transform="scale(0.9) translate(1.3, 1.3)">
            <path
                d="M19.98 12C19.98 16.4064 16.3917 19.995 11.985 19.995C7.57833 19.995 4 16.4064 4 12C4 7.59358 7.57833 4.00501 11.985 4.00501C14.3883 4.00501 16.545 5.00401 18.0683 6.55001"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </g>
    </svg>
);
