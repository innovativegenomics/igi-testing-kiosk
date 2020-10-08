import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Spinner, Card, ButtonGroup, Button, Row, Col, Table, Modal, Form, Alert } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight, BsBoxArrowUpRight } from 'react-icons/bs';
import moment from 'moment';

import { getAvailable, requestSlot, reserveSlot, deleteReservedSlot } from '../../actions/slotActions';
import './calendar.css';

class DateButton extends Component {
  render() {
    return (
      <Col className='m-0 p-0'>
        <Button
          variant={this.props.grey?'outline-secondary':(this.props.selected?'outline-success':'outline-primary')}
          size='sm'
          className={`border-0 btn-circle ${(this.props.active||this.props.selected)?'active':''}`}
          disabled={!(this.props.active||this.props.selected)}
          onClick={this.props.onClick}
        >
          {this.props.day}
        </Button>
      </Col>
    );


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
        const dayMoment = this.state.month.clone().set('date', day - startDay + 1);
        const active = this.props.days.includes(dayMoment.format('YYYY-MM-DD'));
        if (day < startDay) {
          btnRow.push(<DateButton grey active={active} day={lastMonth.daysInMonth() - startDay + 1 + day} key={day} onClick={e => {this.props.setDay(null); this.setState({month: this.state.month.subtract(1, 'month')})}}/>);
        } else if (day >= startDay && day < this.state.month.daysInMonth() + startDay) {
          btnRow.push(<DateButton active={active} selected={dayMoment.isSame(this.props.day)} day={day - startDay + 1} onClick={e => this.props.setDay(dayMoment)} key={day} />);
        } else {
          btnRow.push(<DateButton grey active={active} day={dayMoment.get('date')} key={day} onClick={e => {this.props.setDay(null); this.setState({month: this.state.month.add(1, 'month')})}} />);
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
  componentDidMount = async () => {
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
    }

    if(!this.props.auth.user.reconsented) {
      return <Redirect to='/reconsent' />;
    }

    return (
      <Container>
        <Row className='justify-content-center'>
          <Col md={6}>
            <Alert variant='info'>
              <p className='lead mb-0'>
                A new kiosk location will be opening at Latimer Hall.
                When you are scheduling your next appointment,
                please make sure you notice which location you
                are choosing.
              </p>
            </Alert>
          </Col>
        </Row>
        <Calendar days={this.state.days} day={this.state.day} setDay={d => this.setState({day: d})}/>
      </Container>
    );
  }
}
