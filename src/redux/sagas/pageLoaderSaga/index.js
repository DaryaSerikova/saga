import { call, apply, takeEvery } from "redux-saga/effects";

function* loadBlogData() {
  console.log('заработало');
  
  const request = yield call(fetch,'https://swapi.dev/api/vehicles/')
  console.log('request', request)
  // const data = yield call([request, request.json]);
  const data = yield apply(request, request.json);
  
  console.log('blog data', data);
}

export default function* pageLoaderSaga() {

  takeEvery('LOAD_BLOG_DATA', loadBlogData);
}