import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import store from './redux';
import App from './pages/App';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';


const history = createBrowserHistory();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router history={history}>
        <Switch>

          <Route path='/' exact>
            <App />
          </Route>

          <Route path='/blog' exact>
            <Blog />
          </Route>

          <Route path='*'>
            <NotFound />
          </Route>
          
        </Switch>
      </Router>
    </Provider>
  </React.StrictMode>
);
