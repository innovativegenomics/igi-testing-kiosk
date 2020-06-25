import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { getScheduledSlotsStat, getCompletedSlotsStat } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduled: [],
      completed: [],
      loading: false,
      success: false,
      day: null,
      starttime: moment().startOf('week').set('day', props.settings.days[0]).set('hour', props.settings.starttime).set('minute', props.settings.startminute),
      endtime: moment().startOf('week').set('day', props.settings.days[0]).set('hour', props.settings.endtime).set('minute', props.settings.endminute),
    };
  }
  runSlotsStats = async (starttime, endtime) => {
    this.setState({loading: true});
    const scheduled = await getScheduledSlotsStat(starttime, endtime);
    const completed = await getCompletedSlotsStat(starttime, endtime);
    this.setState({...scheduled, ...completed, success: scheduled.success && completed.success, loading: false});
  }
  updateDay = async day => {
    const newStarttime = this.state.starttime.clone().set('day', day);
    const newEndtime = this.state.endtime.clone().set('day', day);
    this.setState({day: day, starttime: newStarttime, endtime: newEndtime});
    this.runSlotsStats(newStarttime, newEndtime);
  }
  componentDidMount = () => {
    this.runSlotsStats(this.state.starttime, this.state.endtime);
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
    if(!this.state.loading) {
      for(var i = this.state.starttime.clone();i.isBefore(this.state.endtime);i = i.add(this.props.settings.window, 'minute')) {
        labels.push(i.format('H:mm'));
        scheduledValues.push(0);
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
    }
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Number of scheduled appointments',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: scheduledValues
        },
        {
          label: 'Number of completed appointments',
          backgroundColor: 'rgba(132,99,255,0.2)',
          borderColor: 'rgba(132,99,255,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(132,99,255,0.4)',
          hoverBorderColor: 'rgba(132,99,255,1)',
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
              max: this.props.settings.buffer,
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
                      <Form.Control as='select' value={(this.state.day?this.state.day:this.props.settings.days[0])} onChange={e => this.updateDay(parseInt(e.target.value))}>
                        {this.props.settings.days.map(v => (
                          <option key={v} value={v}>{moment().set('day', v).format('dddd')}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Row>
                </Form>
                <Bar
                  data={data}
                  options={chartOptions}
                />
                <p className='lead m-0'>Scheduled Appointments: {scheduledCount}</p>
                <p className='lead m-0'>Unscheduled Appointments: {unscheduledCount}</p>
                <div className={this.state.loading?'':'d-none'}>
                  <div className='position-absolute d-block bg-secondary' style={{width: '100%', height: '100%', top: '0px', left: '0px', opacity: 0.3}}></div>
                  <Spinner animation='border' role='status' className='position-absolute d-block' style={{top: '50%', left: '50%'}}/>
                </div>
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
