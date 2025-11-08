// config/music.config.example.ts
// Example configuration for background music

export const MUSIC_CONFIG = {
  // Path to background music file
  // Place your music file in the public/ directory
  backgroundMusicSrc: '/background-music.mp3',
  
  // Volume level (0.0 to 1.0)
  volume: 0.3,
  
  // Start playing from this frame
  startFrom: 0,
  
  // End playing at this frame (undefined = play until end)
  endAt: undefined,
};
