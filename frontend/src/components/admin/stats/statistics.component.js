import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import Slots from './slots.component';

export default class Statistics extends Component {
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }
    
    return (
      <Container>
        <Row className='mt-2'>
          <Col lg>
            <Slots/>
          </Col>
          <Col lg>
          </Col>
        </Row>
      </Container>
    );
  }
}
