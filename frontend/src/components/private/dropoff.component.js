import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Spinner, Card, ButtonGroup, Button, Row, Col, Alert, Modal } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import moment from 'moment';

import { getAvailableDropoffs, requestDropoff, reserveDropoff, deleteReservedDropoff } from '../../actions/tubeActions';
import './calendar.css';
import { nodeName } from 'jquery';

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

class ConfirmModal extends Component {
  render() {
    return (
      <Modal onHide={this.props.onClose} show={this.props.show}>
        <Modal.Body>
          {this.props.dropoff?
            <p className='lead'>
              Confirm that you would like to dropoff your current tube
              on {moment(this.props.dropoff.date).format('MMM Do')} at {this.props.dropoff.Dropoff.name} between {moment(this.props.dropoff.starttime).format('h:mm A')} and {moment(this.props.dropoff.endtime).format('h:mm A')}?
            </p>
            :
            <></>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={this.props.handleConfirm}>Ok</Button>
          <Button variant='secondary' onClick={this.props.onClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default class Dropoff extends Component {
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
      selectedDropoff: null,
      showConfirmModal: false
    };
  }
  setDay = async (d) => {
    this.setState({day: d})
  }
  pickDropoff = v => {
    this.setState({showConfirmModal: true, selectedDropoff: v})
  }
  handleConfirm = async () => {
    const { success } = await requestDropoff(this.state.selectedDropoff.id);
    if(success) {
      this.props.history.push('/dashboard');
    } else {
      this.setState({selectedDropoff: null, showConfirmModal: false});
      alert('error!');
    }
  }
  componentDidMount = async () => {
    const res = await getAvailableDropoffs();
    console.log(res)
    this.setState({...res});
    console.log(this.state);
  }
  render() {
    console.log(this.props.auth.loaded);
    if (!this.props.auth.loaded || this.state.success === null) {
      console.log('spinner');
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
            <Alert variant='primary'>
              <p className='lead mb-0'>
                To choose a dropoff location for your at home tube,
                select a date that works for you, and then select the
                location that is most convenient. You can come to the
                dropoff location anytime in the specified time range.
              </p>
            </Alert>
          </Col>
        </Row>
        <Calendar days={this.state.days} day={this.state.day} setDay={d => this.setDay(d)}/>
        {this.state.day?
          <>
            <div className='text-center'>
              {
                this.state.available.filter(v => {console.log(v.date); return v.date === this.state.day.format('YYYY-MM-DD')}).map(v => (
                  <Button key={v.location} className='m-2' onClick={e => this.pickDropoff(v)}>{v.Dropoff.name} between {moment(v.starttime).format('h:mm A')} and {moment(v.endtime).format('h:mm A')}</Button>
                ))
              }
            </div>
          </>
          :
          <></>}
        <ConfirmModal show={this.state.showConfirmModal} onClose={() => this.setState({showConfirmModal: false, selectedDropoff: null})} dropoff={this.state.selectedDropoff} handleConfirm={this.handleConfirm}></ConfirmModal>
      </Container>
    );
  }
}
