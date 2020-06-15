import React, { Component } from 'react';

import './about.css';

import Navbar from '../navbar.component';

export default class About extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <div className='container'>
          <h1 className='text-center font-weight-light w-100'>About</h1>
        </div>
      </div>
    );
  }
}
