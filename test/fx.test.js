import { fxapp } from "../src";

test("ignore empty fx", () => {
  const main = fxapp({
    actions: {
      invalid: () => []
    }
  });
  expect(main.invalid()).toEqual([]);
});

test("throw for invalid fx", () =>
  expect(() =>
    fxapp({
      actions: {
        invalid: () => ["invalid"]
      }
    }).invalid()
  ).toThrow("no such fx type: invalid"));
