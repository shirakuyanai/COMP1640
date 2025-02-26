import React, { forwardRef, SelectHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';

// Custom select component that uses divs for styling but a real select for functionality
export interface SelectProps {
  children?: ReactNode;
  onValueChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ className, children, onValueChange, placeholder }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

    const handleSelect = (value: string, label: string) => {
      setSelectedValue(value);
      setSelectedLabel(label);
      if (onValueChange) {
        onValueChange(value);
      }
      setIsOpen(false);
    };

    return (
      <div className="relative" ref={ref}>
        <div
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer',
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedLabel || placeholder || "Select an option"}
          <span className="ml-2">▼</span>
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === SelectItem) {
                return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
                  onSelect: handleSelect,
                });
              }
              return child;
            })}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// These components are kept for API compatibility but are simplified
const SelectTrigger = ({ children }: { children: ReactNode }) => <>{children}</>;
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => <>{placeholder}</>;
SelectValue.displayName = 'SelectValue';

const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>;
SelectContent.displayName = 'SelectContent';

export interface SelectItemProps {
  value: string;
  children: ReactNode;
  onSelect?: (value: string, label: string) => void;
  className?: string;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-3 py-2 text-sm cursor-pointer hover:bg-gray-100',
        className
      )}
      onClick={() => onSelect && onSelect(value, children?.toString() || value)}
      {...props}
    >
      {children}
    </div>
  )
);

SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
