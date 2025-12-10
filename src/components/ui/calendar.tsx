import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { vi } from "date-fns/locale";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      locale={vi}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        today: "border border-primary",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        range_start: "bg-primary text-primary-foreground rounded-l-md",
        range_end: "bg-primary text-primary-foreground rounded-r-md",
        range_middle: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        chevron: `${defaultClassNames.chevron} fill-primary`,
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
