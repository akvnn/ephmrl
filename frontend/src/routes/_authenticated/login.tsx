import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <button onClick={() => loginWithRedirect()}>Log in</button>
    </div>
  );
}
