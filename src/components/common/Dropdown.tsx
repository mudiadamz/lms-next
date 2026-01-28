import { useState, useRef, useEffect, ReactNode } from 'react';
import './Dropdown.css';

interface DropdownItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown = ({
  trigger,
  items,
  align = 'left',
  className = '',
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const menuEl = menuRef.current;
      const container = dropdownRef.current;
      if (!menuEl || !container) return;
      const triggerRect = container.getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
        setOpenDirection('up');
      } else {
        setOpenDirection('down');
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      requestAnimationFrame(updatePosition);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`dropdown-menu dropdown-menu--${align} dropdown-menu--${openDirection}`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="dropdown-divider" />;
            }

            return (
              <button
                key={index}
                className={`dropdown-item ${item.disabled ? 'dropdown-item--disabled' : ''}`}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

