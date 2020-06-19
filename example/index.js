const path = require("path");
const fs = require("fs");
const { app } = require("../src");

const ReadJsonFileEffect = {
  run: ({ path, dispatch, onSuccess, onError }) => {
    try {
      const data = fs.readFileSync(path);
      if (data) {
        dispatch(onSuccess, JSON.parse(data));
      }
    } catch (e) {
      dispatch(onError, e);
    }
  }
};

const WriteJsonFileEffect = {
  run({ path, data }) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }
};

const HEROES_PATH = path.resolve(__dirname, "heroes.json");

const initialState = {
  count: 0,
  heroes: [
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

const GetHeroes = ({ heroes }) => ({ response: { json: heroes } });
const GetHero = ({
  request: {
    params: { id }
  },
  heroes
}) => {
  const hero = heroes.find(hero => hero.id == id);
  return hero
    ? { response: { json: hero } }
    : { response: { statusCode: 404 } };
};
const AddHero = ({ request: { jsonBody }, heroes }) => {
  if (!jsonBody || !jsonBody.name) {
    return { response: { statusCode: 400 } };
  }
  const hero = {
    id: heroes.length,
    ...jsonBody
  };
  return {
    response: { statusCode: 201, json: hero },
    heroes: heroes.concat(hero)
  };
};
const UpdateHero = ({
  request: {
    params: { id },
    jsonBody
  },
  heroes
}) => {
  if (!jsonBody) {
    return { response: { statusCode: 400 } };
  }
  let heroUpdated = false;
  const updatedHeroes = heroes.map(hero => {
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
    ? { heroes: updatedHeroes, response: { statusCode: 204 } }
    : { response: { statusCode: 404 } };
};
const RemoveHero = ({
  request: {
    params: { id }
  },
  heroes
}) => {
  const updatedHeroes = heroes.filter(hero => hero.id != id);
  return updatedHeroes.length !== heroes.length
    ? { heroes: updatedHeroes, response: { statusCode: 204 } }
    : { response: { statusCode: 404 } };
};

const ReadHeroesEffect = [
  ReadJsonFileEffect,
  { path: HEROES_PATH, onSuccess: (_, heroes) => ({ heroes }) }
];

const WriteHeroesEffect = ({ heroes }) => [
  WriteJsonFileEffect,
  { path: HEROES_PATH, data: heroes }
];

const routes = {
  _: () => ({
    response: {
      statusCode: 404,
      text: "these aren't the droids you're looking for..."
    }
  }),
  heroes: {
    GET: GetHeroes,
    POST: [AddHero, WriteHeroesEffect],
    $id: {
      GET: GetHero,
      PUT: [UpdateHero, WriteHeroesEffect],
      DELETE: [RemoveHero, WriteHeroesEffect]
    }
  },
  debug: json => ({
    response: {
      json
    }
  })
};

const LoggingFx = [
  {
    run({ dispatch }) {
      const startedAt = Date.now();
      dispatch({
        request: {
          startedAt
        }
      });
    }
  },
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
  initFx: [initialState, ReadHeroesEffect],
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
