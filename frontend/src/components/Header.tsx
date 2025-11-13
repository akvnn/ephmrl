import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <>
      <header className="p-4 flex items-center bg-sidebar text-sidebar-foreground shadow-lg border-b border-sidebar-border">
        <h1 className="ml-4 text-2xl font-bold">
          <Link to="/" className="hover:text-accent transition-colors">
            ephemeral<span className="text-primary">.ai</span>
          </Link>
        </h1>
      </header>
    </>
  );
}
