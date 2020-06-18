const { isFn, isArray, isFx, isObj, isPropsTuple, assign } = require("./utils");

const makeQueue = (queue = []) => ({
  enqueue: queue.push.bind(queue),
  dequeue: queue.shift.bind(queue),
  clear: () => (queue.length = 0),
  notEmpty: () => queue.length > 0
});

module.exports = ({
  state: initialState = {},
  mergeState = (prevState, nextState) => nextState,
  mapProps = props => props
} = {}) => {
  const concurrentFxWithPropsWaiting = new Set();
  const concurrentFxRunning = new Set();
  const serialFxWithPropsQueue = makeQueue();
  const afterFxWithPropsQueue = makeQueue();
  const runningFx = new Set();
  let state = initialState;

  const runFxWithProps = ([fx, dispatchProps]) => {
    if (isFn(fx)) {
      dispatch(fx(state, dispatchProps));
      process.nextTick(fxLoop);
      return Promise.resolve();
    }
    const dispatchProxy = (dispatched, props) => {
      if (runningFx.has(fx)) {
        dispatch(dispatched, props);
      }
    };
    const runtimeProps = mapProps(
      assign(fx, dispatchProps, { dispatch: dispatchProxy })
    );
    runningFx.add(fx);

    const fxPromise = fx.run(runtimeProps) || Promise.resolve();
    return new Promise(resolve => {
      const done = () => {
        runningFx.delete(fx);
        if (runtimeProps.cancel) {
          runningFx.clear();
          concurrentFxWithPropsWaiting.clear();
          serialFxWithPropsQueue.clear();
        }
        process.nextTick(fxLoop);
        resolve();
      };
      fxPromise.then(done).catch(done);
    });
  };

  const fxLoop = () => {
    for (const fxWithProps of concurrentFxWithPropsWaiting) {
      const [concurrentFx] = fxWithProps;
      concurrentFxWithPropsWaiting.delete(fxWithProps);
      runFxWithProps(fxWithProps).then(() => {
        concurrentFxRunning.delete(concurrentFx);
      });
      concurrentFxRunning.add(concurrentFx);
    }
    if (concurrentFxRunning.size === 0 && runningFx.size === 0) {
      if (serialFxWithPropsQueue.notEmpty()) {
        runFxWithProps(serialFxWithPropsQueue.dequeue());
      } else if (afterFxWithPropsQueue.notEmpty()) {
        runFxWithProps(afterFxWithPropsQueue.dequeue());
      }
    }
  };

  const dispatch = (dispatched, props) => {
    if (isFn(dispatched)) {
      serialFxWithPropsQueue.enqueue([dispatched, props]);
      process.nextTick(fxLoop);
    } else if (isArray(dispatched)) {
      if (isPropsTuple(dispatched)) {
        dispatch(dispatched[0], dispatched[1]);
      } else {
        dispatched.forEach(dispatch);
      }
    } else if (isFx(dispatched)) {
      if (dispatched.cancel) {
        runFxWithProps([dispatched, props]);
      } else if (dispatched.concurrent) {
        concurrentFxWithPropsWaiting.add([dispatched, props]);
      } else if (dispatched.after) {
        afterFxWithPropsQueue.enqueue([dispatched, props]);
      } else {
        serialFxWithPropsQueue.enqueue([dispatched, props]);
      }
      process.nextTick(fxLoop);
    } else if (isObj(dispatched)) {
      state = mergeState(state, dispatched);
    }
  };

  return { dispatch, getState: () => state };
};
