import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveRadar } from "@nivo/radar";

export const Route = createFileRoute("/control/dashboard")({
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

const apiUsageData = [
  {
    id: "API Calls",
    data: [
      { x: "Mon", y: 245 },
      { x: "Tue", y: 312 },
      { x: "Wed", y: 289 },
      { x: "Thu", y: 402 },
      { x: "Fri", y: 378 },
      { x: "Sat", y: 156 },
      { x: "Sun", y: 98 },
    ],
  },
];

const mostUsedModelsData = [
  { model: "Llama 3.1 70B", calls: 1247, color: chartColors.chart1 },
  { model: "Mistral 7B", calls: 892, color: chartColors.chart2 },
  { model: "GPT-J 6B", calls: 654, color: chartColors.chart3 },
  { model: "Falcon 40B", calls: 423, color: chartColors.chart4 },
  { model: "Qwen 14B", calls: 312, color: chartColors.chart5 },
];

const tokenUsageData = [
  { type: "Input Tokens", value: 45623 },
  { type: "Output Tokens", value: 32145 },
  { type: "Cached", value: 12890 },
];

const documentsPerProjectData = [
  { project: "AI Chatbot", documents: 45 },
  { project: "RAG Pipeline", documents: 78 },
  { project: "Data Analysis", documents: 32 },
  { project: "Image Gen", documents: 21 },
  { project: "Code Assistant", documents: 56 },
];

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon?: string;
}) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold">{value}</p>
        {change && (
          <p className="mt-1 text-xs text-muted-foreground">{change}</p>
        )}
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="px-4 pb-4">
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Models Deployed"
            value={12}
            change="+2 this week"
            icon="🤖"
          />
          <StatCard
            title="Active Projects"
            value={5}
            change="2 updated today"
            icon="📁"
          />
          <StatCard
            title="Documents Uploaded"
            value={232}
            change="+18 this week"
            icon="📄"
          />
          <StatCard
            title="Total API Calls"
            value="2.3K"
            change="+12% from last week"
            icon="📊"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">API Usage This Week</h3>
            <div className="h-[300px]">
              <ResponsiveLine
                data={apiUsageData}
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
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: "#64748b" },
                    },
                  },
                  grid: {
                    line: { stroke: "#e2e8f0" },
                  },
                }}
                colors={[chartColors.primary]}
                enableArea={true}
                areaOpacity={0.1}
              />
            </div>
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Most Used Models</h3>
            <div className="h-[300px]">
              <ResponsiveBar
                data={mostUsedModelsData}
                keys={["calls"]}
                indexBy="model"
                margin={{ top: 20, right: 20, bottom: 80, left: 120 }}
                padding={0.3}
                layout="horizontal"
                valueScale={{ type: "linear" }}
                colors={({ data }) => data.color}
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
                enableLabel={true}
                labelSkipWidth={12}
                labelSkipHeight={12}
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: "#64748b" },
                    },
                  },
                  grid: {
                    line: { stroke: "#e2e8f0" },
                  },
                  labels: {
                    text: { fill: "#0f172a" },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
              Token Usage Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsivePie
                data={tokenUsageData}
                id="type"
                value="value"
                margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={[
                  chartColors.chart1,
                  chartColors.chart2,
                  chartColors.chart3,
                ]}
                borderWidth={1}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.2]],
                }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#64748b"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                theme={{
                  labels: {
                    text: { fill: "#64748b" },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
              Documents per Project
            </h3>
            <div className="h-[300px]">
              <ResponsiveRadar
                data={documentsPerProjectData}
                keys={["documents"]}
                indexBy="project"
                maxValue="auto"
                margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
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
                blendMode="multiply"
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: "#64748b" },
                    },
                  },
                  grid: {
                    line: { stroke: "#e2e8f0" },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">2 hours ago</span>
              <span>Deployed Llama 3.1 70B model</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">5 hours ago</span>
              <span>Uploaded 12 documents to RAG Pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">1 day ago</span>
              <span>Created new project: Code Assistant</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">2 days ago</span>
              <span>API usage exceeded 1000 calls milestone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
