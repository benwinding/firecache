import { parseDocGetAllRefs } from "./docref-parser";

describe("docref-parser tests", () => {

  test("finds toplevel document reference", () => {
    const doc = {
      test: 1,
      test_ref: makeMockDocRef('some/path')
    };
    const parsedRefs = parseDocGetAllRefs(doc);
    expect(parsedRefs.length).toBe(1);
  });
  test("finds nested document reference", () => {
    const doc = {
      test: 1,
      child: {
        another_child: {
          test_ref: makeMockDocRef('my/path')
        }
      }
    };
    const parsedRefs = parseDocGetAllRefs(doc);
    expect(parsedRefs.length).toBe(1);
    expect(parsedRefs[0].docRefPath).toBe('my/path');
  });
});

function makeMockDocRef(docRefPath: string) {
  const ref = new MockDocumentRef();
  ref.path = docRefPath;
  return ref;
}

class MockDocumentRef {
  path = 'somepath'
  id = 'somepath'
  parent = {}
  firestore = {}
}
