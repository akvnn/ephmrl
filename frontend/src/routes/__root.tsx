import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { useThemeStore } from "@/hooks/use-theme";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Ephmrl",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().initializeUserContext();
    useThemeStore.getState().initializeTheme();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme-storage');
                  var theme = 'system';
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    theme = parsed.state?.theme || 'system';
                  }
                  var resolved = theme === 'system'
                    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                    : theme;
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Auth0Provider
          domain={import.meta.env.VITE_AUTH0_DOMAIN}
          clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
          authorizationParams={{
            redirect_uri: "http://localhost:3000/auth/callback",
          }}
        >
          {children}
        </Auth0Provider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
