import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_rag")({
  component: RAGLayout,
});

function RAGLayout() {
  return (
    <div className="flex flex-col h-full w-full">
      <Outlet />
    </div>
  );
}
