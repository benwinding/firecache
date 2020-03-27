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
});

function makeTimestamp() {
  return new MockTimeStamp();
}

class MockTimeStamp {
  toDate() {
    return new Date();
  }
}
