import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Routes, Route } from 'react-router';
import { createBrowserHistory } from 'history';
import App from './App';
import store from './redux';


const history = createBrowserHistory();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Routes history={history}>
        <Route 
            path='/'
            element={<App />}
          />
      {/* <Route>
        <App />
      </Route> */}
      </Routes>
    </Provider>
  </React.StrictMode>
);
