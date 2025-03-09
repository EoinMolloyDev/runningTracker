/**
 * Format duration in seconds to MM:SS format
 * @param seconds Total duration in seconds
 * @returns Formatted duration string in MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration in seconds to HH:MM:SS format
 * @param seconds Total duration in seconds
 * @returns Formatted duration string in HH:MM:SS format
 */
export const formatDurationLong = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format pace (minutes per kilometer) to MM:SS format
 * @param pace Pace in minutes per kilometer
 * @returns Formatted pace string in MM:SS format
 */
export const formatPace = (pace: number | undefined): string => {
  if (pace === undefined || pace === null) return 'N/A';
  
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}; 