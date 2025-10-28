
export interface BlockTypeInput {
  user_id: string;
  name: string;
  color: string;
  default_duration_minutes: number;
  pomodoro_focus_minutes?: number;
  pomodoro_short_break_minutes?: number;
  pomodoro_long_break_minutes?: number;
  pomodoro_sessions_before_long_break?: number;
  recurring_enabled?: boolean;
  recurring_days_of_week?: number[];
  recurring_time_of_day?: string | null;
  recurring_auto_create?: boolean;
  recurring_weeks_in_advance?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function validateBlockTypeInput(input: BlockTypeInput): ValidationResult {
  const errors: string[] = [];

  if (!input.user_id) errors.push('user_id is required');
  if (!input.name || input.name.trim().length === 0) errors.push('name is required');
  if (!input.color || !HEX_COLOR_RE.test(input.color)) errors.push('color must be a hex color (e.g., #3366FF)');
  if (!Number.isFinite(input.default_duration_minutes) || input.default_duration_minutes <= 0) {
    errors.push('default_duration_minutes must be a positive number');
  }

  const pom = input.pomodoro_focus_minutes;
  if (pom != null && (!Number.isFinite(pom) || pom <= 0)) {
    errors.push('pomodoro_focus_minutes must be positive if provided');
  }

  const sb = input.pomodoro_short_break_minutes;
  if (sb != null && (!Number.isFinite(sb) || sb <= 0)) {
    errors.push('pomodoro_short_break_minutes must be positive if provided');
  }

  const lb = input.pomodoro_long_break_minutes;
  if (lb != null && (!Number.isFinite(lb) || lb <= 0)) {
    errors.push('pomodoro_long_break_minutes must be positive if provided');
  }

  const sessions = input.pomodoro_sessions_before_long_break;
  if (sessions != null && (!Number.isInteger(sessions) || sessions <= 0)) {
    errors.push('pomodoro_sessions_before_long_break must be a positive integer if provided');
  }

  const weeks = input.recurring_weeks_in_advance;
  if (weeks != null && (!Number.isInteger(weeks) || weeks <= 0)) {
    errors.push('recurring_weeks_in_advance must be a positive integer if provided');
  }

  if (Array.isArray(input.recurring_days_of_week)) {
    for (const d of input.recurring_days_of_week) {
      if (!Number.isInteger(d) || d < 0 || d > 6) {
        errors.push('recurring_days_of_week must contain integers 0..6 (Sun..Sat)');
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
