"use client";

import type { ConditionGroup, FieldCondition } from "@/lib/types/rules";
import { isConditionGroup } from "@/lib/types/rules";

function formatOperator(op: string): string {
  switch (op) {
    case "eq": return "=";
    case "neq": return "!=";
    case "gt": return ">";
    case "gte": return ">=";
    case "lt": return "<";
    case "lte": return "<=";
    case "in": return "in";
    case "not_in": return "not in";
    case "contains": return "contains any of";
    case "exists": return "exists";
    default: return op;
  }
}

function formatValue(value: FieldCondition["value"]): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.map((v) => typeof v === "string" ? `"${v}"` : String(v)).join(", ")}]`;
  return String(value);
}

function ConditionLine({ condition }: { condition: FieldCondition }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-mono">
      <span className="text-white/80">{condition.field}</span>
      <span className="text-neon/70">{formatOperator(condition.operator)}</span>
      {condition.operator !== "exists" && (
        <span className="text-amber-400/80">{formatValue(condition.value)}</span>
      )}
    </span>
  );
}

export default function ConditionDisplay({
  conditions,
  depth = 0,
}: {
  conditions: ConditionGroup;
  depth?: number;
}) {
  return (
    <div className={`flex flex-col gap-1 ${depth > 0 ? "ml-4 pl-3 border-l border-white/10" : ""}`}>
      {conditions.conditions.map((c, i) => (
        <div key={i} className="flex items-start gap-1.5">
          {i > 0 && (
            <span className="text-[11px] font-mono text-neon/50 uppercase w-8 shrink-0 pt-px">
              {conditions.logic}
            </span>
          )}
          {i === 0 && <span className="w-8 shrink-0" />}
          {isConditionGroup(c) ? (
            <ConditionDisplay conditions={c} depth={depth + 1} />
          ) : (
            <ConditionLine condition={c as FieldCondition} />
          )}
        </div>
      ))}
    </div>
  );
}
