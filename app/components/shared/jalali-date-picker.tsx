"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronLeft, CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  JalaliDate,
  JALALI_MONTHS,
  JALALI_WEEKDAYS_SHORT,
  jalaliMonthLength,
  jalaliWeekday,
  todayJalali,
  formatJalaliDateLong,
  toPersianDigits,
} from "@/lib/jalali";

type JalaliDatePickerProps = {
  id?: string;
  value: JalaliDate | null;
  onChange: (date: JalaliDate) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  /** Oldest selectable Jalali year, e.g. 1300 */
  minYear?: number;
  /** Newest selectable Jalali year — defaults to (this year - 5), a reasonable "must be at least 5" floor */
  maxYear?: number;
};

export function JalaliDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ تولد",
  hasError,
  disabled,
  minYear = 1300,
  maxYear,
  id,
}: JalaliDatePickerProps) {
  const today = useMemo(() => todayJalali(), []);
  const resolvedMaxYear = maxYear ?? today.jy;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.jy ?? resolvedMaxYear - 20);
  const [viewMonth, setViewMonth] = useState(value?.jm ?? 1);

  const daysInMonth = jalaliMonthLength(viewYear, viewMonth);
  const firstWeekday = jalaliWeekday(viewYear, viewMonth, 1);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = resolvedMaxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [minYear, resolvedMaxYear]);

  function goPrevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDay(jd: number) {
    onChange({ jy: viewYear, jm: viewMonth, jd });
    setOpen(false);
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-md border bg-[#FBF6EA] px-3 text-sm text-[#2A2018]",
            "outline-none transition-colors focus:border-[#B4863E] focus:ring-2 focus:ring-[#B4863E]/30",
            hasError ? "border-red-400" : "border-[#EDE3CC]",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span className={cn(!value && "text-[#6B5D4F]")}>
            {value ? formatJalaliDateLong(value) : placeholder}
          </span>
          <CalendarDays className="h-4 w-4 text-[#B4863E]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={id ? id : "empty"}
        align="start"
        className="w-72 border-[#EDE3CC] bg-[#FBF6EA] p-3"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrevMonth}
            aria-label="ماه قبل"
            className="rounded p-1 text-[#6B5D4F] transition-colors hover:bg-[#EDE3CC] hover:text-[#2A2018]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="rounded border border-[#EDE3CC] bg-white px-1.5 py-1 text-xs text-[#2A2018]"
            >
              {JALALI_MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="rounded border border-[#EDE3CC] bg-white px-1.5 py-1 text-xs text-[#2A2018]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {toPersianDigits(y)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={goNextMonth}
            aria-label="ماه بعد"
            className="rounded p-1 text-[#6B5D4F] transition-colors hover:bg-[#EDE3CC] hover:text-[#2A2018]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-[#6B5D4F]">
          {JALALI_WEEKDAYS_SHORT.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const isSelected =
              value?.jy === viewYear &&
              value?.jm === viewMonth &&
              value?.jd === day;
            const isToday =
              today.jy === viewYear &&
              today.jm === viewMonth &&
              today.jd === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors",
                  isSelected
                    ? "bg-[#B4863E] font-semibold text-white"
                    : "text-[#2A2018] hover:bg-[#EDE3CC]",
                  isToday && !isSelected && "ring-1 ring-[#B4863E]/50",
                )}
              >
                {toPersianDigits(day)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
