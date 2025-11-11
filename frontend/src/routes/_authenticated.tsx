import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Outlet />;
  }

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: "http://localhost:3000/auth/callback",
      }}
    >
      <Outlet />
    </Auth0Provider>
  );
}
