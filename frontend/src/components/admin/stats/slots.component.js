import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form, Card, InputGroup, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { getScheduledSlotsStat, getCompletedSlotsStat, getAvailableDays, getDaySettings } from '../../../actions/adminActions';

export default class Slots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduled: [],
      completed: [],
      loading: false,
      success: false,
      starttime: moment(),
      endtime: moment(),
      window: 10,
      buffer: 8,
      day: moment().startOf('day'),
      availableDays: []
    };
  }
  runSlotsStats = async (opts = {day: this.state.day}) => {
    this.setState({loading: true});
    console.log(opts.day);
    const sDay = await getDaySettings(opts.day.format());
    console.log(sDay);
    const [scheduled, completed] = await Promise.all([getScheduledSlotsStat(opts.day.format()), getCompletedSlotsStat(opts.day.format())]);
    this.setState({
      ...scheduled,
      ...completed,
      success: scheduled.success && completed.success, 
      starttime: opts.day.clone().set('hour', sDay.day.starthour).set('minute', sDay.day.startminute),
      endtime: opts.day.clone().set('hour', sDay.day.endhour).set('minute', sDay.day.endminute),
      window: sDay.day.window,
      buffer: sDay.day.buffer,
      loading: false
    });
  }
  updateDay = async day => {
    this.setState({day: moment(day)});
    this.runSlotsStats({day: moment(day)});
  }
  refreshButton = async () => {
    await this.runSlotsStats();
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const days = (await getAvailableDays()).days.map(v => moment(v.date));
    const day = days.find(v => v.clone().startOf('week').isSame(moment().startOf('week')));
    this.setState({
      availableDays: days,
      day: day
    });
    this.runSlotsStats({day: day});
  }
  render() {
    const labels = [];
    const scheduledValues = [];
    const completedValues = [];
    for(let i = this.state.starttime.clone();i.isBefore(this.state.endtime);i = i.add(this.state.window, 'minute')) {
      labels.push(i.format('H:mm'));
      scheduledValues.push(0);
      completedValues.push(0);
    }

    let scheduledTotal = 0;
    let completedTotal = 0;
    this.state.scheduled.forEach((v, i) => {
      const time = moment(v.time);
      const index = labels.indexOf(time.format('H:mm'));
      scheduledValues[index] = v.count;
      scheduledTotal += v.count;
    });
    this.state.completed.forEach((v, i) => {
      const time = moment(v.time);
      const index = labels.indexOf(time.format('H:mm'));
      completedValues[index] = v.count;
      completedTotal += v.count;
    });
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Number of scheduled appointments',
          backgroundColor: 'Tomato',
          borderWidth: 1,
          hoverBackgroundColor: 'Tomato',
          data: scheduledValues
        },
        {
          label: 'Number of completed appointments',
          backgroundColor: 'DodgerBlue',
          borderWidth: 1,
          hoverBackgroundColor: 'DodgerBlue',
          data: completedValues
        }
      ]
    };
    const chartOptions = {
      scales: {
        yAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true,
              max: this.state.buffer,
              stepSize: 1
            }
          }
        ],
        xAxes: [
          {
            stacked: true,
            gridLines: {
              display: false
            },
          }
        ]
      }
    };

    return (
      <Card>
        <Card.Body>
          <Form>
            <Row>
              <Col xs='auto'>
                <OverlayTrigger
                  placement='top'
                  delay={{ show: 200, hide: 50 }}
                  overlay={props => <Tooltip {...props}>Refresh</Tooltip>}
                >
                  <Button variant='light' className='border' onClick={this.refreshButton}>
                    <Spinner animation='border' role='status' className={''+(this.state.loading?'':'d-none')} size='sm'/>
                    <BsArrowClockwise className={''+(this.state.loading?'d-none':'')}/>
                  </Button>
                </OverlayTrigger>
              </Col>
              <Col>
                <Form.Control as='select' value={this.state.day.format()} onChange={e => this.updateDay(e.target.value)}>
                  {
                    this.state.availableDays.map(v => (
                      <option value={v.format()}>{v.format('dddd, MMMM Do')}</option>
                    ))
                  }
                </Form.Control>
              </Col>
            </Row>
          </Form>
          <Bar
            data={data}
            options={chartOptions}
          />
          <p className='lead m-0'>Scheduled Appointments: {scheduledTotal+completedTotal}</p>
          <p className='lead m-0'>Completed Appointments: {completedTotal}</p>
          <p className='lead m-0'>Appointments Left: {scheduledTotal}</p>
        </Card.Body>
      </Card>
    );
  }
}
