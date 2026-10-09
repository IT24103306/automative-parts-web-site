import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HotspotProps {
  top: string;
  left: string;
  title: string;
  description: string;
  categoryId: string;
  color?: 'primary' | 'white' | 'neutral';
}

export default function EngineeringHotspot({ top, left, title, description, categoryId, color = 'neutral' }: HotspotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getDotColor = () => {
    switch(color) {
      case 'primary': return 'bg-primary shadow-[0_0_10px_rgba(255,0,0,0.8)]';
      case 'white': return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]';
      case 'neutral': return 'bg-[#8e8e8e] shadow-[0_0_10px_rgba(142,142,142,0.8)]';
      default: return 'bg-neutral-400';
    }
  };

  return (
    <div 
      className="absolute flex items-center gap-3 cursor-pointer z-20 group"
      style={{ top, left }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsOpen(false); }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={`relative flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full animate-pulse transition-all duration-300 ${getDotColor()} ${isHovered ? 'scale-150' : 'scale-100'}`} />
        {isHovered && <div className="absolute w-8 h-[1px] bg-white/50 left-full ml-2" />}
      </div>
      
      <span className={`text-xs font-mono tracking-widest transition-colors duration-300 ${isHovered ? 'text-white' : 'text-white/70'}`}>
        {title}
      </span>

      {isOpen && (
        <div className="absolute top-8 left-0 w-64 bg-black/90 border border-neutral-800 p-4 rounded-sm shadow-xl backdrop-blur-md">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">{title}</h4>
          <p className="text-xs text-neutral-400 font-mono mb-4">{description}</p>
          <Link to={`/products?category=${categoryId}`} className="text-[10px] text-primary font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center">
            VIEW ENGINE PARTS →
          </Link>
        </div>
      )}
    </div>
  );
}
