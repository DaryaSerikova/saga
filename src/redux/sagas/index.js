import { all, call, fork, spawn, delay } from 'redux-saga/effects';
import loadBasicData from './initialSagas';
import pageLoaderSaga from './pageLoaderSaga';



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