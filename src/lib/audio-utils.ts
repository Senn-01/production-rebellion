/**
 * Audio Utilities - Sound effects for app events
 * 
 * Handles audio playback for user feedback with graceful error handling.
 * Respects user preferences and browser autoplay policies.
 */

/**
 * Play a gentle completion sound effect
 * Returns Promise<boolean> - true if played successfully, false if failed
 */
export async function playCompletionSound(): Promise<boolean> {
  try {
    // Create audio element
    const audio = new Audio('/missionaccomplished.wav');
    
    // Set volume to be gentle (30%)
    audio.volume = 0.3;
    
    // Attempt to play
    await audio.play();
    
    console.log('[AudioUtils] Completion sound played successfully');
    return true;
  } catch (error) {
    // Graceful fallback - browser may have autoplay restrictions
    console.log('[AudioUtils] Could not play completion sound (likely autoplay restriction):', error);
    return false;
  }
}

/**
 * Check if audio can be played (for user preference detection)
 */
export function canPlayAudio(): boolean {
  try {
    const audio = new Audio();
    return typeof audio.play === 'function';
  } catch {
    return false;
  }
}

/**
 * Preload audio file for better performance
 */
export function preloadCompletionSound(): void {
  try {
    const audio = new Audio('/missionaccomplished.wav');
    audio.preload = 'auto';
    audio.load();
  } catch (error) {
    console.log('[AudioUtils] Could not preload completion sound:', error);
  }
}