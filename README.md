# Redux-Saga React. Курс wise.js

## Введение в Saga

Саги реализованы с использованием генератора. Генератор дает возможность совершить действие посреди процесса, что невозможно в функциях. Это означает, что вы можете приостановить выполнение процесса, совершить задуманное и продолжить выполнение процесса.

## Эффекты (Effects)

Эффект - это объект, который содержит некоторую информацию, которая мб интерпретирована `middleware`. Для создания эффектов нам понадобятся функции, предоставленные библиотекой 'redux-saga/effects'

### take
Эффект `take` останавливает выполнение саги пока не произойдет dispatch этого action'а в приложении.

### takeEvery
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

const store = yield select(s => s);\

Так как select - неблокирующий эффект, мы получим store на момент выполнения кода (при использовании fork). Если хочется получить store после загрузки данных, тогда нужно заменить fork на call.\ 

### cancel
Отменяет задачу.

### all
Эффект all указывает sagaMiddleware запустить все переданные эффекты параллельнои ждать, пока все они закончатся (ждет их завершения).
Если хоть один из этих эффектов будет блокирующим, то all будет блокирующим. Если все эффекты будут неблокирующими, то и all будет неблокирующим 



## Способы запустить саги

Есть несколько способов запустить саги.\
Мы рассмотрим 5 способов запустить саги, но самыми предпочтительными являются 4 и 5 способ.

Подготовим почву для примера. Возьмем необходимые функции и создадим бутофорные саги, которые нам нужно будет запустить.

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

### 1 способ

Все три саги запустятся парраллельно.
При этом rootSaga будет заблокирована до тех пор, пока не произойдет вызов всех трех саг.\
И если хоть одна из них является блокирующей, то к дальнейшему коду мы перейдем только тогда, когда все три саги завершатся.\
Если хоть в одной из саг произойдет ошибка, то все последующие
процессы будут отменены и сама rootSaga больше не будет выполняться. Она тоже будет отменена и придальнейшем вызове ничего происходить не будет.


`export default function* rootSaga() {
  yield [
    saga1(),
    saga2(),
    saga3(),
  ]
  //code
}`


### 2 способ

`fork` всегда создает неблокирующий вызовб поэтому code, который написан ниже в rootSag'е выполнится сразу же после запуска саг.\

Если хоть одна из саг зафейлится, то все остальные будут отменены и сама задача тоже будет отменена.\
Разница между 1 и 2 способом только в том, что code 
в rootSag'е будет выполнен сразу же.\

export default function* rootSaga() {\
  yield [\
    fork(saga1),\
    fork(saga2),\
    fork(saga3),\
  ]\
  //code\
}\


### 3 способ

Аналогично 1 и 2 способу. Фейлится один, ломается все.\

```export default function* rootSaga() {
  yield fork(saga1); //auth
  yield fork(saga2); //users
  yield fork(saga3); //payments
  //code
```}


### 4 способ (предпочтительный)

export default function* rootSaga() {

  yield spawn(saga1); //auth
  yield spawn(saga2); //users
  yield spawn(saga3); //payments
  //code
}

### 5 способ

Случай, если нужно автоматически restart'овать саги в случае, если в них произошла ошибка и при этом не обрабатывать ошибку в каждой саге отдельно.\


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

## Как описывать доменную логику

У нас бывает несколько типов запросов.

### 1 тип запросов 
### (Загрузка данных при входе в приложение без действий пользователя)

1 тип запросов - это запросы, которые должны произойти просто при входе в наше приложение. Т.е. пользователь ничего не должен сделать и мы, например, сразу должны проверить авторизован он или нет или сразу же загрузить какой-то dataset, список пользователей или словарей.

Как работать с такими эффектами? Для этих случаев не нужно создавать `dispatch` какого-то action'а в какой-то конкретной компоненте. Мы подразумеваем, что эти данные нужны всем компонентам и в принципе нашему приложению, поэтому мы их загружаем сразу в ReduxSag'е и потом dispatch'им в store

### 2 тип запросов 
### (Загрузка данных при переходе на страницу)
Данные нужно загружать при входе на какую-то страницу

### 3 тип запросов




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