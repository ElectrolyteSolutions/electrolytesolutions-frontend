export function formatIsoDate(isoString) {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  
  // Returns format like "28/10/2026, 3:44:00 pm" (depends on user's locale)
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}