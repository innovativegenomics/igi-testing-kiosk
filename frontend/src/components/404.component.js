import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

export default class Error404 extends Component {
  render() {
    return (
      <Container className='text-center'>
        <p className='display-4'>
          Error 404
        </p>
        <p className='h3 font-weight-light'>
          Uh oh! The page you were looking for was not found!
        </p>
      </Container>
    );
  }
}
