import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRangePreset =
  | 'last3months'
  | 'last6months'
  | 'last12months'
  | 'ytd'
  | 'all'
  | 'custom';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange, preset: DateRangePreset) => void;
  selectedPreset: DateRangePreset;
}

export const DateRangePicker = ({ value, onChange, selectedPreset }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const presets: Array<{ label: string; value: DateRangePreset }> = [
    { label: 'Last 3 Months', value: 'last3months' },
    { label: 'Last 6 Months', value: 'last6months' },
    { label: 'Last 12 Months', value: 'last12months' },
    { label: 'Year to Date', value: 'ytd' },
    { label: 'All Time', value: 'all' },
    { label: 'Custom Range', value: 'custom' },
  ];

  const getPresetRange = (preset: DateRangePreset): DateRange => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (preset) {
      case 'last3months': {
        const from = new Date(year, month - 3, 1);
        return { from, to: today };
      }
      case 'last6months': {
        const from = new Date(year, month - 6, 1);
        return { from, to: today };
      }
      case 'last12months': {
        const from = new Date(year, month - 12, 1);
        return { from, to: today };
      }
      case 'ytd': {
        const from = new Date(year, 0, 1);
        return { from, to: today };
      }
      case 'all':
        return { from: undefined, to: undefined };
      case 'custom':
        return value;
      default:
        return { from: undefined, to: undefined };
    }
  };

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = getPresetRange(preset);
    onChange(range, preset);
    if (preset !== 'custom') {
      setIsOpen(false);
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      onChange(range, 'custom');
    }
  };

  const formatDateRange = () => {
    if (selectedPreset === 'all') return 'All Time';
    if (!value.from) return 'Select date range';
    if (!value.to) return format(value.from, 'MMM dd, yyyy');
    return `${format(value.from, 'MMM dd, yyyy')} - ${format(value.to, 'MMM dd, yyyy')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full sm:w-auto justify-start text-left font-normal',
            !value.from && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col border-b sm:border-b-0 sm:border-r p-3 gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedPreset === preset.value ? 'default' : 'ghost'}
                className="justify-start text-sm"
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          {selectedPreset === 'custom' && (
            <div className="p-3">
              <Calendar
                mode="range"
                selected={value}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                className="rounded-md"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
