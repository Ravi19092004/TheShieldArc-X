import { useEffect, useState } from 'react';

export function useResponsiveFont() {
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const updateFontScale = () => {
      const width = window.innerWidth;

      // Base font size scaling
      // At 1920px (full HD), scale = 1
      // At 320px (mobile), scale = 0.75
      // Linear interpolation between these points
      const maxWidth = 1920;
      const minWidth = 320;
      const maxScale = 1;
      const minScale = 0.75;

      let scale;
      if (width >= maxWidth) {
        scale = maxScale;
      } else if (width <= minWidth) {
        scale = minScale;
      } else {
        // Linear interpolation
        scale = minScale + ((width - minWidth) / (maxWidth - minWidth)) * (maxScale - minScale);
      }

      setFontScale(scale);

      // Update CSS custom property
      document.documentElement.style.setProperty('--font-scale', scale.toString());
    };

    // Initial calculation
    updateFontScale();

    // Add resize listener
    window.addEventListener('resize', updateFontScale);

    // Cleanup
    return () => window.removeEventListener('resize', updateFontScale);
  }, []);

  return fontScale;
}
