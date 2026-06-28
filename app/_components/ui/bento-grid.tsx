import React from "react";

export const BentoGrid: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className ?? ""}`} {...props}>
    {children}
  </div>
);

interface BentoGridItemProps {
  title: string;
  description: string;
  header: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  title,
  description,
  header,
  icon,
  className,
}) => (
  <div className={`rounded-xl bg-white dark:bg-neutral-900 p-4 shadow ${className ?? ""}`}>
    <div className="mb-2">{header}</div>
    <div className="flex items-center mb-2">{icon}<span className="ml-2 font-bold">{title}</span></div>
    <div className="text-sm text-neutral-600 dark:text-neutral-300">{description}</div>
  </div>
);