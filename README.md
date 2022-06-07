# Redux-Saga React. Курс wise.js

## Введение в Saga

Саги реализованы с использованием генератора. Генератор дает возможность совершить действие посреди процесса, что невозможно в функциях. Это означает, что вы можете приостановить выполнение процесса, совершить задуманное и продолжить выполнение процесса.

## Эффекты (Effects)

Эффект - это объект, который содержит некоторую информацию, которая мб интерпретирована `middleware`. Для создания эффектов нам понадобятся функции, предоставленные библиотекой 'redux-saga/effects'

### take
Эффект `take` останавливает выполнение саги пока не произойдет dispatch этого action'а в приложении.

### takeEvery
```
  takeEvery('LOAD_BLOG_DATA', loadBlogData)
```
где 'LOAD_BLOG_DATA' - это тип action'а, а loadBlogData - это worker-сага

### takeLast
### takeLeading
### put

### call
Эффект `call` выполняет остановку саги до тех пор пока незарезолвится (resolve) Promise, который мы ему передали

### fork
Эффект, который указывает `middleware` выполнить неблокирующий вызов, переданной функции. Это основной эффект для управления параллелизмом между сагами

### spawn
Создает параллельную задачу в корне саги, сам процесс не привязан к родителю

### join
Нужен чтобы заблокировать неблокирующую задачу и получить результат

### select
Получить данные из store. Аналог useSelect/mapStateToProps.
```
const store = yield select(s => s);
```
Так как select - неблокирующий эффект, мы получим store на момент выполнения кода (при использовании fork). Если хочется получить store после загрузки данных, тогда нужно заменить fork на call.

### cancel
Отменяет задачу.

### all
Эффект all указывает sagaMiddleware запустить все переданные эффекты параллельнои ждать, пока все они закончатся (ждет их завершения).

Если хоть один из этих эффектов будет блокирующим, то all будет блокирующим. Если все эффекты будут неблокирующими, то и all будет неблокирующим. 

Если эффекты блокирующие, он дожидается их вызова. А если неблокирующие, то он передает управление следующему коду.

### apply
Идентичен call, принимает два аргумента: контекст и метод, который нужно вызвать. Отличие от call: аргументы не нужно оборачивать в массив, они принимаются как обычные аргументы


## Способы запустить саги

Есть несколько способов запустить саги.\
Мы рассмотрим 5 способов запустить саги, но самыми предпочтительными являются 4 и 5 способ.

Подготовим почву для примера. Возьмем необходимые функции и создадим бутофорные саги, которые нам нужно будет запустить.
```
import { all, call, fork, spawn } from 'redux-saga/effects';


export function* saga1() {
  console.log('Saga 1');
}
export function* saga2() {
  console.log('Saga 2');
}
export function* saga3() {
  console.log('Saga 3');
}
```
### 1 способ

Все три саги запустятся парраллельно.
При этом rootSaga будет заблокирована до тех пор, пока не произойдет вызов всех трех саг.\
И если хоть одна из них является блокирующей, то к дальнейшему коду мы перейдем только тогда, когда все три саги завершатся.

Если хоть в одной из саг произойдет ошибка, то все последующие
процессы будут отменены и сама rootSaga больше не будет выполняться. Она тоже будет отменена и придальнейшем вызове ничего происходить не будет.

```
export default function* rootSaga() {
  yield [
    saga1(),
    saga2(),
    saga3(),
  ]
  //code
}
```

### 2 способ

`fork` всегда создает неблокирующий вызовб поэтому code, который написан ниже в rootSag'е выполнится сразу же после запуска саг.

Если хоть одна из саг зафейлится, то все остальные будут отменены и сама задача тоже будет отменена.\
Разница между 1 и 2 способом только в том, что code 
в rootSag'е будет выполнен сразу же.
```
export default function* rootSaga() {
  yield [
    fork(saga1),
    fork(saga2),
    fork(saga3),
  ]
  //code
}
```

### 3 способ

Аналогично 1 и 2 способу. Фейлится один, ломается все.

```
export default function* rootSaga() {
  yield fork(saga1); //auth
  yield fork(saga2); //users
  yield fork(saga3); //payments
  //code
}
```

### 4 способ (предпочтительный)
```
export default function* rootSaga() {

  yield spawn(saga1); //auth
  yield spawn(saga2); //users
  yield spawn(saga3); //payments
  //code
}
```
### 5 способ

Случай, если нужно автоматически restart'овать саги в случае, если в них произошла ошибка и при этом не обрабатывать ошибку в каждой саге отдельно.

```
export default function* rootSaga() {

  const sagas = [saga1, saga2, saga3];

  const retrySagas = yield sagas.map((saga) => {
    return spawn(function*() {
      while (true) {
        try {
          yield call(saga);
          break
        } catch (e) {
          console.log(e);
        }
      }
    })
  });

  yield all(retrySagas);
  //code 
}
```
## Как описывать доменную логику

У нас бывает несколько типов запросов.

### 1 тип запросов 
#### (Загрузка данных при входе в приложение без действий пользователя)

1 тип запросов - это запросы, которые должны произойти просто при входе в наше приложение. Т.е. пользователь ничего не должен сделать и мы, например, сразу должны проверить авторизован он или нет или сразу же загрузить какой-то dataset, список пользователей или словарей.

Как работать с такими эффектами? Для этих случаев не нужно создавать `dispatch` какого-то action'а в какой-то конкретной компоненте. Мы подразумеваем, что эти данные нужны всем компонентам и в принципе нашему приложению. Поэтому мы их загружаем сразу в ReduxSag'е и потом dispatch'им в store

Сделаем одну worker-сагу loadBasicData. 
```
export function* loadBasicData() {

}

export default function* rootSaga() {

  const sagas = [loadBasicData];

  const retrySagas = yield sagas.map((saga) => {
    return spawn(function*() {
      while (true) {
        try {
          yield call(saga);
          break
        } catch (e) {
          console.log(e);
        }
      }
    })
  });

  yield all(retrySagas);
  //code 
}
```
И прям в ней мы будем загружать данные, которые сразу нужны нашему приложению.
Создадим отдельно распределенные процессы: саги auth и loadUsers.

```
function* auth() {
  yield delay(2000);

  console.log('auth ok');

  return true;
}
```
Сделаем запрос на данные прямо из worker'а.
Нам нужно будет воспользоваться bind в контексте request, т.к. json это метод, который внутри ссылается на this.
Но call может принимать массив, у которого первый аргумент это контекст и имя функции (метод)
```
function* loadUsers() {
  const request = yield call(fetch, `https://swapi.dev/api/people/1/`)
  const data = yield call([request, request.json]) //yield call(request.json.bind(request))

  console.log('data', data);
}
```
А loadBasicData будет запускать эти эффекты (auth loadUsers)
```
export function* loadBasicData() {
  yield all([
    fork(auth),
    fork(loadUsers)
  ]);
}
```

В эти моменты мы можем dispatch'ить какие-то action'ы в наш store для того, чтобы получить эти данные внутри наших компонентб а потом уже показывать правильные вьюшки, список пользователей и так далее.

### 2 тип запросов 
#### (Загрузка данных при переходе на страницу)
Данные нужно загружать при входе на какую-то страницу. Существует множество практик. 
Самый default'ный и простой случай - это dispatch'ить action при загрузке старницы. Или же более интересный - отслеживать изменения в нашем роутере и вызывать конкретный action при push'е данного роута в наш history. Но для этого у нас должен быть роутер при ??connection?? store.
Рассмотри оба эти варианта.

### 3 тип запросов



## dispatch, store и хуки
Для начала достанем dispatch
```
import { useDispatch, useSelector } from "react-redux";


const dispatch = useDispatch();

// вызов store из Provider (обычно вызывается кусок store)
const store = useSelector(store => store);

console.log(store);
```
```
<button
  onClick={() => dispatch({type: 'LOAD_DATA'})}
>click me</button>
```

## Загрука данных с комментариями
```
function* loadUsers() {
  const request = yield call(fetch, `https://swapi.dev/api/people`)
  const data = yield call([request, request.json]) //yield call(request.json.bind(request))
  // call может принимать массив, у которого первый аргумент 
  // это контекст и имя функции (метод)

  console.log('data', data);
}
```

## Кусок из первого урока. Ненужный на данный момент

```
const initial = {
  people: [],
  planets: []
};

export default function reducer(state = initial, action) {
  switch (action.type) {

    case 'SET_PEOPLE': {
      return {
        ...state,
        people: [
          ...state.people,
          ...action.payload
        ]
      }
    }

    case 'SET_PLANETS': {
      return {
        ...state,
        planets: [
          ...state.planets,
          ...action.payload
        ]
      }
    }

    default:
      return state;
  }
}
```

## Еще один такой кусок

```
import { takeEvery, put, call, fork, spawn, join, select
  // take, takeLatest, takeLeading 
} from 'redux-saga/effects';

// const wait = (t) => new Promise((resolve => {
//   setTimeout(resolve, t)
// }))

async function swapiGet(pattern) {
  const request = await fetch(`https://swapi.dev/api/${pattern}`) //'https://swapi.dev/api/people/'

  const data = await request.json();

  return data;
}



export function* loadPeople() {
  // throw new Error(); 
  const people = yield call(swapiGet, 'people'); 
  yield put({type: 'SET_PEOPLE', payload: people.results}); // это dispatch
  console.log('load people!');
}

export function* loadPlanets() {
  const planets = yield call(swapiGet, 'planets'); 
  yield put({type: 'SET_PLANETS', payload: planets.results}); // это dispatch
  console.log('load planets!');
}



export function* workerSaga() {
  console.log('run parallel tasks');
  yield spawn(loadPeople);
  yield spawn(loadPlanets);
  console.log('finish parallel tasks');
}

export function* watchLoadDataSaga() {
  // На каждый CLICK мы будем вызывать workerSaga:
  // yield takeEvery('CLICK', workerSaga);
  yield takeEvery('LOAD_DATA', workerSaga);

}

export default function* rootSaga() {
  yield fork(watchLoadDataSaga);
}
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\


See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.