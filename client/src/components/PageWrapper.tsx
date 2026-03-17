import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
    return (
        <div className={`h-screen w-screen flex flex-col overflow-hidden ${className}`}>
            {children}
        </div>
    );
}
