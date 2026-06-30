const EXT_MAP: Record<string, string> = {
  "peach-ocean-2": "png",
};

export function getProductImage(imageKey: string): string {
  // If imageKey already has an extension (uploaded files), use as-is
  if (/\.\w{3,4}$/.test(imageKey)) return `/assets/${imageKey}`;
  const ext = EXT_MAP[imageKey] || "jpg";
  return `/assets/${imageKey}.${ext}`;
}