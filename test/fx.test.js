import { fxapp } from "../src";

const invalidFx = ["invalid", { ignore: "me" }];

test("ignore empty fx", () => {
  const actions = fxapp({
    actions: {
      invalid: () => []
    }
  });
  expect(actions.invalid()).toEqual([]);
});

test("ignore invalid fx", () => {
  const actions = fxapp({
    actions: {
      invalid: () => invalidFx
    }
  });
  expect(actions.invalid()).toEqual(invalidFx);
});
