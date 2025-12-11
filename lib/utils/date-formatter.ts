/**
 * Format date consistently for server and client rendering
 * Uses UTC to avoid timezone-related hydration mismatches
 */
export function formatDateForDisplay(date: Date): string {
  // Use UTC to ensure consistent formatting between server and client
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[month];
  
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const minutesStr = minutes.toString().padStart(2, '0');
  
  return `${monthName} ${day}, ${year}, ${hour12}:${minutesStr} ${ampm}`;
}


