import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

/* -------------------------------- THEMES -------------------------------- */

const THEMES = {
  light: "",
  dark: ".dark",
};

/* -------------------------------- CONTEXT -------------------------------- */

const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

/* -------------------------------- CONTAINER -------------------------------- */

const ChartContainer = React.forwardRef(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-chart={chartId}
          className={cn(
            "flex aspect-video justify-center text-xs",
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
            "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
            "[&_.recharts-tooltip-cursor]:stroke-border",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

/* -------------------------------- STYLE -------------------------------- */

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config || {}).filter(
    ([_, value]) => value?.color || value?.theme
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, selector]) => `
${selector} [data-chart=${id}] {
${colorConfig
  .map(([key, cfg]) => {
    const color = cfg.theme?.[theme] || cfg.color;
    return color ? `--color-${key}: ${color};` : "";
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

/* -------------------------------- TOOLTIP -------------------------------- */

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      className,
      hideLabel = false,
      indicator = "dot",
      label,
      labelFormatter,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background px-3 py-2 text-xs shadow-md",
          className
        )}
      >
        {!hideLabel && label && (
          <div className="mb-1 font-medium">
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        )}

        <div className="grid gap-1.5">
          {payload.map((item) => {
            const key = item.dataKey;
            const cfg = config?.[key];

            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-sm",
                    indicator === "dot" && "rounded-full"
                  )}
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">
                  {cfg?.label || item.name}
                </span>
                <span className="ml-auto font-mono">
                  {item.value?.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

/* -------------------------------- LEGEND -------------------------------- */

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef(
  ({ payload, className }, ref) => {
    const { config } = useChart();
    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn("flex justify-center gap-4 text-xs", className)}
      >
        {payload.map((item) => {
          const cfg = config?.[item.dataKey];
          return (
            <div key={item.value} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {cfg?.label || item.value}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

/* -------------------------------- EXPORTS -------------------------------- */

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
