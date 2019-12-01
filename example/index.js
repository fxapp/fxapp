const { app } = require("../src");

const delayEffect = ({ dispatch, ms, action }) =>
  new Promise(resolve =>
    setTimeout(() => {
      dispatch(action);
      resolve();
    }, ms)
  );
const delay = props => ({
  ...props,
  run: delayEffect
});

const addJsonResponse = json => ({
  response: {
    json
  }
});

const fallBackResponse = () => ({
  response: {
    text: "these aren't the droids you're looking for..."
  }
});

const routes = {
  _: fallBackResponse,
  test: {
    special: {
      path: () => ({
        response: {
          statusCode: 418,
          text: "inline response"
        }
      })
    },
    $id: {
      get: addJsonResponse,
      post: delay({ ms: 2000, action: addJsonResponse })
    }
  }
};

app({
  routes,
  customFx: ({ count = 0 }) => ({
    other: "state",
    count: count + 1
  })
})
  .then(() => {
    console.log("started server");
  })
  .catch(error => {
    console.error("error starting server", error);
  });
