import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

import './about.css';
import Navbar from '../navbar.component';

export default class About extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <Container>
          <h1 className='text-center font-weight-light w-100'>About</h1>
        </Container>
      </div>
    );
  }
}
