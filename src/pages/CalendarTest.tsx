import { CalendarDemo } from '@/components/calendar';

/**
 * CalendarTest page - Tests react-big-calendar integration
 * This page demonstrates that react-big-calendar is properly installed
 * and configured with the date-fns localizer.
 */
export function CalendarTest() {
  return (
    <div className="h-screen w-full overflow-auto bg-gray-50">
      <CalendarDemo />
    </div>
  );
}

export default CalendarTest;
