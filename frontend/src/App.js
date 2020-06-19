import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ReactGA from 'react-ga';

import Landing from './components/public/landing.component';
import About from './components/public/about.component';
import QRCode from './components/public/qrcode.component';

import NewUser from './components/private/newuser.component';
import Dashboard from './components/private/dashboard.component';
import Scheduler from './components/private/scheduler.component';

import Admin from './components/admin/admin.component';
import Scanner from './components/admin/scanner.component';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

import withTracker from './withTracker';

const trackingId = 'UA-170146726-1'; // Replace with your Google Analytics tracking ID
ReactGA.initialize(trackingId);

export default class App extends Component {
  render() {
    return (
        <Router>
          <div className='App'>
            <Route path='/' exact component={withTracker(Landing)} />
            <Route path='/about' component={withTracker(About)} />
            <Route path='/qrcode' component={withTracker(QRCode)} />

            <Route path='/newuser' component={withTracker(NewUser)} />
            <Route path='/dashboard' component={withTracker(Dashboard)} />
            <Route path='/scheduler' component={withTracker(Scheduler)} />

            <Route path='/admin/dashboard' component={withTracker(Admin)} />
            <Route path='/admin/scanner' component={withTracker(Scanner)} />
          </div>
        </Router>
    );
  }
}
