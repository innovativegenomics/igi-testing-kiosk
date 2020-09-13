import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Table, Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import moment from 'moment';

import { getSettings, patchSettings } from '../../actions/adminActions';

export default class Days extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false,
      settings: {}
    };
  }
  updateSettings = async values => {
    this.setState({loading: true});
    await patchSettings(values);
    const settings = await getSettings();
    this.setState({...settings, loading: false});
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const settings = await getSettings();
    this.setState({...settings, loading: false});
  }
  render() {
    if(this.props.level < 30) {
      return <Redirect to='search' />;
    }

    return (
      <Container>
        <h1 className='font-weight-light'>Settings</h1>
        <Form className='pt-3 pl-md-10'>
          <Form.Group as={Row}>
            <Form.Label column md='3'>Sunday appointment emails</Form.Label>
            <Col>
              {this.state.settings.sendRescheduleEmails?
                <Button variant='warning' onClick={e => this.updateSettings({sendRescheduleEmails: false})}>Pause</Button>
                :
                <Button variant='success' onClick={e => this.updateSettings({sendRescheduleEmails: true})}>Resume</Button>
              }
            </Col>
          </Form.Group>
        </Form>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>
      </Container>
    );
  }
}
