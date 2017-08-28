import { EsDatePickerPage } from './app.po';

describe('es-date-picker App', () => {
  let page: EsDatePickerPage;

  beforeEach(() => {
    page = new EsDatePickerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
