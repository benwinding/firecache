import { getWithoutUndefined } from "./undefined-parser";

describe("timestamp-parser tests", () => {
  test("retains number", () => {
    const doc = { a: 1 };
    const parsed = getWithoutUndefined(doc);
    expect(parsed.a).toBe(1);
  });

  test("retains string", () => {
    const doc = { a: "1" };
    const parsed = getWithoutUndefined(doc);
    expect(parsed.a).toBe("1");
  });

  test("retains boolean", () => {
    const doc = { a: true };
    const parsed = getWithoutUndefined(doc);
    expect(parsed.a).toBe(true);
  });

  test("retains object", () => {
    const doc = { a: { f: "1" } };
    const parsed = getWithoutUndefined(doc);
    expect(parsed.a.f).toBe("1");
  });

  test("converts undefined simple", () => {
    const doc = { a: undefined };
    const parsed = getWithoutUndefined(doc);
    expect(parsed).toMatchObject({});
  });

  test("converts undefined from array", () => {
    const doc = { a: [ undefined ] };
    const parsed = getWithoutUndefined(doc);
    expect(parsed).toMatchObject({a: []});
  });

  test("converts complex object", () => {
    const doc = { a: [ undefined, { b: 0, c: '', d: undefined } ] };
    const parsed = getWithoutUndefined(doc);
    expect(parsed).toMatchObject({a: [{b: 0,c: ''}]});
  });

  test("converts circular referencing objects", () => {
    const a = {
      array: [undefined]
    }
    const b = {
      c: 'A string',
      a: a
    }
    a.array.push(b);
    const doc = { a: a };
    expect(() => getWithoutUndefined(doc)).not.toThrow();
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
