import { fxapp } from "../src";

const invalidFx = ["invalid", { ignore: "me" }];

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
        invalid: () => invalidFx
      }
    }).invalid()
  ).toThrow("no such fx type: invalid"));
