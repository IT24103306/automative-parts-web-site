import { useState } from 'react';
import clsx from 'clsx';
import { Package } from 'lucide-react';

interface AutomotiveImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
}

const getCategoryFallbackImage = (category: string) => {
  const cat = (category || 'general').toLowerCase();
  if (cat.includes('engine')) return '/images/timing_belt_1791466207397.jpg';
  if (cat.includes('brake')) return '/images/brake_disc_1791466289639.jpg';
  if (cat.includes('electrical') || cat.includes('lighting')) return '/images/spark_plug_1791466164055.jpg';
  if (cat.includes('battery')) return '/images/spark_plug_1791466164055.jpg';
  if (cat.includes('cooling')) return '/images/timing_belt_1791466207397.jpg';
  if (cat.includes('fuel') || cat.includes('lubricant')) return '/images/fuel_injector_1791466246209.jpg';
  if (cat.includes('wheel') || cat.includes('bearing') || cat.includes('belt')) return '/images/wheel_bearing_1791466185338.jpg';
  if (cat.includes('ignition') || cat.includes('spark')) return '/images/spark_plug_1791466164055.jpg';
  if (cat.includes('suspension')) return '/images/shock_absorber_1791466413366.jpg';
  if (cat.includes('steering')) return '/images/steering_pump_1791466475284.jpg';
  if (cat.includes('transmission') || cat.includes('clutch')) return '/images/clutch_kit_1791466499039.jpg';
  return '/images/wheel_bearing_1791466185338.jpg';
};

const resolveImageUrl = (src?: string): string => {
  if (!src) return '';
  const trimmed = src.trim();
  if (!trimmed) return '';

  // If already absolute URL (http/https), return as-is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If it's a backend uploads path (/uploads/...), resolve to backend origin in production if needed
  if (trimmed.startsWith('/uploads/')) {
    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'https://automative-parts-web-site.onrender.com/api';
    const backendOrigin = apiUrl.trim().replace(/\/api\/?$/, '');
    if (/^https?:\/\//i.test(backendOrigin)) {
      return `${backendOrigin}${trimmed}`;
    }
  }

  return trimmed;
};

export default function AutomotiveImage({ src, alt, category = 'General', className }: AutomotiveImageProps) {
  const [errorStage, setErrorStage] = useState<'none' | 'primary-failed' | 'fallback-failed'>('none');
  const [loading, setLoading] = useState(true);

  const resolvedSrc = resolveImageUrl(src);
  const fallbackSrc = getCategoryFallbackImage(category);

  // If both primary and fallback failed, render metallic SVG icon placeholder
  if (errorStage === 'fallback-failed' || (!resolvedSrc && errorStage === 'primary-failed')) {
    return (
      <div className={clsx('relative overflow-hidden bg-[#0d0d0d] flex flex-col items-center justify-center p-4 border border-neutral-900', className)}>
        <Package className="w-12 h-12 text-neutral-600 mb-2 stroke-[1.5]" />
        <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest text-center truncate max-w-full">
          {category || 'Part Item'}
        </span>
      </div>
    );
  }

  // If primary image failed or was empty, attempt category fallback image
  if (errorStage === 'primary-failed' || !resolvedSrc) {
    return (
      <div className={clsx('relative overflow-hidden bg-[#0a0a0a]', className)}>
        <img
          src={fallbackSrc}
          alt={`${category} Fallback`}
          onError={() => setErrorStage('fallback-failed')}
          className={clsx('w-full h-full object-contain', className)}
        />
      </div>
    );
  }

  return (
    <div className={clsx('relative overflow-hidden bg-[#0a0a0a]', className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
          <div className="w-6 h-6 border-2 border-neutral-700 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        onError={() => {
          setErrorStage('primary-failed');
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        className={clsx(
          'w-full h-full object-contain transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
      />
    </div>
  );
}
