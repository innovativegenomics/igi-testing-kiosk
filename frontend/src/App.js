import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";

import store from './store';

import Landing from './components/public/landing.component';
import About from './components/public/about.component';
import QRCode from './components/public/qrcode.component';
import PrivateRoute from './components/private/privateRoute.component';
import NewUser from './components/private/newuser.component';
import Dashboard from './components/private/dashboard.component';
import Scheduler from './components/private/scheduler.component';
import Screening from './components/private/screening.component';

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
            <Route path='/qrcode' component={QRCode}/>
            <PrivateRoute path='/screening' component={Screening} />
            <PrivateRoute path='/newuser' component={NewUser}/>
            <PrivateRoute path='/dashboard' component={Dashboard}/>
            <PrivateRoute path='/scheduler' component={Scheduler}/>
          </div>
        </Router>
      </Provider>
    );
  }
}
