import { parseAllDatesDoc } from "./timestamp-parser";

describe("timestamp-parser tests", () => {
  test("retains number", () => {
    const doc = { a: 1 };
    parseAllDatesDoc(doc);
    expect(doc.a).toBe(1);
  });

  test("retains string", () => {
    const doc = { a: "1" };
    parseAllDatesDoc(doc);
    expect(doc.a).toBe("1");
  });

  test("retains object", () => {
    const doc = { a: { f: "1" } };
    parseAllDatesDoc(doc);
    expect(doc.a.f).toBe("1");
  });

  test("converts timestamp simple", () => {
    const doc = { a: makeTimestamp() };
    parseAllDatesDoc(doc);
    expect(doc.a).toBeInstanceOf(Date);
  });

  test("converts timestamp nested", () => {
    const doc = { a: { b: makeTimestamp(), c: { d: makeTimestamp() } } };
    parseAllDatesDoc(doc);
    expect(doc.a.b).toBeInstanceOf(Date);
    expect(doc.a.c.d).toBeInstanceOf(Date);
  });

  test("converts timestamp array", () => {
    const doc = { a: { c: [makeTimestamp(), makeTimestamp()] } };
    parseAllDatesDoc(doc);
    expect(doc.a.c[0]).toBeInstanceOf(Date);
    expect(doc.a.c[1]).toBeInstanceOf(Date);
  });

  test("converts timestamp array", () => {
    const doc = { a: { c: [{ d: makeTimestamp() }] } };
    parseAllDatesDoc(doc);
    expect(doc.a.c[0].d).toBeInstanceOf(Date);
  });
});

function makeTimestamp() {
  return new MockTimeStamp();
}

class MockTimeStamp {
  toDate() {
    return new Date();
  }
}
