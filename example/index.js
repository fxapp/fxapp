const path = require("path");
const fs = require("fs");
const { app } = require("../src");

const HEROS_PATH = path.resolve(__dirname, "heros.json");

const initialState = {
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
};

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
const ReadHerosEffect = {
  run({ dispatch }) {
    try {
      const data = fs.readFileSync(HEROS_PATH);
      if (data) dispatch({ heros: JSON.parse(data) });
    } catch (e) {}
  }
};
const WriteHerosEffect = {
  run({ dispatch }) {
    dispatch(({ heros }) => {
      fs.writeFileSync(HEROS_PATH, JSON.stringify(heros, null, 2));
    });
  }
};

const routes = {
  _: () => ({
    response: {
      statusCode: 404,
      text: "these aren't the droids you're looking for..."
    }
  }),
  heros: {
    GET: GetHeros,
    POST: [AddHero, WriteHerosEffect],
    $id: {
      GET: GetHero,
      PUT: [UpdateHero, WriteHerosEffect],
      DELETE: [RemoveHero, WriteHerosEffect]
    }
  },
  debug: json => ({
    response: {
      json
    }
  })
};

const LoggingFx = [
  () => ({
    request: {
      startedAt: Date.now()
    }
  }),
  {
    after: true,
    run({ dispatch }) {
      dispatch(({ request, response }) => {
        const duration = Date.now() - request.startedAt;
        console.log(
          `${request.method} ${request.url} -> ${response.statusCode} in ${duration}ms`
        );
      });
    }
  }
];

app({
  initFx: [initialState, ReadHerosEffect],
  routes,
  requestFx: [
    ({ count }) => ({
      other: "state",
      count: count + 1
    }),
    LoggingFx
  ]
})
  .then(() => {
    console.log("started server");
  })
  .catch(error => {
    console.error("error starting server", error);
  });
