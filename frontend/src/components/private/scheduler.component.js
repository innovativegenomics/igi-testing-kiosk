import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Spinner, Card, ButtonGroup, Button, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight, BsBoxArrowUpRight } from 'react-icons/bs';
import moment from 'moment';

import { getAvailable, requestSlot, reserveSlot, deleteReservedSlot } from '../../actions/slotActions';
import './calendar.css';

class DateButton extends Component {
  render() {
    if (this.props.grey) {
      return <Col className='m-0 p-0'><Button variant='outline-primary' size='sm' className='border-0 btn-circle text-secondary' disabled>{this.props.day}</Button></Col>;
    } else if (this.props.invisible) {
      return <Col className='m-0 p-0'><Button variant='outline-primary' size='sm' className='border-0 btn-circle invisible' disabled>{this.props.day}</Button></Col>;
    } else if (this.props.active) {
      if (this.props.selected) {
        return <Col className='m-0 p-0'><Button variant='outline-success' size='sm' className='border-0 btn-circle active' onClick={e => this.props.onClick()}>{this.props.day}</Button></Col>;
      } else {
        return <Col className='m-0 p-0'><Button variant='outline-primary' size='sm' className='border-0 btn-circle active' onClick={e => this.props.onClick()}>{this.props.day}</Button></Col>;
      }
    } else {
      return <Col className='m-0 p-0'><Button variant='outline-primary' size='sm' className='border-0 btn-circle' disabled>{this.props.day}</Button></Col>;
    }
  }
}

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      month: moment(this.props.days[0]).startOf('month')
    };
  }
  render() {
    const lastMonth = this.state.month.clone().subtract(1, 'month');
    const startDay = this.state.month.day();
    let btns = [];
    for (var i = 0; i < 6; i++) {
      let btnRow = [];
      for (var d = 0; d < 7; d++) {
        let day = i * 7 + d;
        if (day < startDay) {
          btnRow.push(<DateButton grey={true} day={lastMonth.daysInMonth() - startDay + 1 + day} key={day}/>);
        } else if (day >= startDay && day < this.state.month.daysInMonth() + startDay) {
          const dayMoment = this.state.month.clone().set('date', day - startDay + 1);
          const active = this.props.days.includes(dayMoment.format('YYYY-MM-DD'));
          btnRow.push(<DateButton active={active} selected={dayMoment.isSame(this.props.day)} day={day - startDay + 1} onClick={e => this.props.setDay(dayMoment)} key={day} />);
        } else {
          btnRow.push(<DateButton invisible={true} day={day - startDay + 1} key={day} />);
        }
      }
      btns.push(<Row key={i} className='m-0 p-0'>{btnRow}</Row>);
    }
    return (
      <Card style={{ width: '22rem' }} className='text-center m-auto'>
        <Card.Header className='text-center'>
          <ButtonGroup>
            <Button variant='light' onClick={e => this.setState({month: this.state.month.subtract(1, 'month')})}><BsChevronLeft /></Button>
            <p className='lead p-2 m-0' style={{ lineHeight: 1.2 }}>{this.state.month.format('MMMM YYYY')}</p>
            <Button variant='light' onClick={e => this.setState({month: this.state.month.add(1, 'month')})}><BsChevronRight /></Button>
          </ButtonGroup>
        </Card.Header>
        <Card.Body>
          <Row className='m-0 p-0'>
            <Col className='m-0 p-0'><p className='lead'>S</p></Col>
            <Col className='m-0 p-0'><p className='lead'>M</p></Col>
            <Col className='m-0 p-0'><p className='lead'>T</p></Col>
            <Col className='m-0 p-0'><p className='lead'>W</p></Col>
            <Col className='m-0 p-0'><p className='lead'>T</p></Col>
            <Col className='m-0 p-0'><p className='lead'>F</p></Col>
            <Col className='m-0 p-0'><p className='lead'>S</p></Col>
          </Row>
          {btns}
        </Card.Body>
      </Card>
    );
  }
}

class AppointmentTable extends Component {
  render() {
    const locations = this.props.available.locations;

    return (
      <Table className='text-center'>
        <thead>
          <tr>
            {
              locations.map(v => (
                <th scope='col' key={v}><a href={this.props.locations[v]} target='_blank'>{v}<BsBoxArrowUpRight/></a></th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            this.props.available.slots.map(v => (
              <tr key={v.time}>
                {
                  locations.map(l => (
                    v.locations.includes(l)?
                    <td key={l} style={{whiteSpace: 'nowrap'}}>
                      <Button onClick={e => this.props.pickSlot({time: v.time, location: l})}>
                        {moment(v.time).format('h:mm A')}
                      </Button>
                    </td>
                    :
                    <td key={l} style={{whiteSpace: 'nowrap'}}></td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </Table>
    );
  }
}

class ConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question1: 0,
      question2: 0,
      question3: 'None',
      question4: 'None',
      question5: 'No',
    };
  }
  render() {
    return (
      <Modal size='lg' onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='h4 font-weight-light'>Confirm that you would like to reserve this time slot</p>
          <p className='lead'>{moment(this.props.slot.time).format('dddd, MMMM D h:mm A')} at {this.props.slot.location}</p>
          <p className='h4 font-weight-light'>Please answer the following survey before you confirm your appointment</p>
          <Row>
            <Col md={9}>
              <p>In the two weeks leading up to this appointment, how many days have/will you work on campus?</p>
            </Col>
            <Col md={2}>
              <Form.Control type='number' value={this.state.question1} min={0} step={1} pattern='\d+' onChange={e => this.setState({question1: parseInt(e.target.value)})}/>
            </Col>
          </Row>
          <Row>
            <Col md={9}>
              <p>For the days you are/have been on campus in the two weeks leading up to this appointment, how many hours are you on campus, on average?</p>
            </Col>
            <Col md={2}>
              <Form.Control type='number' value={this.state.question2} min={0} step={1} pattern='\d+' onChange={e => this.setState({question2: parseInt(e.target.value)})}/>
            </Col>
          </Row>
          <Row>
            <Col md={9}>
              <p>Are you using a mobile contact tracing application? If so, which one?</p>
            </Col>
            <Col md={2}>
              <ButtonGroup>
                <Button variant={this.state.question4==='None'?'secondary':'primary'} onClick={e => this.setState({question4: ''})}>Yes</Button>
                <Button variant={this.state.question4==='None'?'primary':'secondary'} onClick={e => this.setState({question4: 'None'})}>No</Button>
              </ButtonGroup>
            </Col>
            <Col md={4}>
              <Form.Control type='text' className={this.state.question4==='None'?'d-none':''} placeholder='App Name' value={this.state.question4} onChange={e => this.setState({question4: e.target.value})}/>
            </Col>
          </Row>
          <Row>
            <Col md={7}>
              <p>Have you ever been diagnosed with COVID-19?</p>
            </Col>
            <Col md={5}>
              <ButtonGroup>
                <Button variant={this.state.question5==='Yes'?'primary':'secondary'} onClick={e => this.setState({question5: 'Yes'})}>Yes</Button>
                <Button variant={this.state.question5==='No'?'primary':'secondary'} onClick={e => this.setState({question5: 'No'})}>No</Button>
                <Button variant={this.state.question5==='Decline to state'?'primary':'secondary'} onClick={e => this.setState({question5: 'Decline to state'})}>Decline to state</Button>
              </ButtonGroup>
            </Col>
          </Row>
          <p>
            You will be asked to hold a tube, remove your mask, and spit into that tube. If you feel that you may need 
            assistance with these steps, please email <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a> to coordinate assistance ahead of time.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={e => this.props.onConfirm(this.state)}>Confirm</Button>
          <Button variant='secondary' onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default class Scheduler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: null,
      available: {},
      locations: {},
      days: [],
      day: null, // moment
      slot: {},
      oldSlot: null,
      showConfirmModal: false
    };
  }
  confirmSlot = async questions => {
    console.log('confirm!');
    console.log(questions);
    const res = await requestSlot(this.state.slot.time, this.state.slot.location, questions);
    if(res.success) {
      this.props.history.push('/dashboard');
    } else {
      alert('Unable to schedule your appointment, please try again!');
    }
  }
  hideConfirmModal = async () => {
    this.setState({showConfirmModal: false});
    const res = await deleteReservedSlot();
    console.log(`deleted reserved slot: ${res.success}`);
  }
  pickSlot = async slot => {
    this.setState({slot: slot, showConfirmModal: true});
    const res = await reserveSlot(slot.time, slot.location);
    console.log(`reserved slot: ${res.success}`);
  }
  componentDidMount = async () => {
    const available = await getAvailable();
    this.setState({...available});
  }
  render() {
    if (!this.props.auth.loaded || this.state.success === null) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (this.props.auth.unauthed) {
      return <Redirect to='/' />;
    } else if (!this.props.auth.success) {
      return <Redirect to='/newuser' />;
    } else if(this.state.oldSlot && this.state.oldSlot.completed) {
      return <Redirect to='/dashboard'/>;
    }

    return (
      <Container>
        <Calendar days={this.state.days} day={this.state.day} setDay={d => this.setState({day: d})}/>
        <Row className='justify-content-center mt-2'>
          <Col sm='auto'>
            {this.state.day?
              <AppointmentTable available={this.state.available[this.state.day.format('YYYY-MM-DD')]} locations={this.state.locations} pickSlot={this.pickSlot}/>
              :
              <div/>
            }
          </Col>
        </Row>
        <ConfirmModal slot={this.state.slot} show={this.state.showConfirmModal} onHide={this.hideConfirmModal} onConfirm={this.confirmSlot}/>
      </Container>
    );
  }
}
