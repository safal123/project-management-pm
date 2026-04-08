'use client';

import * as React from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const THEMES = { light: 'light', dark: 'dark' } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<keyof typeof THEMES, string>;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = id || `chart-${uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex min-h-0 w-full flex-col text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <div className="min-h-0 flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([, config]) => config.theme || config.color)
          .map(([key, config]) => {
            const color = config.theme?.light ?? config.color;
            return `
              [data-chart=${id}] {
                --color-${key}: ${color};
              }
            `;
          })
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
      return null;
    }

    const labelKeyName = labelKey || 'label';
    const nameKeyName = nameKey || 'name';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {!hideLabel && (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter
              ? labelFormatter(label, payload)
              : (payload[0]?.payload?.[labelKeyName] as string) ?? (label as string)}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = (item.dataKey as string) ?? (item.name as string);
            const itemConfig = config[key as keyof typeof config];
            const itemLabel =
              (item.payload as Record<string, unknown>)?.[nameKeyName] ??
              item.name ??
              itemConfig?.label ??
              key;
            const itemColor = item.color ?? item.payload?.fill ?? color;

            return (
              <div
                key={index}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2',
                  !hideIndicator && 'items-center'
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                      {
                        'h-2.5 w-2.5': indicator === 'dot',
                        'w-1': indicator === 'line',
                        'w-0 border-[1.5px] border-dashed bg-transparent':
                          indicator === 'dashed',
                      }
                    )}
                    style={
                      {
                        '--color-bg': itemColor,
                        '--color-border': itemColor,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <span className="text-muted-foreground">{itemLabel}</span>
                  {formatter && item?.value !== undefined
                    ? formatter(item.value, item.name, item, index, payload)
                    : (item.value as number)?.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartStyle,
  useChart,
};
