import { 
    Sparkles, 
    Tag, 
    Waves, 
    Mountain, 
    Trees, 
    Droplet,  
    Snowflake, 
    Building2, 
    Baby, 
    Users, 
    PawPrint, 
    MapPin, 
    PartyPopper,
    TreePalm,
    Trophy,
    Wifi
} from 'lucide-react';

export interface Badge {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface BadgeFiltersProps {
    selectedBadges: string[];
    onBadgeToggle: (badgeId: string) => void;
}

const BADGES: Badge[] = [
    { id: 'for-you', name: 'For you', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'make-offer', name: 'Make an offer', icon: <Tag className="w-4 h-4" /> },
    { id: 'ocean', name: 'Ocean', icon: <Waves className="w-4 h-4" /> },
    { id: 'mountain', name: 'Mountain', icon: <Mountain className="w-4 h-4" /> },
    { id: 'forest', name: 'Forest', icon: <Trees className="w-4 h-4" /> },
    { id: 'lake', name: 'Lake', icon: <Droplet className="w-4 h-4" /> },
    { id: 'desert', name: 'Desert', icon: <TreePalm className="w-4 h-4" /> },
    { id: 'skiing', name: 'Skiing', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'urban', name: 'Urban', icon: <Building2 className="w-4 h-4" /> },
    { id: 'families', name: 'Families', icon: <Baby className="w-4 h-4" /> },
    { id: 'groups', name: 'Groups', icon: <Users className="w-4 h-4" /> },
    { id: 'pet-friendly', name: 'Pet-friendly', icon: <PawPrint className="w-4 h-4" /> },
    { id: 'national-parks', name: 'National parks', icon: <MapPin className="w-4 h-4" /> },
    { id: 'holidays', name: 'Holidays', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'golf', name: 'Golf', icon: <Trophy className="w-4 h-4" /> },
    { id: 'world-cup', name: 'World Cup', icon: <Trophy className="w-4 h-4" /> },
    { id: 'remote-work', name: 'Remote Work', icon: <Wifi className="w-4 h-4" /> },
];

export function BadgeFilters({ selectedBadges, onBadgeToggle }: BadgeFiltersProps) {
    const handleBadgeClick = (badgeId: string) => {
        // Si el badge ya está seleccionado, lo deseleccionamos
        if (selectedBadges.includes(badgeId)) {
            onBadgeToggle(badgeId);
        } else {
            // Eliminamos todos los badges seleccionados
            selectedBadges.forEach(selectedId => {
                onBadgeToggle(selectedId);
            });
            // Seleccionamos el nuevo badge
            onBadgeToggle(badgeId);
        }
    };

    // Como solo puede haber uno seleccionado, tomamos el primero o ninguno
    const selectedBadge = selectedBadges.length > 0 ? selectedBadges[0] : null;

    return (
        <div className="border-b border-neutral-200 bg-white w-full">
            <div className="w-full px-6 lg:px-12">
                <div className="overflow-x-auto no-scrollbar">
                    <div className="flex gap-6 py-3 min-w-max">
                        {BADGES.map((badge) => {
                            const isSelected = selectedBadge === badge.id;
                            
                            return (
                                <button
                                    key={badge.id}
                                    onClick={() => handleBadgeClick(badge.id)}
                                    className={`flex items-center gap-2 pb-3 border-b-2 transition-all duration-200 ${
                                        isSelected 
                                            ? 'border-neutral-900' 
                                            : 'border-transparent'
                                    }`}
                                >
                                    <div className={`transition-colors ${
                                        isSelected 
                                            ? 'text-neutral-900' 
                                            : 'text-neutral-500 group-hover:text-neutral-700'
                                    }`}>
                                        {badge.icon}
                                    </div>
                                    <span className={`text-xs font-medium whitespace-nowrap transition-colors ${
                                        isSelected 
                                            ? 'text-neutral-900' 
                                            : 'text-neutral-500 hover:text-neutral-700'
                                    }`}>
                                        {badge.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}