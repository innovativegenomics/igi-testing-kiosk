import React, { Component } from 'react';
import axios from 'axios';
import { Alert, Row, Col, Container } from 'react-bootstrap';

import { TrackedButton, TrackedLink } from '../../tracker';

export default class Rampdown extends Component {
  render() {
    return (
      <Container>
        <Alert variant='warning'>
          <p className='p-0 m-0 lead'>
            The IGI FAST study will stop testing on 10/29/2020 and is no longer enrolling participants. If you
            are a UC Berkeley student, staff, or faculty, you are eligible for free asymptomatic COVID-19
            testing through University Health Services. Please see <TrackedLink to='https://uhs.berkeley.edu/coronavirus/testing-covid-19' ext>https://uhs.berkeley.edu/coronavirus/testing-covid-19</TrackedLink> for more information.
            <br />
            <br />
            See our <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/transitionRequestFeedback.pdf`}>letter to participants</TrackedLink> for more details.
          </p>
        </Alert>
      </Container>
    );
  }
}
