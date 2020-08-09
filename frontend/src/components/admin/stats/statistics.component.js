import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import Slots from './slots.component';
import General from './general.component';
import NewUsers from './newusers.component';

export default class Statistics extends Component {
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }
    
    return (
      <Container>
        <Row className='mt-3'>
          <Col lg className='pl-2 pr-2'>
            <Slots/>
          </Col>
          <Col lg className='pl-2 pr-2'>
            <General/>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col lg className='pl-2 pr-2'>
            <NewUsers/>
          </Col>
          <Col lg className='pl-2 pr-2'>
          </Col>
        </Row>
      </Container>
    );
  }
}
