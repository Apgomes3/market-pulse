/**
 * Fear & Greed Gauge — Obsidian Command Design
 * Radial arc gauge with animated needle and gradient segments.
 * Color: red (extreme fear) → orange (fear) → yellow (neutral) → green (greed) → bright green (extreme greed)
 */
import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import { motion } from "framer-motion";
import type { FearGreedIndex } from "@/lib/types";

interface Props {
  data: FearGreedIndex;
}

export default function FearGreedGauge({ data }: Props) {
  const animatedValue = useAnimatedValue(data.value, 1500);

  // Gauge arc from -135deg to +135deg (270deg total)
  const minAngle = -135;
  const maxAngle = 135;
  const angleRange = maxAngle - minAngle;
  const needleAngle = minAngle + (animatedValue / 100) * angleRange;

  // Determine color based on value
  const getColor = (val: number) => {
    if (val <= 25) return "#ef4444"; // Extreme Fear
    if (val <= 45) return "#f97316"; // Fear
    if (val <= 55) return "#eab308"; // Neutral
    if (val <= 75) return "#22c55e"; // Greed
    return "#10b981"; // Extreme Greed
  };

  const getLabel = (val: number) => {
    if (val <= 25) return "Extreme Fear";
    if (val <= 45) return "Fear";
    if (val <= 55) return "Neutral";
    if (val <= 75) return "Greed";
    return "Extreme Greed";
  };

  const color = getColor(data.value);

  // SVG arc helper
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const cx = 150;
  const cy = 150;
  const radius = 120;

  // Segments for the gauge background
  const segments = [
    { start: -135, end: -81, color: "#ef4444" },
    { start: -81, end: -27, color: "#f97316" },
    { start: -27, end: 27, color: "#eab308" },
    { start: 27, end: 81, color: "#22c55e" },
    { start: 81, end: 135, color: "#10b981" },
  ];

  // Needle endpoint
  const needleEnd = polarToCartesian(cx, cy, radius - 15, needleAngle);

  return (
    <div className="dash-card">
      <div className="section-label flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        Fear & Greed Index
      </div>

      <div className="flex flex-col items-center">
        <svg viewBox="0 0 300 200" className="w-full max-w-[320px]">
          {/* Background track */}
          <path
            d={describeArc(cx, cy, radius, -135, 135)}
            fill="none"
            stroke="oklch(0.2 0.01 260)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Colored segments */}
          {segments.map((seg, i) => (
            <path
              key={i}
              d={describeArc(cx, cy, radius, seg.start, seg.end)}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.25"
            />
          ))}

          {/* Active arc up to the value */}
          <motion.path
            d={describeArc(cx, cy, radius, -135, minAngle + (data.value / 100) * angleRange)}
            fill="none"
            stroke={color}
            strokeWidth="18"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Needle */}
          <motion.line
            x1={cx}
            y1={cy}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="6" fill={color} />
          <circle cx={cx} cy={cy} r="3" fill="oklch(0.09 0.015 260)" />

          {/* Value text */}
          <text
            x={cx}
            y={cy - 25}
            textAnchor="middle"
            className="fill-foreground"
            style={{ fontSize: "48px", fontFamily: "var(--font-heading)", fontWeight: 700 }}
          >
            {animatedValue}
          </text>

          {/* Label */}
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            style={{ fontSize: "14px", fontFamily: "var(--font-heading)", fontWeight: 600 }}
            fill={color}
          >
            {getLabel(data.value)}
          </text>

          {/* Scale labels */}
          <text x="25" y="190" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}>0</text>
          <text x="275" y="190" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}>100</text>
          <text x={cx} y="25" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}>50</text>
        </svg>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          Updated: {data.previousClose} | {data.context.slice(0, 120)}...
        </div>
      </div>
    </div>
  );
}
