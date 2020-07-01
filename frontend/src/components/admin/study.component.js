import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
// import moment from 'moment';

import { getStudyApptSurvey } from '../../actions/adminActions';

export default class Study extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    if(this.props.level < 40) {
      return <Redirect to='/admin' />;
    }

    return (
      <Container className='mt-3'>
        <h1 className='font-weight-light'>Downloads</h1>
        <Button onClick={e => getStudyApptSurvey()}>Participant Info</Button>
      </Container>
    );
  }
}
