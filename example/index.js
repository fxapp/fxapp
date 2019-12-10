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

const GetHeros = ({ heros }) => ({ response: { json: heros } });
const GetHero = ({
  request: {
    params: { id }
  },
  heros
}) => {
  const hero = heros.find(hero => hero.id == id);
  return hero
    ? { response: { json: hero } }
    : { response: { statusCode: 404 } };
};
const AddHero = ({ request: { jsonBody }, heros }) => {
  if (!jsonBody || !jsonBody.name) {
    return { response: { statusCode: 400 } };
  }
  const hero = {
    id: heros.length,
    ...jsonBody
  };
  return {
    response: { statusCode: 201, json: hero },
    heros: heros.concat(hero)
  };
};
const UpdateHero = ({
  request: {
    params: { id },
    jsonBody
  },
  heros
}) => {
  if (!jsonBody) {
    return { response: { statusCode: 400 } };
  }
  let heroUpdated = false;
  const updatedHeros = heros.map(hero => {
    if (hero.id == id) {
      heroUpdated = true;
      return {
        ...hero,
        ...jsonBody
      };
    }
    return hero;
  });
  return heroUpdated
    ? { heros: updatedHeros, response: { statusCode: 204 } }
    : { response: { statusCode: 404 } };
};
const RemoveHero = ({
  request: {
    params: { id }
  },
  heros
}) => {
  const updatedHeros = heros.filter(hero => hero.id != id);
  return updatedHeros.length !== heros.length
    ? { heros: updatedHeros, response: { statusCode: 204 } }
    : { response: { statusCode: 404 } };
};

const routes = {
  _: fallBackResponse,
  heros: {
    GET: GetHeros,
    POST: AddHero,
    $id: {
      GET: GetHero,
      PUT: UpdateHero,
      DELETE: RemoveHero
    }
  },
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
      GET: addJsonResponse,
      POST: delay({ ms: 2000, action: addJsonResponse })
    }
  }
};

app({
  state: {
    count: 0,
    heros: [
      {
        id: 0,
        name: "Superman"
      },
      {
        id: 1,
        name: "Flash"
      }
    ]
  },
  routes,
  customFx: ({ count }) => ({
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
