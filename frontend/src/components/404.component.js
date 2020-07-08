import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

export default class Error404 extends Component {
  render() {
    return (
      <Row>
        <Col className='text-center'>
          <div className='display-4'>
            404 Page not found
          </div>
        </Col>
      </Row>
    );
  }
}
