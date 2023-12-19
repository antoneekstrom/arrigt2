export function oneWeekAgo(date = new Date(Date.now())) {
  return new Date(date.getTime() - 1000 * 60 * 60 * 24 * 7);
}

export function oneDayAgo(date = new Date(Date.now())) {
  return new Date(date.getTime() - 1000 * 60 * 60 * 24);
}

export function now(date = new Date(Date.now())) {
  return new Date(date.getTime());
}

export function inOneDay(date = new Date(Date.now())) {
  return new Date(date.getTime() + 1000 * 60 * 60 * 24);
}

export function inTwoDays(date = new Date(Date.now())) {
  return new Date(date.getTime() + 1000 * 60 * 60 * 24 * 2);
}

export function inOneWeek(date = new Date(Date.now())) {
  return new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7);
}

export function inFourWeeks(date = new Date(Date.now())) {
  return new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7 * 4);
}
