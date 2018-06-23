const { makeStateAtom, getState } = require("../src/stateAtom");

describe("makeStateAtom", () => {
  it("should be a function", () => {
    expect(makeStateAtom).toBeInstanceOf(Function);
  });
  describe("without initial state", () => {
    it("should return a function", () => {
      expect(makeStateAtom()).toBeInstanceOf(Function);
    });
    it("should return state with identity action", () => {
      const atom = makeStateAtom();
      expect(atom(getState)).toEqual({});
    });
    it("should update state when atoming functions", () => {
      const atom = makeStateAtom();
      atom(() => ({ key: "value" }));
      expect(atom(getState)).toEqual({ key: "value" });
    });
    it("should not update state when atoming objects but the object should be returned", () => {
      const atom = makeStateAtom();
      expect(atom({ key: "value" })).toEqual({ key: "value" });
      expect(atom(getState)).toEqual({});
    });
  });
  describe("with an initial state", () => {
    it("should return a function", () => {
      expect(makeStateAtom()).toBeInstanceOf(Function);
    });
    it("should return state with identity action", () => {
      const atom = makeStateAtom({ count: 0 });
      expect(atom(getState)).toEqual({ count: 0 });
    });
    it("should update state when atoming functions", () => {
      const atom = makeStateAtom({ count: 0 });
      atom(state => ({ count: state.count + 1 }));
      expect(atom(getState)).toEqual({ count: 1 });
    });
    it("should not update state when atoming objects but the object should be returned", () => {
      const atom = makeStateAtom({ count: 0 });
      expect(atom({ count: 1 })).toEqual({ count: 1 });
      expect(atom(getState)).toEqual({ count: 0 });
    });
  });
});
