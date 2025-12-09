import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { useThemeStore } from "@/hooks/use-theme";
import { getRuntimeConfig, setConfig, type RuntimeConfig } from "@/lib/config";
import type { Organization } from "@/types/organization";
import type { Project } from "@/types/project";

export interface RouterContext {
  getOrganization: () => Organization | null;
  getProject: () => Project | null;
  config: RuntimeConfig;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const config = await getRuntimeConfig();
    setConfig(config);
    return { config };
  },
  loader: ({ context }) => {
    return { config: context.config };
  },
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
        title: "ephmrl",
      },
      {
        name: "description",
        content: "Private LLM infrastructure for your needs.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { config } = Route.useLoaderData();

  if (config) {
    setConfig(config);
  }

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Dr Ur fi Lr zr ci Or jr capture Ai calculateEventProperties qr register register_once register_for_session unregister unregister_for_session Jr getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Gr Br createPersonProfile Vr Cr Kr opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Hr debug O Wr getPageViewId captureTraceFeedback captureTraceMetric Rr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_OFb7dBuC7gc9lnZf5oKBsJFYW3qKIksJzbPCp4sbeVL', {
              api_host: 'https://us.i.posthog.com',
              defaults: '2025-11-30',
              person_profiles: 'identified_only'
            });
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
