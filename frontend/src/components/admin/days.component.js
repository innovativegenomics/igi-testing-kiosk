import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Table, Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import ContentEditable from 'react-contenteditable';
import moment from 'moment';

import { getAvailableDays, getAvailableLocations, createDay, deleteDay, updateDayBuffer } from '../../actions/adminActions';

class EditableBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value||'',
      oldValue: this.props.value||'',
      success: null,
    };
    this.tout = null;
  }
  onSave = async () => {
    if(this.state.value === this.state.oldValue) {
      return;
    }
    window.clearTimeout(this.tout);
    this.setState({success: null});
    const success = await this.props.onSave(this.state.value);
    let values = {};
    if(success) {
      values = {oldValue: this.state.value};
    } else {
      values = {value: this.state.oldValue};
    }
    this.setState({success: success, ...values});
    this.tout = window.setTimeout(() => {
      this.setState({success: null});
    }, 2000);
  }
  onFocus = () => {
    window.clearTimeout(this.tout);
    this.highlightAll();
    this.setState({success: null});
  }
  onChange = e => {
    const trimSpaces = string => (
      string
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
    );
    this.setState({value: trimSpaces(e.target.value)});
  }
  disableNewlines = (event) => {
    const keyCode = event.keyCode || event.which
  
    if (keyCode === 13) {
      event.returnValue = false
      if (event.preventDefault) event.preventDefault()
      event.target.blur();
    }
  }
  pasteAsPlainText = e => {
    e.preventDefault();
  
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  }
  highlightAll = () => {
    setTimeout(() => {
      document.execCommand('selectAll', false, null)
    }, 0)
  }
  render() {
    return (
      <ContentEditable
        tagName='span'
        html={this.state.value}
        className={'p-1 ' + (this.state.success?'border rounded border-success':(this.state.success===false?'border rounded border-danger':''))}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onSave}
        onPaste={this.pasteAsPlainText}
        onKeyPress={this.disableNewlines}
      />
    );
  }
}

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
      location: 0,
      date: moment().startOf('day').format('YYYY-MM-DD')
    };
  }
  render() {

    console.log(this.props.locations[this.state.location]);
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
              <Form.Label column sm={3}>Location</Form.Label>
              <Col>
                <Form.Control as='select' value={this.state.location} onChange={e => this.setState({location: e.target.value})}>
                  {
                    this.props.locations.map((v, i) => (
                      <option value={i} key={i}>{v.name}</option>
                    ))
                  }
                </Form.Control>
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
          <Button variant="primary" onClick={e => this.props.createDay({...this.state, location: this.props.locations[this.state.location].id})}>
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
      reason: ''
    };
  }
  render() {
    if(!this.props.day) {
      return <div/>;
    }
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Day {this.props.day.date} at {this.props.day.Location.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='lead'>Reason for deletion</p>
          <Form.Control as='select' value={this.state.reason} onChange={e => this.setState({reason: e.target.value})}>
            <option value=''>none</option>
            <option value='air_quality'>air quality</option>
            <option value='lab_capacity'>lab capacity</option>
          </Form.Control>
          <Button variant='danger' onClick={e => this.props.deleteDay(this.state.reason)} disabled={this.props.submitting}>Delete day</Button>
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
      locations: [],
      success: false,
      showCreateModal: false,
      loading: false,
      selected: null,
      showEditModal: false,
      deleting: false
    };
  }
  createDay = async ({starthour, startminute, endhour, endminute, date, location, window, buffer}) => {
    const status = await createDay({
      starthour: starthour,
      startminute: startminute,
      endhour: endhour,
      endminute: endminute,
      date: moment(date),
      location: location,
      window: window,
      buffer: buffer
    });
    this.setState({showCreateModal: false, loading: true});
    const days = await getAvailableDays();
    this.setState({...days, loading: false});
  }
  deleteSelectedDay = async (reason) => {
    this.setState({deleting: true});
    const status = await deleteDay(this.state.days[this.state.selected].date, this.state.days[this.state.selected].Location.id, reason);
    this.setState({showEditModal: false, loading: true, deleting: false});
    const days = await getAvailableDays();
    this.setState({...days, loading: false});
  }
  updateBuffer = async (i, v) => {
    const { success } = await updateDayBuffer(this.state.days[i].date, this.state.days[i].Location.id, v);
    if (success) {
      const tmpRes = this.state.days;
      tmpRes[i] = {...tmpRes[i], buffer: v};
      this.setState({
        days: tmpRes
      });
      return true;
    } else {
      return false;
    }
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const days = await getAvailableDays();
    const locations = await getAvailableLocations();
    this.setState({...days, ...locations, success: days.success && locations.success, loading: false});
  }
  render() {
    if(this.props.level < 30) {
      return <Redirect to='search' />;
    }

    return (
      <Container fluid>
        <Button className='m-2' onClick={e => this.setState({showCreateModal: true})}>Add Day</Button>
        <Table hover size='sm' responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Location</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Time Window</th>
              <th>People per Time Slot</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.days.map((v, i) => (
                <tr key={i}>
                  <td onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>{i+1}</td>
                  <td onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>{v.date}</td>
                  <td onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>{v.Location.name}</td>
                  <td onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>{moment(v.starttime).format('h:mm A')}</td>
                  <td onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>{moment(v.endtime).format('h:mm A')}</td>
                  <td onClick={e => this.setState({showEditModal: true, selected: i})} style={{cursor: 'pointer'}}>{v.window}</td>
                  <td>
                    <EditableBox value={v.buffer.toString()} onSave={nv => this.updateBuffer(i, parseInt(nv))}/>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>
        <CreateModal show={this.state.showCreateModal} onHide={e => this.setState({showCreateModal: false})} createDay={this.createDay} locations={this.state.locations}/>
        <EditModal show={this.state.showEditModal} onHide={e => this.setState({showEditModal: false})} day={this.state.days[this.state.selected]} deleteDay={(reason) => this.deleteSelectedDay(reason)} submitting={this.state.deleting}/>
      </Container>
    );
  }
}
