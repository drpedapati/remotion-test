/**
 * BackgroundMusic Component
 * 
 * Reusable component for adding background music to Remotion compositions.
 * 
 * @example
 * ```tsx
 * <BackgroundMusic 
 *   src="/background-music.mp3" 
 *   volume={0.3} 
 *   startFrom={0}
 *   endAt={600}
 * />
 * ```
 * 
 * @param src - Path to audio file (relative to public/ directory)
 * @param volume - Volume level (0.0 to 1.0). Default: 0.3
 * @param startFrom - Frame to start playing. Default: 0
 * @param endAt - Frame to stop playing. undefined = play until end
 */
import React from 'react';
import { Audio } from 'remotion';

interface BackgroundMusicProps {
  src?: string;
  volume?: number;
  startFrom?: number;
  endAt?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  volume = 0.3,
  startFrom = 0,
  endAt,
}) => {
  if (!src) {
    return null;
  }

  return (
    <Audio
      src={src}
      volume={volume}
      startFrom={startFrom}
      endAt={endAt}
      loop={false}
    />
  );
};
