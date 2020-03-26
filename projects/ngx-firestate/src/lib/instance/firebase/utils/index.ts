export function getWithoutUndefined<T>(obj: T) {
  try {
    const objParsed = JSON.parse(JSON.stringify(obj));
    return objParsed;
  } catch (error) {
    console.error(error, { obj });
  }
}

export function parseAllDatesDoc<T>(obj: T) {
  const isObject = !!obj && typeof obj === 'object';
  if (!isObject) {
    return;
  }
  Object.keys(obj).map(key => {
    const value = obj[key];
    obj[key] = recusivelyCheckObjectValue(value);
  });
}

function recusivelyCheckObjectValue(input: any) {
  const isFalsey = !input;
  if (isFalsey) {
    return input;
  }
  const isString = typeof input === 'string';
  if (isString) {
    return input;
  }
  const isTimestamp = !!input.toDate && typeof input.toDate === 'function';
  if (isTimestamp) {
    return input.toDate();
  }
  const isObject = typeof input === 'object';
  if (isObject) {
    Object.keys(input).map(key => {
      const value = input[key];
      input[key] = recusivelyCheckObjectValue(value);
    });
    return input;
  }
  const isArray = Array.isArray(input);
  if (isArray) {
    return input.map(value => recusivelyCheckObjectValue(value));
  }
}
