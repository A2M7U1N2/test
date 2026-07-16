import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        "dark:bg-card dark:border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}