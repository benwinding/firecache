export function parseAllDatesDoc<T>(obj: T) {
  const isObject = !!obj && typeof obj === 'object';
  if (!isObject) {
    return;
  }
  Object.keys(obj).map(key => {
    const value = obj[key];
    obj[key] = getDate(value);
  });
}

function getDate(inputVal): Date {
  if (inputVal && inputVal.toDate) {
    return inputVal.toDate();
  }
  if (inputVal instanceof Date) {
    return inputVal;
  }
  return inputVal;
}
