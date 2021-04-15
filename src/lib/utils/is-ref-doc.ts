export function IsRefDoc(obj: any) {
  const isRefDoc =
    !!obj &&
    obj.hasOwnProperty("id") &&
    obj.hasOwnProperty("path") &&
    obj.hasOwnProperty("parent") && obj.hasOwnProperty('firestore');
  return isRefDoc;
}
