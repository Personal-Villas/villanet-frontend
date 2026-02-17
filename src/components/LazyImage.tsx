import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  lowResSrc?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  [key: string]: any;
}

export default function LazyImage({
  src,
  alt,
  lowResSrc,
  className = '',
  width,
  height,
  aspectRatio = '4/3',
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const placeholder =
    lowResSrc ||
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio,
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: '#f0f0f0',
      }}
    >
      <img
        src={placeholder}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          filter: 'blur(20px) brightness(0.9)',
          transform: 'scale(1.05)',
          opacity: loaded ? 0 : 1,
        }}
      />

      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        // @ts-ignore
        fetchPriority={lowResSrc ? 'low' : 'auto'}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        {...props}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          Image not available
        </div>
      )}
    </div>
  );
}