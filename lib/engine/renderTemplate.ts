// ---------------------------------------------------------------------------
// Template Renderer
// ---------------------------------------------------------------------------
// Renders {{segment.name}}, {{audience.name}}, etc. placeholders
// in stored action template strings.
// ---------------------------------------------------------------------------

/**
 * Resolve a dot-separated path like "segment.name" against a context object.
 */
function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Replace all {{path}} placeholders in a template string.
 */
export function renderTemplate(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
    const value = resolvePath(context, path);
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  });
}

/**
 * Recursively render all string values in an object.
 */
export function renderTemplateObject<T>(
  obj: T,
  context: Record<string, unknown>
): T {
  if (typeof obj === "string") {
    return renderTemplate(obj, context) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => renderTemplateObject(item, context)) as unknown as T;
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = renderTemplateObject(value, context);
    }
    return result as T;
  }

  return obj;
}
