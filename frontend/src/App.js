import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";

import Landing from './components/landing.component';
import Dashboard from './components/dashboard.component';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <Router>
        <div className='App'>
          <Route path='/' exact component={Landing} />
          <Route path='/dashboard' component={Dashboard}/>
        </div>
      </Router>
    );
  }
}
