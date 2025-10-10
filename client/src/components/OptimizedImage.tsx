import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  maxRetries?: number;
  testId?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-video',
  fallbackSrc,
  onLoad,
  onError,
  priority = false,
  maxRetries = 2,
  testId,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  // Update src for non-priority images when currentSrc changes (for retries/fallback)
  useEffect(() => {
    if (!priority && imgRef.current) {
      // Check if image has an explicit src attribute (already observed/loaded)
      const hasExplicitSrc = imgRef.current.getAttribute('src') !== null;
      
      if (hasExplicitSrc || hasError) {
        // If image was already loaded or in error state, update src directly for retry/fallback
        imgRef.current.src = currentSrc;
      } else {
        // Otherwise update data-src for intersection observer to pick up
        imgRef.current.dataset.src = currentSrc;
      }
    }
  }, [currentSrc, priority, hasError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            // Start loading the image when it enters viewport
            const img = imgRef.current;
            if (img.dataset.src && !img.src) {
              img.src = img.dataset.src;
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, hasError]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`Failed to load image: ${currentSrc}`);
    
    // Try retry if available
    if (retryCount < maxRetries) {
      console.log(`Retrying image load (${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      // Add cache-busting parameter
      const separator = currentSrc.includes('?') ? '&' : '?';
      setCurrentSrc(`${currentSrc}${separator}retry=${retryCount + 1}`);
      return;
    }

    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`Using fallback image: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setRetryCount(0);
      return;
    }

    // No more options - show error state
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    setCurrentSrc(src);
  };

  if (hasError) {
    return (
      <div 
        className={`${aspectRatio} bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-3 ${className}`}
        data-testid={testId ? `${testId}-error` : 'image-error'}
      >
        <ImageIcon className="h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-500 px-4 text-center">{alt}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="gap-2"
          data-testid={testId ? `${testId}-retry` : 'image-retry'}
        >
          <RefreshCw className="h-4 w-4" />
          נסה שוב
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} ${className}`} data-testid={testId}>
      {isLoading && (
        <Skeleton className="absolute inset-0 rounded-lg" data-testid={testId ? `${testId}-skeleton` : 'image-skeleton'} />
      )}
      <img
        ref={imgRef}
        src={priority ? currentSrc : undefined}
        data-src={priority ? undefined : currentSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        data-testid={testId ? `${testId}-img` : 'optimized-img'}
      />
    </div>
  );
}
