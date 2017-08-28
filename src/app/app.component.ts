import { Component } from '@angular/core';
import {IMyDpOptions} from './../assets/js/my-date-picker/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  heading = 'WCAG 2.0 AA Compliant - Date Picker';

  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd.mm.yyyy'
  };

  // Initialized to specific date (09.10.2018).
  public model: Object = { date: { year: 2018, month: 10, day: 9 } };

  constructor() {

  }

}
