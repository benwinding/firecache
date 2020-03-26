export function getWithoutUndefined<T>(obj: T) {
  try {
    const objParsed = JSON.parse(JSON.stringify(obj));
    return objParsed;
  } catch (error) {
    console.error(error, { obj });
  }
}
