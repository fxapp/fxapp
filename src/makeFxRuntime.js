const { isFn, isArray, isFx, isObj } = require("./utils");

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
  const concurrentFxWaiting = new Set();
  const concurrentFxRunning = new Set();
  const serialFxQueue = makeQueue();
  const afterFxQueue = makeQueue();
  const runningFx = new Set();
  let state = initialState;

  const runFx = fx => {
    const props = mapProps(fx.props || {});
    runningFx.add(fx);
    const dispatchProxy = dispatched => {
      if (runningFx.has(fx)) {
        dispatch(dispatched);
      }
    };
    const fxPromise = fx.run(dispatchProxy, props) || Promise.resolve();
    return new Promise(resolve => {
      const done = () => {
        runningFx.delete(fx);
        if (props.cancel) {
          runningFx.clear();
          concurrentFxWaiting.clear();
          serialFxQueue.clear();
        }
        process.nextTick(fxLoop);
        resolve();
      };
      fxPromise.then(done).catch(done);
    });
  };

  const fxLoop = () => {
    for (const fx of concurrentFxWaiting) {
      concurrentFxWaiting.delete(fx);
      runFx(fx).then(() => {
        concurrentFxRunning.delete(fx);
      });
      concurrentFxRunning.add(fx);
    }
    if (concurrentFxRunning.size === 0 && runningFx.size === 0) {
      if (serialFxQueue.notEmpty()) {
        runFx(serialFxQueue.dequeue());
      } else if (afterFxQueue.notEmpty()) {
        runFx(afterFxQueue.dequeue());
      }
    }
  };

  const dispatch = dispatched => {
    if (isFn(dispatched)) {
      dispatch(dispatched(state));
    } else if (isArray(dispatched)) {
      dispatched.forEach(dispatch);
    } else if (isFx(dispatched)) {
      const props = dispatched.props || {};
      if (props.cancel) {
        runFx(dispatched);
      } else if (props.concurrent) {
        concurrentFxWaiting.add(dispatched);
      } else if (props.after) {
        afterFxQueue.enqueue(dispatched);
      } else {
        serialFxQueue.enqueue(dispatched);
      }
      process.nextTick(fxLoop);
    } else if (isObj(dispatched)) {
      state = mergeState(state, dispatched);
    }
  };

  return { dispatch };
};
