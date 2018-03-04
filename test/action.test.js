import { fxapp } from "../src";

test("run action fx", done => {
  const main = fxapp({
    state: {
      value: 0
    },
    actions: {
      foo: fx => fx.action("bar", { some: "data" }),
      bar: fx => {
        expect(fx.data).toEqual({ some: "data" });
        expect(fx.get()).toEqual({ value: 0 });
        done();
      }
    }
  });

  expect(main.foo()).toEqual([
    "action",
    {
      path: "bar",
      data: { some: "data" }
    }
  ]);
});

test("run multiple action fx", done =>
  fxapp({
    state: {
      value: 0
    },
    actions: {
      foo: fx => [
        fx.action("bar", { some: "data" }),
        fx.action("baz", { other: "data" })
      ],
      bar: fx => {
        expect(fx.data).toEqual({ some: "data" });
        expect(fx.get()).toEqual({ value: 0 });
      },
      baz: fx => {
        expect(fx.data).toEqual({ other: "data" });
        expect(fx.get()).toEqual({ value: 0 });
        done();
      }
    }
  }).foo());

test("run slice action fx", done =>
  fxapp({
    actions: {
      foo: fx => fx.action("bar.baz", { some: "data" }),
      bar: {
        baz: fx => {
          expect(fx.data).toEqual({ some: "data" });
          done();
        }
      }
    }
  }).foo());

test("run slice action fx outside of current namespace", done =>
  fxapp({
    actions: {
      foo: {
        bar: {
          baz: fx => fx.action(".fizz.buzz", { some: "data" })
        }
      },
      fizz: {
        buzz: fx => {
          expect(fx.data).toEqual({ some: "data" });
          done();
        }
      }
    }
  }).foo.bar.baz());
