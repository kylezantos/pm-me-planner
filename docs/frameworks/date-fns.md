# date-fns Documentation

> **Library:** date-fns v4.1.0
> **Official Repo:** https://github.com/date-fns/date-fns

Modern JavaScript date utility library - modular, immutable, and type-safe.

---

## Installation

```bash
npm install date-fns
# or
bun add date-fns
```

**For timezone support:**

```bash
npm install @date-fns/tz
```

---

## Basic Usage

### Format Dates

```javascript
import { format } from 'date-fns'

format(new Date(2014, 1, 11), 'yyyy-MM-dd')
//=> '2014-02-11'

format(new Date(), 'MM/dd/yyyy')
//=> '10/21/2025'

format(new Date(), 'PPpp')
//=> 'Oct 21, 2025 at 2:30 PM'
```

**Common Format Patterns:**

- `yyyy-MM-dd` → 2025-10-21
- `MM/dd/yyyy` → 10/21/2025
- `MMMM do, yyyy` → October 21st, 2025
- `PPP` → October 21st, 2025
- `PPpp` → Oct 21, 2025 at 2:30 PM
- `HH:mm:ss` → 14:30:45

### Parse Dates

```javascript
import { parse } from 'date-fns'

parse('11.02.87', 'd.MM.yy', new Date())
//=> Wed Feb 11 1987 00:00:00

parse('2025-10-21', 'yyyy-MM-dd', new Date())
//=> Tue Oct 21 2025 00:00:00
```

### Compare Dates

```javascript
import { compareAsc, compareDesc } from 'date-fns'

const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
]

dates.sort(compareAsc)
//=> [
//   Wed Feb 11 1987 00:00:00,
//   Mon Jul 10 1989 00:00:00,
//   Sun Jul 02 1995 00:00:00
// ]

dates.sort(compareDesc) // Reverse order
```

---

## Date Manipulation

### Add/Subtract Time

```javascript
import {
  addDays,
  addHours,
  addMinutes,
  subDays,
  subMonths,
  addYears,
} from 'date-fns'

addDays(new Date(2025, 0, 1), 7)
//=> Wed Jan 08 2025

addHours(new Date(2025, 0, 1, 10, 0), 2)
//=> Wed Jan 01 2025 12:00:00

subDays(new Date(), 3)
//=> 3 days ago

subMonths(new Date(), 2)
//=> 2 months ago

addYears(new Date(), 1)
//=> Next year
```

### Set Specific Values

```javascript
import { setHours, setMinutes, setDate, setMonth } from 'date-fns'

setHours(new Date(), 14)
//=> Today at 2:00 PM

setDate(new Date(), 15)
//=> The 15th of current month

setMonth(new Date(), 11)
//=> December of current year
```

---

## Relative Time

### Format Distance

```javascript
import { formatDistance, formatDistanceToNow } from 'date-fns'

formatDistance(new Date(2025, 0, 1), new Date(2024, 0, 1))
//=> 'about 1 year'

formatDistance(subDays(new Date(), 3), new Date(), { addSuffix: true })
//=> '3 days ago'

formatDistanceToNow(new Date(2025, 0, 1))
//=> 'in about 2 months'

formatDistanceToNow(subHours(new Date(), 5), { addSuffix: true })
//=> '5 hours ago'
```

### Relative Formatting

```javascript
import { formatRelative } from 'date-fns'

formatRelative(new Date(), new Date())
//=> 'today at 2:30 PM'

formatRelative(subDays(new Date(), 1), new Date())
//=> 'yesterday at 2:30 PM'

formatRelative(addDays(new Date(), 3), new Date())
//=> 'Friday at 2:30 PM'
```

---

## Date Queries

### Is Date Functions

```javascript
import {
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isPast,
  isFuture,
  isBefore,
  isAfter,
  isEqual,
  isWeekend,
} from 'date-fns'

isToday(new Date())
//=> true

isTomorrow(addDays(new Date(), 1))
//=> true

isPast(new Date(2020, 0, 1))
//=> true

isFuture(new Date(2030, 0, 1))
//=> true

isBefore(new Date(2020, 0, 1), new Date(2021, 0, 1))
//=> true

isWeekend(new Date(2025, 10, 22)) // Saturday
//=> true
```

### Within Interval

```javascript
import { isWithinInterval } from 'date-fns'

isWithinInterval(new Date(2025, 0, 15), {
  start: new Date(2025, 0, 1),
  end: new Date(2025, 0, 31),
})
//=> true
```

---

## Intervals & Differences

### Difference Between Dates

```javascript
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInYears,
} from 'date-fns'

differenceInDays(new Date(2025, 0, 15), new Date(2025, 0, 1))
//=> 14

differenceInHours(new Date(2025, 0, 1, 14, 0), new Date(2025, 0, 1, 10, 0))
//=> 4

differenceInMonths(new Date(2025, 11, 1), new Date(2025, 0, 1))
//=> 11
```

### Business Days

```javascript
import {
  differenceInBusinessDays,
  addBusinessDays,
  isBusinessDay,
} from 'date-fns'

differenceInBusinessDays(new Date(2025, 0, 10), new Date(2025, 0, 1))
//=> 7 (excludes weekends)

addBusinessDays(new Date(2025, 0, 1), 5)
//=> Skips weekends

isBusinessDay(new Date(2025, 10, 22)) // Saturday
//=> false
```

---

## Start/End of Period

```javascript
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns'

startOfDay(new Date(2025, 0, 15, 14, 30))
//=> Wed Jan 15 2025 00:00:00

endOfDay(new Date(2025, 0, 15, 14, 30))
//=> Wed Jan 15 2025 23:59:59

startOfWeek(new Date())
//=> Sunday 00:00:00 of current week

startOfMonth(new Date())
//=> 1st day of month at 00:00:00

endOfYear(new Date())
//=> Dec 31 at 23:59:59
```

---

## Timezone Support

### Using @date-fns/tz

```typescript
import { TZDate } from '@date-fns/tz'
import { addHours, format } from 'date-fns'

// Create a date in a specific timezone
const sgDate = new TZDate(2022, 2, 13, 'Asia/Singapore')
//=> Sun Mar 13 2022 00:00:00 GMT+0800

// Perform timezone-aware calculations
addHours(sgDate, 2).toString()
//=> Sun Mar 13 2022 02:00:00 GMT+0800

// Format preserves timezone context
format(sgDate, 'PPpp')
//=> Mar 13, 2022 at 12:00 AM
```

### Transposing Between Timezones

```typescript
import { transpose } from 'date-fns'
import { tz } from '@date-fns/tz'

// Singapore is the system time zone
const sgDate = new Date(2024, 8, 7, 6, 5, 4)
//=> 'Wed Sep 07 2024 06:05:04 GMT+0800'

// Transpose to Los Angeles
const laDate = transpose(sgDate, tz('America/Los_Angeles'))
//=> 'Wed Sep 07 2024 06:05:04 GMT-0700'

// Transpose back to system timezone
const systemDate = transpose(laDate, Date)
//=> 'Wed Sep 07 2024 06:05:04 GMT+0800'
```

---

## Internationalization (i18n)

### Using Locales

```javascript
import { format, formatDistance } from 'date-fns'
import { es, ru, ja } from 'date-fns/locale'

// Spanish
format(new Date(2025, 0, 15), 'EEEE d MMMM yyyy', { locale: es })
//=> 'miércoles 15 enero 2025'

// Russian
formatDistance(subDays(new Date(), 3), new Date(), {
  addSuffix: true,
  locale: ru,
})
//=> '3 дня назад'

// Japanese
format(new Date(), 'PPP', { locale: ja })
//=> '2025年10月21日'
```

### Custom Locale Wrapper

```javascript
import { format } from 'date-fns'
import { enGB, eo, ru } from 'date-fns/locale'

const locales = { enGB, eo, ru }

export default function formatWithLocale(date, formatStr = 'PP') {
  return format(date, formatStr, {
    locale: locales[window.__localeId__],
  })
}

// Usage
window.__localeId__ = 'enGB'
formatWithLocale(new Date(), 'EEEE d')
//=> 'Friday 13'

window.__localeId__ = 'eo'
formatWithLocale(new Date(), 'EEEE d')
//=> 'vendredo 13'
```

---

## Utility Functions

### Round Dates

```javascript
import { roundToNearestMinutes, roundToNearestHours } from 'date-fns'

roundToNearestMinutes(new Date(2025, 0, 1, 10, 23), { nearestTo: 15 })
//=> Wed Jan 01 2025 10:15:00

roundToNearestHours(new Date(2025, 0, 1, 10, 40))
//=> Wed Jan 01 2025 11:00:00
```

### Get Week/Quarter Info

```javascript
import {
  getWeek,
  getWeekOfMonth,
  getQuarter,
  getDaysInMonth,
} from 'date-fns'

getWeek(new Date(2025, 0, 15))
//=> 3

getQuarter(new Date(2025, 3, 1))
//=> 2

getDaysInMonth(new Date(2025, 1))
//=> 28 (or 29 for leap years)
```

---

## Common Patterns

### Age Calculator

```javascript
import { differenceInYears } from 'date-fns'

function calculateAge(birthDate) {
  return differenceInYears(new Date(), birthDate)
}

calculateAge(new Date(1990, 0, 1))
//=> 35
```

### Date Range Generator

```javascript
import { eachDayOfInterval, addDays } from 'date-fns'

const start = new Date(2025, 0, 1)
const end = addDays(start, 7)

const days = eachDayOfInterval({ start, end })
//=> Array of 8 dates from Jan 1-8
```

### Week Calendar

```javascript
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

function getWeekDays(date) {
  return eachDayOfInterval({
    start: startOfWeek(date),
    end: endOfWeek(date),
  })
}

getWeekDays(new Date())
//=> Array of 7 dates for current week
```

---

## Best Practices

1. **Use specific functions** - Import only what you need for tree-shaking
2. **Avoid mutating dates** - date-fns functions are pure and return new dates
3. **Use Unicode tokens correctly** - `yyyy-MM-dd` not `YYYY-MM-DD`
4. **Consider timezones** - Use @date-fns/tz for timezone-aware operations
5. **Localize when needed** - Import locales for international apps
6. **Use constants** - date-fns exports `millisecondsInDay`, `daysInWeek`, etc.

---

## Unicode Tokens Reference

**Correct Usage:**

- `yyyy` - Calendar year (2025)
- `MM` - Month (01-12)
- `dd` - Day of month (01-31)
- `HH` - Hour (00-23)
- `mm` - Minute (00-59)
- `ss` - Second (00-59)

**Common Mistakes:**

```javascript
// ❌ Wrong - uses day of year instead of day of month
format(new Date(), 'YYYY-MM-DD')

// ✅ Correct
format(new Date(), 'yyyy-MM-dd')
```

---

## Resources

- **Official Docs:** https://date-fns.org/docs
- **GitHub:** https://github.com/date-fns/date-fns
- **Format Reference:** https://date-fns.org/docs/format
- **Timezone Package:** https://github.com/date-fns/tz
