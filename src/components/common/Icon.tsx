import { IconType } from 'react-icons';
import { 
  HiHome, 
  HiBookOpen, 
  HiDocumentText, 
  HiClipboardList, 
  HiAcademicCap,
  HiChartBar,
  HiCalendar,
  HiUserGroup,
  HiChatAlt2,
  HiMail,
  HiFolder,
  HiCog,
  HiMenu,
  HiX,
  HiChevronRight,
  HiChevronLeft,
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiXCircle,
  HiExclamation,
  HiInformationCircle,
  HiClock,
  HiUser,
  HiUsers,
  HiOfficeBuilding,
  HiBookmark,
  HiBell,
  HiLogout,
  HiArrowLeft,
  HiArrowRight,
  HiDownload,
  HiUpload,
  HiEye,
  HiLockClosed,
  HiKey,
  HiShieldCheck,
  HiChartPie,
  HiPresentationChartLine,
  HiNewspaper,
  HiQuestionMarkCircle,
  HiVideoCamera,
  HiPhotograph,
  HiLink,
  HiPaperClip,
  HiCheckCircle,
  HiXCircle as HiXCircleSolid,
  HiStar,
  HiHeart,
  HiThumbUp,
  HiThumbDown,
  HiMoon,
  HiSun,
} from 'react-icons/hi';

// Icon mapping untuk iOS-style icons
export const ICONS = {
  // Navigation
  home: HiHome,
  menu: HiMenu,
  close: HiX,
  chevronRight: HiChevronRight,
  chevronLeft: HiChevronLeft,
  arrowLeft: HiArrowLeft,
  arrowRight: HiArrowRight,
  
  // Academic
  book: HiBookOpen,
  document: HiDocumentText,
  assignment: HiClipboardList,
  quiz: HiAcademicCap,
  grade: HiChartBar,
  schedule: HiCalendar,
  calendar: HiCalendar,
  subject: HiBookmark,
  
  // Users
  user: HiUser,
  users: HiUsers,
  userGroup: HiUserGroup,
  
  // Communication
  chat: HiChatAlt2,
  message: HiMail,
  forum: HiChatAlt2,
  announcement: HiBell,
  
  // Actions
  search: HiSearch,
  plus: HiPlus,
  edit: HiPencil,
  delete: HiTrash,
  check: HiCheck,
  checkCircle: HiCheckCircle,
  xCircle: HiXCircleSolid,
  download: HiDownload,
  upload: HiUpload,
  eye: HiEye,
  
  // Status
  success: HiCheckCircle,
  error: HiXCircleSolid,
  warning: HiExclamation,
  info: HiInformationCircle,
  
  // Other
  folder: HiFolder,
  settings: HiCog,
  logout: HiLogout,
  lock: HiLockClosed,
  key: HiKey,
  shield: HiShieldCheck,
  analytics: HiChartPie,
  report: HiPresentationChartLine,
  news: HiNewspaper,
  question: HiQuestionMarkCircle,
  video: HiVideoCamera,
  image: HiPhotograph,
  link: HiLink,
  attachment: HiPaperClip,
  clock: HiClock,
  star: HiStar,
  heart: HiHeart,
  like: HiThumbUp,
  dislike: HiThumbDown,
  moon: HiMoon,
  sun: HiSun,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
}

export const Icon = ({ name, size = 20, color, className }: IconProps) => {
  const IconComponent = ICONS[name] as IconType;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      style={{ 
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    />
  );
};

