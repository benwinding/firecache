export function getWithoutUndefined<T>(obj: T) {
  try {
    recusivelyCheckObjectValueForUndefined(obj, 0);
    return obj;
  } catch (error) {
    console.error(error, { obj });
  }
}

const RECURSION_LIMIT = 15;

function recusivelyCheckObjectValueForUndefined(obj: any, level: number): any {
  if (level >= RECURSION_LIMIT) {
    return;
  }
  if (!obj) {
    return;
  }
  if (Array.isArray(obj)) {
    const arr = obj as [];
    const indexesToRemove = [];
    arr.map((val, index) => {
      if (val === undefined) {
        indexesToRemove.push(index);
      } else {
        recusivelyCheckObjectValueForUndefined(val, level+1);
      }
    })
    indexesToRemove.map(i => arr.splice(i, 1));
    return;
  }
  const isObject = typeof obj === 'object';
  if (isObject) {
    const keysToRemove = [];
    Object.entries(obj).map(([key, value]) => {
      if (value === undefined) {
        keysToRemove.push(key);
      } else {
        recusivelyCheckObjectValueForUndefined(value, level+1);
      }
    })
    keysToRemove.map(k => delete obj[k]);
    return;
  }
}
