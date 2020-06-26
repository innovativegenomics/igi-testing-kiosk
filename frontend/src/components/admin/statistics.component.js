import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form, Card, InputGroup, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { getScheduledSlotsStat, getCompletedSlotsStat, getSettingsDay } from '../../actions/adminActions';

export default class SlotSearch extends Component {
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
      day: moment().get('day'),
    };
  }
  runSlotsStats = async (day) => {
    this.setState({loading: true});
    console.log('starting loading');
    const [scheduled, completed, sDay] = await Promise.all([getScheduledSlotsStat(day.format()), getCompletedSlotsStat(day.format()), getSettingsDay(day.format())]);
    console.log('end load');
    console.log(day);
    console.log(scheduled);
    this.setState({...scheduled, ...completed, success: scheduled.success && completed.success, starttime: day.clone().set('hour', sDay.day.starthour).set('minute', sDay.day.startminute), endtime: day.clone().set('hour', sDay.day.endhour).set('minute', sDay.day.endminute), window: sDay.day.window, buffer: sDay.day.buffer, loading: false});
  }
  updateDay = async day => {
    this.setState({day: day});
    this.runSlotsStats(moment().set('day', day));
  }
  refreshButton = async () => {
    await this.runSlotsStats(moment().set('day', this.state.day));
  }
  componentDidMount = () => {
    this.runSlotsStats(moment().set('day', this.state.day));
  }
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }
    
    const labels = [];
    const scheduledValues = [];
    const completedValues = [];
    var scheduledCount = 0;
    var unscheduledCount = 0;
    console.log('start loop');
    for(let i = this.state.starttime.clone();i.isBefore(this.state.endtime);i = i.add(this.state.window, 'minute')) {
      console.log('loop' + i);
      labels.push(i.format('H:mm'));
      scheduledValues.push(0);
      completedValues.push(0);
    }

    this.state.scheduled.forEach((v, i) => {
      const time = moment(v.time);
      const index = labels.indexOf(time.format('H:mm'));
      scheduledValues[index] = v.count;
    });
    this.state.completed.forEach((v, i) => {
      const time = moment(v.time);
      const index = labels.indexOf(time.format('H:mm'));
      completedValues[index] = v.count;
    });
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Number of scheduled appointments',
          backgroundColor: 'rgba(220,53,69,0.2)',
          borderColor: 'rgba(220,53,69,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(220,53,69,0.4)',
          hoverBorderColor: 'rgba(220,53,69,1)',
          data: scheduledValues
        },
        {
          label: 'Number of completed appointments',
          backgroundColor: 'rgba(0,123,255,0.2)',
          borderColor: 'rgba(0,123,255,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(0,123,255,0.4)',
          hoverBorderColor: 'rgba(0,123,255,1)',
          data: completedValues
        }
      ]
    };
    console.log(data);
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
      <Container className='mt-3'>
        <Row>
          <Col lg>
            <Card>
              <Card.Body>
                <Form>
                  <Row>
                    <Col>
                      <InputGroup>
                        <InputGroup.Prepend>
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
                        </InputGroup.Prepend>
                        <Form.Control as='select' value={(this.state.day)} onChange={e => this.updateDay(parseInt(e.target.value))}>
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                        </Form.Control>
                      </InputGroup>
                    </Col>
                  </Row>
                </Form>
                <Bar
                  data={data}
                  options={chartOptions}
                />
                <p className='lead m-0'>Scheduled Appointments: {scheduledCount}</p>
                <p className='lead m-0'>Unscheduled Appointments: {unscheduledCount}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg>
          </Col>
        </Row>
      </Container>
    );
  }
}
