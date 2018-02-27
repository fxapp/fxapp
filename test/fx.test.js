import { fxapp } from "../src";

test("ignore invalid fx", done => {
  const actions = fxapp({
    actions: {
      start: () => ["invalid", { ignore: "me" }],
      stop: () => done()
    }
  });
  actions.start();
  actions.stop();
});
