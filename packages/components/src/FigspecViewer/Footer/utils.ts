const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
const intervals = [
  { gte: YEAR, divisor: YEAR, unit: "year" },
  { gte: MONTH, divisor: MONTH, unit: "month" },
  { gte: WEEK, divisor: WEEK, unit: "week" },
  { gte: DAY, divisor: DAY, unit: "day" },
  { gte: HOUR, divisor: HOUR, unit: "hour" },
  { gte: MINUTE, divisor: MINUTE, unit: "minute" },
  { gte: 30 * SECOND, divisor: SECOND, unit: "seconds" },
  { gte: 0, divisor: 1, text: "just now" },
];

const getTime = (targetDate: Date | number | string) => {
  const date =
    typeof targetDate === "object"
      ? (targetDate as Date)
      : new Date(targetDate);
  return date.getTime();
};

/**
 * Receives two dates to compare and returns "time ago" based on them
 * example: 4 weeks ago
 *
 * Heavily inspired by https://stackoverflow.com/a/67338038/938822
 */
export const fromNow = (
  date: Date | number | string,
  nowDate: Date | number | string = Date.now(),
  rft = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
) => {
  const now = getTime(nowDate);
  const diff = now - getTime(date);
  const diffAbs = Math.abs(diff);

  for (const interval of intervals) {
    if (diffAbs >= interval.gte) {
      const x = Math.round(Math.abs(diff) / interval.divisor);
      const isInFuture = diff < 0;
      const intervalUnit = interval.unit as Intl.RelativeTimeFormatUnit;
      return intervalUnit
        ? rft.format(isInFuture ? x : -x, intervalUnit)
        : interval.text;
    }
  }
};
