export enum DateStringType {
  YEAR_MONTH_DATE,
  MONTH_DATE_YEAR,
  MONTH_DATE,
}

export function dateToString(date: Date, options: { type: DateStringType; time: boolean }): string {
  let ret: string = '';

  switch (options.type) {
    case DateStringType.YEAR_MONTH_DATE:
      ret = `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}`;
      break;
    case DateStringType.MONTH_DATE_YEAR:
      ret = `${date.getMonth()}.${date.getDate()}.${date.getFullYear()}`;
      break;
    default:
      ret = `${date.getMonth()}.${date.getDate()}`;
  }

  if (options.time)
    ret += ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  return ret;
}
