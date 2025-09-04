export const constants = {
  dtFormat: 'dd-MMM-yyyy',
  dateTimePickerFormat: 'DD-MMM-YYYY',
  timeFormat: 'hh:mm a'
};

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: constants.dateTimePickerFormat
  },
  display: {
    dateInput: constants.dateTimePickerFormat,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};