import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Globe, 
  DollarSign, 
  Star, 
  CreditCard, 
  Mountain, 
  Camera, 
  Users, 
  Award,
  Trophy,
  Medal,
  Crown
} from "lucide-react";

interface AchievementBadgeProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    category: string;
    iconName: string;
    badgeColor: string;
    points: number;
    rarity: string;
    isActive?: boolean;
    createdAt?: string;
  };
  isUnlocked?: boolean;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

const iconMap = {
  MapPin,
  Navigation,
  Globe,
  DollarSign,
  Star,
  CreditCard,
  Mountain,
  Camera,
  Users,
  Award,
  Trophy,
  Medal,
  Crown,
};

const rarityConfig = {
  common: {
    borderColor: "border-gray-300",
    glowColor: "shadow-gray-200",
    bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    textColor: "text-gray-700"
  },
  rare: {
    borderColor: "border-blue-400",
    glowColor: "shadow-blue-200",
    bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    textColor: "text-blue-700"
  },
  epic: {
    borderColor: "border-purple-400",
    glowColor: "shadow-purple-200",
    bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    textColor: "text-purple-700"
  },
  legendary: {
    borderColor: "border-gradient-to-r from-yellow-400 to-orange-500",
    glowColor: "shadow-yellow-300",
    bgGradient: "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50",
    textColor: "text-orange-700"
  }
};

const sizeConfig = {
  sm: {
    container: "w-16 h-16",
    icon: "w-6 h-6",
    text: "text-xs",
    title: "text-sm",
    points: "text-xs"
  },
  md: {
    container: "w-24 h-24",
    icon: "w-8 h-8",
    text: "text-sm",
    title: "text-base",
    points: "text-sm"
  },
  lg: {
    container: "w-32 h-32",
    icon: "w-12 h-12",
    text: "text-base",
    title: "text-lg",
    points: "text-base"
  }
};

export default function AchievementBadge({
  achievement,
  isUnlocked = false,
  size = "md",
  showDetails = false,
  className,
  onClick
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.iconName as keyof typeof iconMap] || Award;
  const rarity = rarityConfig[achievement.rarity as keyof typeof rarityConfig] || rarityConfig.common;
  const sizeStyle = sizeConfig[size];

  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      {/* Badge Container */}
      <div className={cn(
        "relative flex flex-col items-center justify-center rounded-full border-4 transition-all duration-300",
        sizeStyle.container,
        isUnlocked ? rarity.borderColor : "border-gray-200",
        isUnlocked ? rarity.bgGradient : "bg-gray-100",
        isUnlocked ? `${rarity.glowColor} shadow-lg` : "shadow-sm",
        !isUnlocked && "opacity-60 grayscale"
      )}>
        
        {/* Achievement Icon */}
        <div className={cn(
          "flex items-center justify-center rounded-full p-2",
          isUnlocked ? achievement.badgeColor : "bg-gray-400",
          achievement.rarity === "legendary" && isUnlocked && "animate-pulse"
        )}>
          <IconComponent className={cn(
            sizeStyle.icon,
            "text-white"
          )} />
        </div>

        {/* Points Badge */}
        {isUnlocked && (
          <div className="absolute -top-2 -right-2 flex items-center justify-center">
            <Badge variant="secondary" className={cn(
              "min-w-6 h-6 rounded-full text-xs font-bold",
              rarity.textColor,
              achievement.rarity === "legendary" && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
            )}>
              {achievement.points}
            </Badge>
          </div>
        )}

        {/* Rarity Indicator */}
        {isUnlocked && achievement.rarity !== "common" && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className={cn(
              "w-3 h-1 rounded-full",
              achievement.rarity === "rare" && "bg-blue-400",
              achievement.rarity === "epic" && "bg-purple-400", 
              achievement.rarity === "legendary" && "bg-gradient-to-r from-yellow-400 to-orange-500"
            )} />
          </div>
        )}

        {/* Lock Overlay for Locked Achievements */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-20">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-b-0 rounded-t-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Details */}
      {showDetails && (
        <div className="mt-3 text-center space-y-1">
          <h3 className={cn(
            "font-semibold leading-tight",
            sizeStyle.title,
            isUnlocked ? rarity.textColor : "text-gray-500"
          )}>
            {achievement.name}
          </h3>
          <p className={cn(
            "text-gray-600 leading-tight",
            sizeStyle.text
          )}>
            {achievement.description}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {achievement.category}
            </Badge>
            <Badge variant="outline" className={cn(
              "text-xs",
              achievement.rarity === "legendary" && "bg-gradient-to-r from-yellow-100 to-orange-100"
            )}>
              {achievement.rarity}
            </Badge>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {!showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-xs text-gray-300">{achievement.description}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs">{achievement.points} pts</span>
            <span className="text-xs">•</span>
            <span className="text-xs capitalize">{achievement.rarity}</span>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}

      {/* New Achievement Sparkle Animation */}
      {isUnlocked && achievement.rarity === "legendary" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-2 right-0 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-100"></div>
          <div className="absolute bottom-0 right-2 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-200"></div>
          <div className="absolute bottom-2 left-0 w-1 h-1 bg-orange-500 rounded-full animate-ping delay-300"></div>
        </div>
      )}
    </div>
  );
}