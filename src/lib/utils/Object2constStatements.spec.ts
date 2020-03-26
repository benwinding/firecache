import { Object2constStatements } from "./Object2constStatements";

describe("Testing the Object2constStatements function", () => {
  test("simple test", () => {
    const result = Object2constStatements({ a: 1 });
    expect(result).toBe(`var a = "1";`);
  });

  test("multiple expressions", () => {
    const result = Object2constStatements({ a: 1, b: 2, c: 'ok' });
    expect(result).toBe(`var a = "1";var b = "2";var c = "ok";`);
  });

  test("Evaluating expressions", () => {
    const result = Object2constStatements({ a: 1, b: 2, c: "SOMETHING" });
    var a, b, c;
    eval(result);
    expect(a).toBe("1");
    expect(b).toBe("2");
    expect(c).toBe("SOMETHING");
  });
});
