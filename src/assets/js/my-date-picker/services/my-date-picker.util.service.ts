import {Injectable} from '@angular/core';
import {IMyDate} from '../interfaces/my-date.interface';
import {IMyDateRange} from '../interfaces/my-date-range.interface';
import {IMyMonth} from '../interfaces/my-month.interface';
import {IMyMonthLabels} from '../interfaces/my-month-labels.interface';
import {IMyMonthLabelsFull} from '../interfaces/my-month-labels-full.interface';
import {IMyMarkedDates} from '../interfaces/my-marked-dates.interface';
import {IMyMarkedDate} from '../interfaces/my-marked-date.interface';

const M = 'm';
const MM = 'mm';
const MMM = 'mmm';
const DD = 'dd';
const YYYY = 'yyyy';

@Injectable()
export class UtilService {
  weekDays: Array<string> = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  weekDaysFull: Array<string> = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

  isDateValid(dateStr: string, dateFormat: string, minYear: number, maxYear: number, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableWeekDays: Array<string>, disableDays: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, monthLabels: IMyMonthLabels, monthLabelsFull: IMyMonthLabelsFull, enableDays: Array<IMyDate>): IMyDate {
    let returnDate: IMyDate = {day: 0, month: 0, year: 0};
    let daysInMonth: Array<number> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let isMonthStr: boolean = dateFormat.indexOf(MMM) !== -1;
    let separators: Array<string> = this.getDateFormatSeparators(dateFormat);

    let month: number = isMonthStr ? this.parseDatePartMonthName(dateFormat, dateStr, MMM, monthLabels) : this.parseDatePartNumber(dateFormat, dateStr, MM);
    if (isMonthStr && monthLabels[month]) {
      dateFormat = this.changeDateFormat(dateFormat, monthLabels[month].length);
    }
    if (dateStr.length !== dateFormat.length) {
      return returnDate;
    }
    if (dateFormat.indexOf(separators[0]) !== dateStr.indexOf(separators[0]) || dateFormat.lastIndexOf(separators[1]) !== dateStr.lastIndexOf(separators[1])) {
      return returnDate;
    }
    const day: number = this.parseDatePartNumber(dateFormat, dateStr, DD)
    const year: number = this.parseDatePartNumber(dateFormat, dateStr, YYYY);;

    if (month !== -1 && day !== -1 && year !== -1) {
      if (year < minYear || year > maxYear || month < 1 || month > 12) {
        return returnDate;
      }

      const date: IMyDate = {year: year, month: month, day: day};

      if (this.isDisabledDay(date, minYear, maxYear, disableUntil, disableSince, disableWeekends, disableWeekDays, disableDays, disableDateRanges, enableDays)) {
        return returnDate;
      }

      if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
        daysInMonth[1] = 29;
      }

      if (day < 1 || day > daysInMonth[month - 1]) {
        return returnDate;
      }

      // Valid date
      return date;
    }
    return returnDate;
  }

  getDateFormatSeparators(dateFormat: string): Array<string> {
    return dateFormat.match(/[^(dmy)]{1,}/g);
  }

  changeDateFormat(dateFormat: string, len: number): string {
    let mp = '';
    for (let i = 0; i < len; i++) {
      mp += M;
    }
    return dateFormat.replace(MMM, mp);
  }

  isMonthLabelValid(monthLabel: string, monthLabels: IMyMonthLabels): number {
    for (let key = 1; key <= 12; key++) {
      if (monthLabel.toLowerCase() === monthLabels[key].toLowerCase()) {
        return key;
      }
    }
    return -1;
  }

  isYearLabelValid(yearLabel: number, minYear: number, maxYear: number): number {
    if (yearLabel >= minYear && yearLabel <= maxYear) {
      return yearLabel;
    }
    return -1;
  }

  parseDatePartNumber(dateFormat: string, dateString: string, datePart: string): number {
    const pos: number = this.getDatePartIndex(dateFormat, datePart);
    if (pos !== -1) {
      const value: string = dateString.substring(pos, pos + datePart.length);
      if (!/^\d+$/.test(value)) {
        return -1;
      }
      return parseInt(value);
    }
    return -1;
  }

  parseDatePartMonthName(dateFormat: string, dateString: string, datePart: string, monthLabels: IMyMonthLabels): number {
    let monthLabel = '';
    const start: number = dateFormat.indexOf(datePart);
    if (dateFormat.substr(dateFormat.length - 3) === MMM) {
      monthLabel = dateString.substring(start);
    }  else {
      const end: number = dateString.indexOf(dateFormat.charAt(start + datePart.length), start);
      monthLabel = dateString.substring(start, end);
    }
    return this.isMonthLabelValid(monthLabel, monthLabels);
  }

  getDatePartIndex(dateFormat: string, datePart: string): number {
    return dateFormat.indexOf(datePart);
  }

  parseDefaultMonth(monthString: string): IMyMonth {
    const month: IMyMonth = {monthTxt: '', monthTxtFull: '', monthNbr: 0, year: 0};
    if (monthString !== '') {
      const split = monthString.split(monthString.match(/[^0-9]/)[0]);
      month.monthNbr = split[0].length === 2 ? parseInt(split[0]) : parseInt(split[1]);
      month.year = split[0].length === 2 ? parseInt(split[1]) : parseInt(split[0]);
    }
    return month;
  }

  isDisabledDay(date: IMyDate, minYear: number, maxYear: number, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableWeekDays: Array<string>, disableDays: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, enableDays: Array<IMyDate>): boolean {
    for (const e of enableDays) {
      if (e.year === date.year && e.month === date.month && e.day === date.day) {
        return false;
      }
    }

    const dn = this.getDayNumber(date);

    if (date.year < minYear && date.month === 12 || date.year > maxYear && date.month === 1) {
      return true;
    }

    const dateMs: number = this.getTimeInMilliseconds(date);
    if (this.isInitializedDate(disableUntil) && dateMs <= this.getTimeInMilliseconds(disableUntil)) {
      return true;
    }

    if (this.isInitializedDate(disableSince) && dateMs >= this.getTimeInMilliseconds(disableSince)) {
      return true;
    }

    if (disableWeekends) {
      if (dn === 0 || dn === 6) {
        return true;
      }
    }

    if (disableWeekDays.length > 0) {
      for (const wd of disableWeekDays) {
        if (dn === this.getWeekdayIndex(wd)) {
          return true;
        }
      }
    }

    for (const d of disableDays) {
      if (d.year === date.year && d.month === date.month && d.day === date.day) {
        return true;
      }
    }

    for (const d of disableDateRanges) {
      if (this.isInitializedDate(d.begin) && this.isInitializedDate(d.end) && dateMs >= this.getTimeInMilliseconds(d.begin) && dateMs <= this.getTimeInMilliseconds(d.end)) {
        return true;
      }
    }
    return false;
  }

  isMarkedDate(date: IMyDate, markedDates: Array<IMyMarkedDates>, markWeekends: IMyMarkedDate): IMyMarkedDate {
    for (const md of markedDates) {
      for (const d of md.dates) {
        if (d.year === date.year && d.month === date.month && d.day === date.day) {
          return {marked: true, color: md.color};
        }
      }
    }
    if (markWeekends && markWeekends.marked) {
      const dayNbr = this.getDayNumber(date);
      if (dayNbr === 0 || dayNbr === 6) {
        return {marked: true, color: markWeekends.color};
      }
    }
    return {marked: false, color: ''};
  }

  isHighlightedDate(date: IMyDate, sunHighlight: boolean, satHighlight: boolean, highlightDates: Array<IMyDate>): boolean {
    const dayNbr: number = this.getDayNumber(date);
    if (sunHighlight && dayNbr === 0 || satHighlight && dayNbr === 6) {
      return true;
    }
    for (const d of highlightDates) {
      if (d.year === date.year && d.month === date.month && d.day === date.day) {
        return true;
      }
    }
    return false;
  }

  getWeekNumber(date: IMyDate): number {
    const d: Date = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    d.setDate(d.getDate() + (d.getDay() === 0 ? -3 : 4 - d.getDay()));
    return Math.round(((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000) / 7) + 1;
  }

  isMonthDisabledByDisableUntil(date: IMyDate, disableUntil: IMyDate): boolean {
    return this.isInitializedDate(disableUntil) && this.getTimeInMilliseconds(date) <= this.getTimeInMilliseconds(disableUntil);
  }

  isMonthDisabledByDisableSince(date: IMyDate, disableSince: IMyDate): boolean {
    return this.isInitializedDate(disableSince) && this.getTimeInMilliseconds(date) >= this.getTimeInMilliseconds(disableSince);
  }

  isInitializedDate(date: IMyDate): boolean {
    return date.year !== 0 && date.month !== 0 && date.day !== 0;
  }

  isSameDate(d1: IMyDate, d2: IMyDate): boolean {
    return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
  }

  getTimeInMilliseconds(date: IMyDate): number {
    return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getTime();
  }

  getDayNumber(date: IMyDate): number {
    const d: Date = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    return d.getDay();
  }

  getWeekDays(): Array<string> {
    return this.weekDays;
  }

  getWeekDaysFull(): Array<string> {
    return this.weekDaysFull;
  }

  getWeekdayIndex(wd: string) {
    return this.weekDays.indexOf(wd);
  }
  getWeekdayFullIndex(wd: string) {
    return this.weekDaysFull.indexOf(wd);
  }
}
