import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'; //  Import HashRouter
import './index.css';
import App from './App';
import store from './store';

ReactDOM.render(
  <Provider store={store}>
    <HashRouter> {/* Wrap App with HashRouter */}
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

