import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Table, Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import moment from 'moment';

import { getAvailableDays, createDay, deleteDay } from '../../actions/adminActions';

class CreateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      starthour: 12,
      startminute: 0,
      endhour: 16,
      endminute: 0,
      window: 10,
      buffer: 10,
      date: moment().startOf('day').format('YYYY-MM-DD')
    };
  }
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Create new day</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>Start time</Form.Label>
              <Col>
                <Form.Control as='select' value={this.state.starthour} onChange={e => this.setState({starthour: parseInt(e.target.value)})}>
                  {
                    [...Array(24).keys()].map(v => (
                      <option key={v}>{v}</option>
                    ))
                  }
                </Form.Control>
              </Col>
              :
              <Col>
                <Form.Control as='select' value={this.state.startminute} onChange={e => this.setState({startminute: parseInt(e.target.value)})}>
                  {
                    [...Array(60).keys()].map(v => (
                      <option key={v}>{v}</option>
                    ))
                  }
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>End time</Form.Label>
              <Col>
                <Form.Control as='select' value={this.state.endhour} onChange={e => this.setState({endhour: parseInt(e.target.value)})}>
                  {
                    [...Array(24).keys()].map(v => (
                      <option key={v}>{v}</option>
                    ))
                  }
                </Form.Control>
              </Col>
              :
              <Col>
                <Form.Control as='select' value={this.state.endminute} onChange={e => this.setState({endminute: parseInt(e.target.value)})}>
                  {
                    [...Array(60).keys()].map(v => (
                      <option key={v}>{v}</option>
                    ))
                  }
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>Date</Form.Label>
              <Col>
                <Form.Control type='date' value={this.state.date} onChange={e => this.setState({date: e.target.value})}/>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>Time window</Form.Label>
              <Col>
                <Form.Control type='number' value={this.state.window} onChange={e => this.setState({window: parseInt(e.target.value)})}/>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>People per time slot</Form.Label>
              <Col>
                <Form.Control type='number' value={this.state.buffer} onChange={e => this.setState({buffer: parseInt(e.target.value)})}/>
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={e => this.props.createDay(this.state)}>
            Create day
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class EditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    if(!this.props.day) {
      return <div/>;
    }
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Day {this.props.day.date}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant='danger' onClick={e => this.props.deleteDay()}>Delete day</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onHide}>
            Close
          </Button>
          {/* <Button variant="primary" onClick={e => this.props.createDay(this.state)}>
            Save changes
          </Button> */}
        </Modal.Footer>
      </Modal>
    );
  }
}

export default class Days extends Component {
  constructor(props) {
    super(props);
    this.state = {
      days: [],
      success: false,
      showCreateModal: false,
      loading: false,
      selected: null,
      showEditModal: false,
    };
  }
  createDay = async ({starthour, startminute, endhour, endminute, date, window, buffer}) => {
    const status = await createDay({
      starthour: starthour,
      startminute: startminute,
      endhour: endhour,
      endminute: endminute,
      date: moment(date),
      window: window,
      buffer: buffer
    });
    this.setState({showCreateModal: false, loading: true});
    const days = await getAvailableDays();
    this.setState({...days, loading: false});
  }
  deleteSelectedDay = async () => {
    const status = await deleteDay(this.state.days[this.state.selected].id);
    this.setState({showEditModal: false, loading: true});
    const days = await getAvailableDays();
    this.setState({...days, loading: false});
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const days = await getAvailableDays();
    this.setState({...days, loading: false});
  }
  render() {
    if(this.props.level < 30) {
      return <Redirect to='search' />;
    }

    return (
      <Container>
        <Button className='m-2' onClick={e => this.setState({showCreateModal: true})}>Add Day</Button>
        <Table hover size='sm' responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Time Window</th>
              <th>People per Time Slot</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.days.map((v, i) => (
                <tr key={i} onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>
                  <td>{i+1}</td>
                  <td>{v.date}</td>
                  <td>{v.starthour>12?v.starthour-12:v.starthour}:{v.startminute<10?`0${v.startminute}`:v.startminute} {v.starthour>12?'PM':'AM'}</td>
                  <td>{v.endhour>12?v.endhour-12:v.endhour}:{v.endminute<10?`0${v.endminute}`:v.endminute} {v.endhour>12?'PM':'AM'}</td>
                  <td>{v.window}</td>
                  <td>{v.buffer}</td>
                  <td>{v.id}</td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>
        <CreateModal show={this.state.showCreateModal} onHide={e => this.setState({showCreateModal: false})} createDay={this.createDay}/>
        <EditModal show={this.state.showEditModal} onHide={e => this.setState({showEditModal: false})} day={this.state.days[this.state.selected]} deleteDay={() => this.deleteSelectedDay()}/>
      </Container>
    );
  }
}
