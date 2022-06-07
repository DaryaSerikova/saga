import { all, call, fork, spawn, delay } from 'redux-saga/effects';
import loadBasicData from './initialSagas';
import pageLoaderSaga from './pageLoaderSaga';

// function* auth() {
//   yield delay(2000);

//   console.log('auth ok');

//   return true;
// }

// function* loadUsers() {
//   const request = yield call(fetch, `https://swapi.dev/api/people/1/`)
//   const data = yield call([request, request.json]) //yield call(request.json.bind(request))
//   // call может принимать массив, у которого первый аргумент 
//   // это контекст и имя функции (метод)

//   console.log('data', data);
// }

// export function* loadBasicData() {
//   yield all([
//     fork(auth),
//     fork(loadUsers)
//   ]);
// }

export default function* rootSaga() {

  const sagas = [
    loadBasicData,
    pageLoaderSaga
  ];

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






//СПОСОБ 5
// Случай, если нужно автоматически restart'овать саги
// в случае, если в них произошла ошибка и при этом
// не обрабатывать ошибку в каждой саге отдельноd

// export default function* rootSaga() {

//   const sagas = [saga1, saga2, saga3];

//   const retrySagas = yield sagas.map((saga) => {
//     return spawn(function*() {
//       while (true) {
//         try {
//           yield call(saga);
//           break
//         } catch (e) {
//           console.log(e);
//         }
//       }
//     })
//   });

//   yield all(retrySagas);
//   //code 
// }



// СПОСОБ 4
// предпочтительный

// export default function* rootSaga() {

//   yield spawn(saga1); //auth
//   yield spawn(saga2); //users
//   yield spawn(saga3); //payments
//   //code
// }



// СПОСОБ 3
// Аналогично 1 и 2 способу. Фейлится один, ломается все
// export default function* rootSaga() {

//   yield fork(saga1); //auth
//   yield fork(saga2); //users
//   yield fork(saga3); //payments
//   //code
// }



// СПОСОБ 2
// fork всегда создает неблокирующий вызовб поэтому code,
// который написан ниже в rootSag'е выполнится сразу же 
// после запуска саг
// Если хоть одна из саг зафейлится, то все остальные
// будут отменены и сама задача тоже будет отменена
// Разница между 1 и 2 способом только в том, что code 
// в rootSag'е будет выполнен сразу же

// export default function* rootSaga() {
//   yield [
//     fork(saga1),
//     fork(saga2),
//     fork(saga3),
//   ]
//   //code
// }



// СПОСОБ 1
// Все три саги запустятся парраллельно
// При этом rootSaga будет заблокирована до тех пор,
// пока не произойдет вызов всех трех саг.
// И если хоть одна из них является блокирующей, 
// то к дальнейшему коду мы перейдем только тогда, когда
// все три саги завершатся.
// Если хоть в одной из саг произойдет ошибка, то все последующие
// процессы будут отменены и сама rootSaga больше не будет 
// выполняться. Она тоже будет отменена и придальнейшем вызове
// ничего происходить не будет

// export default function* rootSaga() {
//   yield [
//     saga1(),
//     saga2(),
//     saga3(),
//   ]
//   //code
// }




















// import { takeEvery, put, call, fork, spawn, join, select
//   // take, takeLatest, takeLeading 
// } from 'redux-saga/effects';

// // const wait = (t) => new Promise((resolve => {
// //   setTimeout(resolve, t)
// // }))

// async function swapiGet(pattern) {
//   const request = await fetch(`https://swapi.dev/api/${pattern}`) //'https://swapi.dev/api/people/'

//   const data = await request.json();

//   return data;
// }



// export function* loadPeople() {
//   // throw new Error(); 
//   const people = yield call(swapiGet, 'people'); 
//   yield put({type: 'SET_PEOPLE', payload: people.results}); // это dispatch
//   console.log('load people!');
// }

// export function* loadPlanets() {
//   const planets = yield call(swapiGet, 'planets'); 
//   yield put({type: 'SET_PLANETS', payload: planets.results}); // это dispatch
//   console.log('load planets!');
// }



// export function* workerSaga() {
//   console.log('run parallel tasks');
//   yield spawn(loadPeople);
//   yield spawn(loadPlanets);
//   console.log('finish parallel tasks');
// }

// export function* watchLoadDataSaga() {
//   // На каждый CLICK мы будем вызывать workerSaga:
//   // yield takeEvery('CLICK', workerSaga);
//   yield takeEvery('LOAD_DATA', workerSaga);

// }

// export default function* rootSaga() {
//   yield fork(watchLoadDataSaga);
// }