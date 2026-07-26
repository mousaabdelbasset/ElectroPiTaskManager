import { Injectable, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class DateFormatterService {
  private readonly language = inject(LanguageService);

  format(value: string): string {
    return new Intl.DateTimeFormat(this.language.current(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  }

  toDateInput(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    const pad = (part: number): string => part.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  localDayStartInput(daysFromToday = 0): string {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + daysFromToday);
    return this.toDateInput(date);
  }

  isOverdue(value: string): boolean {
    return new Date(value).getTime() < Date.now();
  }
}
