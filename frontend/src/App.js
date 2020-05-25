import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";

import store from './store';

import Landing from './components/public/landing.component';
import About from './components/public/about.component';
import Dashboard from './components/private/dashboard.component';
import Scheduler from './components/private/scheduler.component';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className='App'>
            <Route path='/' exact component={Landing} />
            <Route path='/about' component={About} />
            <Route path='/dashboard' component={Dashboard}/>
            <Route path='/scheduler' component={Scheduler}/>
          </div>
        </Router>
      </Provider>
    );
  }
}
