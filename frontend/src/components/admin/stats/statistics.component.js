import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import Slots from './slots.component';
import General from './general.component';
import NewUsers from './newusers.component';
import Completion from './completion.component';
import Affiliation from './affiliation.component';

export default class Statistics extends Component {
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }
    
    return (
      <Container fluid>
        <Row lg={2}>
          <Col lg className='pl-2 pr-2 mt-3'>
            <Slots/>
          </Col>
          <Col lg className='pl-2 pr-2 mt-3'>
            <General/>
          </Col>
          <Col lg className='pl-2 pr-2 mt-3'>
            <NewUsers/>
          </Col>
          <Col lg className='pl-2 pr-2 mt-3'>
            <Completion/>
          </Col>
          <Col lg className='pl-2 pr-2 mt-3'>
            <Affiliation/>
          </Col>
        </Row>
      </Container>
    );
  }
}
