import { IMyDate } from './my-date.interface';
import { IMyMarkedDate } from './my-marked-date.interface';

export interface IMyCalendarDay {
    dateObj: IMyDate;
    cmo: number;
    currDay: boolean;
    weekDay: string;
    disabled: boolean;
    markedDate: IMyMarkedDate;
    highlight: boolean;
}
