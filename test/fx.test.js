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

test("ignore invalid fx", () => {
  const main = fxapp({
    actions: {
      invalid: () => invalidFx
    }
  });
  expect(main.invalid()).toEqual(invalidFx);
});
