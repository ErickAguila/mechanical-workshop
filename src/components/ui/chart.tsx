"use client"

import * as React from "react"
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "../../lib/utils"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
    formatter?: (value: number) => string
    labelFormatter?: (label: string) => string
  }
>(({ active, payload, label, formatter, labelFormatter, className, ...props }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>
      <div className="grid gap-2">
        {labelFormatter ? (
          <div className="text-xs text-muted-foreground">{labelFormatter(label as string)}</div>
        ) : (
          <div className="text-xs text-muted-foreground">{label}</div>
        )}
        <div className="grid gap-1">
          {payload.map((data, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
              <div className="text-xs font-medium text-muted-foreground">{data.name}</div>
              <div className="ml-auto text-xs font-medium">
                {formatter
                  ? formatter(data.value)
                  : typeof data.value === "number"
                    ? data.value.toLocaleString()
                    : data.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

interface BarChartProps {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  showTooltip?: boolean
  stack?: boolean
  horizontal?: boolean
  height?: number
  className?: string
  layout?: "vertical" | "horizontal"
}

function BarChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "red", "yellow", "purple", "indigo", "pink", "orange"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  showTooltip = true,
  stack = false,
  horizontal = false,
  height = 300,
  className,
  layout = "horizontal",
}: BarChartProps) {
  const keys = categories.map((category) => ({
    key: category,
    color: colors[categories.indexOf(category) % colors.length],
  }))

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 8,
            right: 8,
            left: 8,
            bottom: 8,
          }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} className="stroke-muted" />
          )}
          {showXAxis && (
            <XAxis
              dataKey={index}
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              type={layout === "horizontal" ? "category" : "number"}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              type={layout === "horizontal" ? "number" : "category"}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip formatter={(value) => valueFormatter(value as number)} />}
              cursor={{ fill: "var(--chart-grid)" }}
              isAnimationActive={false}
            />
          )}
          {showLegend && (
            <Legend
              content={
                <div className="flex flex-wrap items-center justify-end gap-4 text-xs">
                  {keys.map(({ key, color }) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground">{key}</span>
                    </div>
                  ))}
                </div>
              }
              verticalAlign="top"
              height={36}
            />
          )}
          {keys.map(({ key, color }, i) => (
            <Bar
              key={`${key}-${i}`}
              dataKey={key}
              fill={color}
              radius={[4, 4, 0, 0]}
              stackId={stack ? "a" : undefined}
              isAnimationActive={false}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface LineChartProps {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  showTooltip?: boolean
  height?: number
  className?: string
}

function LineChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "red", "yellow", "purple", "indigo", "pink", "orange"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  showTooltip = true,
  height = 300,
  className,
}: LineChartProps) {
  const keys = categories.map((category) => ({
    key: category,
    color: colors[categories.indexOf(category) % colors.length],
  }))

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 8,
            right: 8,
            left: 8,
            bottom: 8,
          }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} className="stroke-muted" />
          )}
          {showXAxis && (
            <XAxis
              dataKey={index}
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              padding={{ left: 8, right: 8 }}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip formatter={(value) => valueFormatter(value as number)} />}
              isAnimationActive={false}
            />
          )}
          {showLegend && (
            <Legend
              content={
                <div className="flex flex-wrap items-center justify-end gap-4 text-xs">
                  {keys.map(({ key, color }) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground">{key}</span>
                    </div>
                  ))}
                </div>
              }
              verticalAlign="top"
              height={36}
            />
          )}
          {keys.map(({ key, color }, i) => (
            <Line
              key={`${key}-${i}`}
              type="monotone"
              dataKey={key}
              stroke={color}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AreaChartProps {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  showTooltip?: boolean
  stack?: boolean
  height?: number
  className?: string
}

function AreaChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "red", "yellow", "purple", "indigo", "pink", "orange"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  showTooltip = true,
  stack = false,
  height = 300,
  className,
}: AreaChartProps) {
  const keys = categories.map((category) => ({
    key: category,
    color: colors[categories.indexOf(category) % colors.length],
  }))

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{
            top: 8,
            right: 8,
            left: 8,
            bottom: 8,
          }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} className="stroke-muted" />
          )}
          {showXAxis && (
            <XAxis
              dataKey={index}
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              padding={{ left: 8, right: 8 }}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip formatter={(value) => valueFormatter(value as number)} />}
              isAnimationActive={false}
            />
          )}
          {showLegend && (
            <Legend
              content={
                <div className="flex flex-wrap items-center justify-end gap-4 text-xs">
                  {keys.map(({ key, color }) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground">{key}</span>
                    </div>
                  ))}
                </div>
              }
              verticalAlign="top"
              height={36}
            />
          )}
          {keys.map(({ key, color }, i) => (
            <Area
              key={`${key}-${i}`}
              type="monotone"
              dataKey={key}
              fill={color}
              stroke={color}
              fillOpacity={0.1}
              stackId={stack ? "a" : undefined}
              isAnimationActive={false}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PieChartProps {
  data: Record<string, any>[]
  index: string
  category: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showTooltip?: boolean
  height?: number
  className?: string
}

function PieChart({
  data,
  index,
  category,
  colors = ["blue", "green", "red", "yellow", "purple", "indigo", "pink", "orange"],
  valueFormatter = (value: number) => value.toString(),
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
}: PieChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart
          margin={{
            top: 8,
            right: 8,
            left: 8,
            bottom: 8,
          }}
        >
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip formatter={(value) => valueFormatter(value as number)} />}
              isAnimationActive={false}
            />
          )}
          {showLegend && (
            <Legend
              content={
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  {data.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: colors[i % colors.length],
                        }}
                      />
                      <span className="text-muted-foreground">{entry[index]}</span>
                    </div>
                  ))}
                </div>
              }
              verticalAlign="bottom"
              height={36}
            />
          )}
          <Pie
            data={data}
            nameKey={index}
            dataKey={category}
            cx="50%"
            cy="50%"
            outerRadius={100}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} className="stroke-background hover:opacity-80" />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export { BarChart, LineChart, AreaChart, PieChart, ChartTooltip }

