const EXT_MAP: Record<string, string> = {
  "peach-ocean-2": "png",
};

export function getProductImage(imageKey: string): string {
  const ext = EXT_MAP[imageKey] || "jpg";
  return `/assets/${imageKey}.${ext}`;
}
