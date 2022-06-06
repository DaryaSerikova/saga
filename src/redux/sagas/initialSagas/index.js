import { all, call, fork, spawn, delay } from 'redux-saga/effects';



function* auth() {
  yield delay(2000);

  console.log('auth ok');

  return true;
}

function* loadUsers() {
  const request = yield call(fetch, `https://swapi.dev/api/people/1/`)
  const data = yield call([request, request.json]) //yield call(request.json.bind(request))
  // call может принимать массив, у которого первый аргумент 
  // это контекст и имя функции (метод)

  console.log('data', data);
}

export function* loadBasicData() {
  yield all([
    fork(auth),
    fork(loadUsers)
  ]);
}