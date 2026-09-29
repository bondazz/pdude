import React from 'react';
import {
  PlaySquare,
  Crown,
  Video,
  Sparkles,
  Glasses,
  Film,
  MessageCircle,
  Wand2,
  Heart,
  Flame,
  Star,
  Gamepad2,
  Image as ImageIcon,
  Compass,
  Radio,
  Tv,
  Camera,
  Coins,
  Smile,
  Shield,
  Dices,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  slug?: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({ name, slug = '', size = 18, className = '' }: CategoryIconProps) {
  const iconLower = (name || slug).toLowerCase();

  if (iconLower.includes('tube') || iconLower.includes('video') || iconLower.includes('play')) {
    return <PlaySquare size={size} className={className} />;
  }
  if (iconLower.includes('premium') || iconLower.includes('crown') || iconLower.includes('top')) {
    return <Crown size={size} className={className} />;
  }
  if (iconLower.includes('cam') || iconLower.includes('live')) {
    return <Camera size={size} className={className} />;
  }
  if (iconLower.includes('game') || iconLower.includes('gamepad')) {
    return <Gamepad2 size={size} className={className} />;
  }
  if (iconLower.includes('ai') || iconLower.includes('generator') || iconLower.includes('wand') || iconLower.includes('sparkle')) {
    return <Wand2 size={size} className={className} />;
  }
  if (iconLower.includes('chat') || iconLower.includes('message')) {
    return <MessageCircle size={size} className={className} />;
  }
  if (iconLower.includes('bet') || iconLower.includes('dice') || iconLower.includes('casino')) {
    return <Dices size={size} className={className} />;
  }
  if (iconLower.includes('vr') || iconLower.includes('glasses')) {
    return <Glasses size={size} className={className} />;
  }
  if (iconLower.includes('hentai') || iconLower.includes('anime') || iconLower.includes('cartoon')) {
    return <Film size={size} className={className} />;
  }
  if (iconLower.includes('dating') || iconLower.includes('heart') || iconLower.includes('love')) {
    return <Heart size={size} className={className} />;
  }
  if (iconLower.includes('popular') || iconLower.includes('flame') || iconLower.includes('hot')) {
    return <Flame size={size} className={className} />;
  }
  if (iconLower.includes('pic') || iconLower.includes('photo') || iconLower.includes('image')) {
    return <ImageIcon size={size} className={className} />;
  }
  if (iconLower.includes('vpn') || iconLower.includes('safe') || iconLower.includes('security')) {
    return <Shield size={size} className={className} />;
  }

  return <Sparkles size={size} className={className} />;
}
