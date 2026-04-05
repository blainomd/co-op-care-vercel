import { type LucideIcon } from 'lucide-react';
import {
  Heart,
  Sprout,
  TreePine,
  Mountain,
  Users,
  Handshake,
  Trophy,
  Stethoscope,
  Phone,
  ClipboardList,
  Home,
  BarChart3,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
  Check,
  CookingPot,
  ShowerHead,
  Bed,
  Sofa,
  DoorOpen,
  Pill,
  Video,
  Flag,
  CircleAlert,
  Activity,
  UserPlus,
  Sparkles,
  Bell,
  Calendar,
  Star,
  Leaf,
  ChevronRight,
  ArrowRight,
  Mic,
  Database,
  MapPin,
  Lock,
  Brain,
} from 'lucide-react';

// Map string keys to Lucide icons — replaces emoji throughout the app
// eslint-disable-next-line react-refresh/only-export-components
export const ICONS: Record<string, LucideIcon> = {
  // Care tiers
  seedling: Sprout,
  rooted: TreePine,
  canopy: Mountain,

  // Care card
  heart: Heart,
  users: Users,
  handshake: Handshake,
  trophy: Trophy,

  // Sage actions
  emergency: CircleAlert,
  stethoscope: Stethoscope,
  phone: Phone,
  clipboard: ClipboardList,
  home: Home,
  chart: BarChart3,
  message: MessageCircle,

  // Video assessment rooms
  kitchen: CookingPot,
  bathroom: ShowerHead,
  bedroom: Bed,
  living_room: Sofa,
  hallways_stairs: DoorOpen,
  entrance: Home,
  medication_area: Pill,
  video: Video,

  // Status
  check: Check,
  warning: AlertTriangle,
  shield: ShieldCheck,
  flag: Flag,
  activity: Activity,
  pulse: Activity,

  // Homepage differentiators
  speaker: MessageCircle,
  growth: Sprout,
  data: BarChart3,

  // Misc
  star: Star,
  leaf: Leaf,
  sparkles: Sparkles,
  bell: Bell,
  calendar: Calendar,
  arrow_right: ArrowRight,
  chevron_right: ChevronRight,
  mic: Mic,
  database: Database,
  map_pin: MapPin,
  lock: Lock,
  brain: Brain,
  user_plus: UserPlus,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export function Icon({ name, size = 16, className = '', color }: IconProps) {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} color={color} strokeWidth={1.75} />;
}

// For string contexts (like Sage engine responses where we can't render JSX),
// return empty string — the UI layer should handle icon rendering
// eslint-disable-next-line react-refresh/only-export-components
export function iconKey(emoji: string): string {
  const map: Record<string, string> = {
    '\u{1F331}': 'seedling',
    '\u{1F333}': 'rooted',
    '\u{1F3D4}\uFE0F': 'canopy',
    '\u{1F49B}': 'heart',
    '\u{1F465}': 'users',
    '\u{1F91D}': 'handshake',
    '\u{1F3C5}': 'trophy',
    '\u{1F6A8}': 'emergency',
    '\u{1FA7A}': 'stethoscope',
    '\u{1F4DE}': 'phone',
    '\u{1F4CB}': 'clipboard',
    '\u{1F3E0}': 'home',
    '\u{1F3E1}': 'home',
    '\u{1F4CA}': 'chart',
    '\u{1F5E3}\uFE0F': 'speaker',
    '\u{1F33F}': 'leaf',
    '\u{1F373}': 'kitchen',
    '\u{1F6BF}': 'bathroom',
    '\u{1F6CF}': 'bedroom',
    '\u{1F6CB}': 'living_room',
    '\u{1F6AA}': 'hallways_stairs',
    '\u{1F48A}': 'medication_area',
    '\u{1F4F9}': 'video',
    '\u{1F44B}': 'sparkles',
    '\u{1F4A1}': 'sparkles',
  };
  return map[emoji] || 'heart';
}
