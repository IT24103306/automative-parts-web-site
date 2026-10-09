import { useState } from 'react';

import clsx from 'clsx';

interface AutomotiveImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
}

const getCategoryFallbackImage = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('engine')) return '/images/timing_belt_1791466207397.jpg';
  if (cat.includes('brake')) return '/images/brake_disc_1791466289639.jpg';
  if (cat.includes('electrical') || cat.includes('lighting')) return '/images/spark_plug_1791466164055.jpg';
  if (cat.includes('battery')) return '/images/spark_plug_1791466164055.jpg'; // We don't have battery image, fallback to spark plug or something
  if (cat.includes('cooling')) return '/images/timing_belt_1791466207397.jpg';
  if (cat.includes('fuel') || cat.includes('lubricant')) return '/images/fuel_injector_1791466246209.jpg';
  if (cat.includes('wheel') || cat.includes('bearing') || cat.includes('belt')) return '/images/wheel_bearing_1791466185338.jpg';
  if (cat.includes('ignition') || cat.includes('spark')) return '/images/spark_plug_1791466164055.jpg';
  if (cat.includes('suspension')) return '/images/shock_absorber_1791466413366.jpg';
  if (cat.includes('steering')) return '/images/steering_pump_1791466475284.jpg';
  if (cat.includes('transmission') || cat.includes('clutch')) return '/images/clutch_kit_1791466499039.jpg';
  return '/images/wheel_bearing_1791466185338.jpg';
};

export default function AutomotiveImage({ src, alt, category = 'General', className }: AutomotiveImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error || !src) {
    return (
      <div className={clsx('relative overflow-hidden bg-[#0a0a0a]', className)}>
        <img
          src={getCategoryFallbackImage(category)}
          alt={category + ' Fallback'}
          className={clsx(
            'w-full h-full object-contain',
            className
          )}
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
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={clsx(
          'w-full h-full object-contain transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
      />
    </div>
  );
}
