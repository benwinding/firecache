export function IsRefDoc(obj: any) {
  const isRefDoc =
    !!obj &&
    typeof obj === "object" &&
    obj.id &&
    obj.path &&
    obj.parent &&
    obj.firestore;
  return isRefDoc;
}
