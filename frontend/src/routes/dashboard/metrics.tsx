import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveRadar } from "@nivo/radar";
import { StatCard } from "@/components/dashboard/stat-card";
import { listLLMSubinstances } from "@/lib/llm";
import { projectService } from "@/lib/project";
import { useMemo } from "react";
import { useThemeStore } from "@/hooks/use-theme";

export const Route = createFileRoute("/dashboard/metrics")({
  loader: ({ context }) => {
    const org = context.getOrganization();
    if (!org?.id) return { llmSubinstances: [], projects: [] };
    return Promise.all([
      listLLMSubinstances({ organization_id: org.id }),
      projectService.fetchProjectsByOrganization(org.id),
    ]).then(([llmSubinstances, projects]) => ({ llmSubinstances, projects }));
  },
  component: DashboardPage,
});

const chartColors = {
  primary: "#22d3ee",
  chart1: "#06b6d4",
  chart2: "#10b981",
  chart3: "#8b5cf6",
  chart4: "#f59e0b",
  chart5: "#ec4899",
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}

function DashboardPage() {
  const { llmSubinstances, projects } = Route.useLoaderData();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const chartTheme = useMemo(
    () => ({
      axis: {
        ticks: {
          text: { fill: isDark ? "#94a3b8" : "#64748b" },
        },
      },
      grid: {
        line: { stroke: isDark ? "#334155" : "#e2e8f0" },
      },
      tooltip: {
        container: {
          background: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#f1f5f9" : "#1e293b",
          borderRadius: "8px",
          boxShadow: isDark
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
      },
    }),
    [isDark]
  );

  const deploymentRadarData = useMemo(() => {
    const nameCount = new Map<string, number>();
    llmSubinstances.forEach((sub) => {
      nameCount.set(sub.name, (nameCount.get(sub.name) || 0) + 1);
    });

    const topDeployments = Array.from(nameCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return topDeployments.map(([name, count]) => ({
      deployment: name.length > 20 ? name.substring(0, 20) + "..." : name,
      count,
    }));
  }, [llmSubinstances]);

  const provisioningActivityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const dayMap = new Map<string, number>();
    llmSubinstances.forEach((sub) => {
      const date = new Date(sub.created_at).toISOString().split("T")[0];
      if (last7Days.includes(date)) {
        dayMap.set(date, (dayMap.get(date) || 0) + 1);
      }
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return [
      {
        id: "Provisions",
        data: last7Days.map((date) => {
          const d = new Date(date);
          return {
            x: dayNames[d.getDay()],
            y: dayMap.get(date) || 0,
          };
        }),
      },
    ];
  }, [llmSubinstances]);

  const projectActivityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const dayMap = new Map<string, number>();
    projects.forEach((proj) => {
      const date = new Date(proj.created_at).toISOString().split("T")[0];
      if (last7Days.includes(date)) {
        dayMap.set(date, (dayMap.get(date) || 0) + 1);
      }
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return [
      {
        id: "Projects Created",
        data: last7Days.map((date) => {
          const d = new Date(date);
          return {
            x: dayNames[d.getDay()],
            y: dayMap.get(date) || 0,
          };
        }),
      },
    ];
  }, [projects]);

  const uniqueModels = useMemo(() => {
    const models = new Set(
      llmSubinstances
        .map((s) => s.llm_instance?.listed_llm?.name)
        .filter(Boolean)
    );
    return models.size;
  }, [llmSubinstances]);

  const recentActivity = useMemo(() => {
    const activities: Array<{ time: Date; description: string }> = [];

    llmSubinstances.forEach((sub) => {
      activities.push({
        time: new Date(sub.created_at),
        description: `Deployed ${sub.llm_instance?.listed_llm?.name || "model"} (${sub.is_dedicated ? "Dedicated" : "Shared"})`,
      });
    });

    projects.forEach((proj) => {
      activities.push({
        time: new Date(proj.created_at),
        description: `Created project: ${proj.name}`,
      });
    });

    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5)
      .map((activity) => ({
        time: activity.time,
        timeAgo: formatTimeAgo(activity.time),
        description: activity.description,
      }));
  }, [llmSubinstances, projects]);

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-4">
      <div className="px-0 sm:px-4 pb-4">
        <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="LLM Deployments"
            value={llmSubinstances.length}
          />
          <StatCard title="Unique Models" value={uniqueModels} />
          <StatCard title="Active Projects" value={projects.length} />
          <StatCard
            title="Documents"
            value="Coming Soon"
            subtitle="Endpoint in development"
          />
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4 sm:p-6 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">
              Model Provisioning (Last 7 Days)
            </h3>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveLine
                data={provisioningActivityData}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: "auto",
                }}
                curve="monotoneX"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                pointSize={8}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                enablePointLabel={false}
                useMesh={true}
                theme={chartTheme}
                colors={[chartColors.primary]}
                enableArea={true}
                areaOpacity={0.1}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 sm:p-6 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">
              Top Deployments by Name
            </h3>
            <div className="h-[250px] sm:h-[300px]">
              {deploymentRadarData.length > 0 ? (
                <ResponsiveRadar
                  data={deploymentRadarData}
                  keys={["count"]}
                  indexBy="deployment"
                  maxValue="auto"
                  margin={{ top: 30, right: 50, bottom: 30, left: 50 }}
                  curve="linearClosed"
                  borderWidth={2}
                  borderColor={{ from: "color" }}
                  gridLevels={5}
                  gridShape="circular"
                  gridLabelOffset={16}
                  enableDots={true}
                  dotSize={8}
                  dotColor={{ theme: "background" }}
                  dotBorderWidth={2}
                  dotBorderColor={{ from: "color" }}
                  colors={[chartColors.primary]}
                  fillOpacity={0.25}
                  blendMode={isDark ? "normal" : "multiply"}
                  theme={chartTheme}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No deployments yet
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4 sm:p-6 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">
              Projects Created (Last 7 Days)
            </h3>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveLine
                data={projectActivityData}
                  margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                  xScale={{ type: "point" }}
                  yScale={{
                    type: "linear",
                    min: 0,
                    max: "auto",
                  }}
                  curve="monotoneX"
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                  }}
                  pointSize={8}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  enablePointLabel={false}
                  useMesh={true}
                  theme={chartTheme}
                  colors={[chartColors.chart2]}
                  enableArea={true}
                  areaOpacity={0.1}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 rounded-lg border p-4 sm:p-6 shadow-sm">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-2 sm:space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {activity.timeAgo}
                  </span>
                  <span className="break-words">{activity.description}</span>
                </div>
              ))
            ) : (
              <div className="text-xs sm:text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
