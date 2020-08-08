import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form, Card, InputGroup, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { getScheduledSlotsStat, getAvailableDays } from '../../../actions/adminActions';

export default class Slots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slots: [],
      loading: false,
      success: false,
      day: null,
      availableDays: []
    };
  }
  runSlotsStats = async (opts = {day: this.state.day}) => {
    this.setState({loading: true});
    const selectedDay = this.state.availableDays[opts.day];
    const slots = await getScheduledSlotsStat(selectedDay.Location.id, moment(selectedDay.date).format(), moment(selectedDay.date).add(1, 'day').format());
    this.setState({
      ...slots,
      loading: false
    });
  }
  updateDay = async index => {
    this.setState({day: index});
    this.runSlotsStats({day: index});
  }
  refreshButton = async () => {
    await this.runSlotsStats();
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const days = (await getAvailableDays()).days;
    const day = days.findIndex(v => moment(v.date).isSameOrBefore(moment()));
    this.setState({
      availableDays: days,
      day: day
    });
    await this.runSlotsStats({day: day});
  }
  render() {
    console.log(this.state.slots);
    const labels = [];
    const scheduledValues = [];
    const completedValues = [];
    this.state.slots.forEach(v => {
      labels.push(moment(v.starttime).format('H:mm'));
      scheduledValues.push(v.buffer-v.available-v.completedCount);
      completedValues.push(v.completedCount);

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
                <Form.Control as='select' value={this.state.day} onChange={e => this.updateDay(e.target.value)}>
                  {
                    this.state.availableDays.map((v, i) => (
                      <option value={i}>{moment(v.date).format('dddd, MMMM Do')} at {v.Location.name}</option>
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
          {/* <p className='lead m-0'>Scheduled Appointments: {scheduledTotal+completedTotal}</p>
          <p className='lead m-0'>Completed Appointments: {completedTotal}</p>
          <p className='lead m-0'>Appointments Left: {scheduledTotal}</p> */}
        </Card.Body>
      </Card>
    );
    // const labels = [];
    // const scheduledValues = [];
    // const completedValues = [];
    // for(let i = this.state.starttime.clone();i.isBefore(this.state.endtime);i = i.add(this.state.window, 'minute')) {
    //   labels.push(i.format('H:mm'));
    //   scheduledValues.push(0);
    //   completedValues.push(0);
    // }

    // let scheduledTotal = 0;
    // let completedTotal = 0;
    // this.state.scheduled.forEach((v, i) => {
    //   const time = moment(v.time);
    //   const index = labels.indexOf(time.format('H:mm'));
    //   scheduledValues[index] = v.count;
    //   scheduledTotal += v.count;
    // });
    // this.state.completed.forEach((v, i) => {
    //   const time = moment(v.time);
    //   const index = labels.indexOf(time.format('H:mm'));
    //   completedValues[index] = v.count;
    //   completedTotal += v.count;
    // });
    // const data = {
    //   labels: labels,
    //   datasets: [
    //     {
    //       label: 'Number of scheduled appointments',
    //       backgroundColor: 'Tomato',
    //       borderWidth: 1,
    //       hoverBackgroundColor: 'Tomato',
    //       data: scheduledValues
    //     },
    //     {
    //       label: 'Number of completed appointments',
    //       backgroundColor: 'DodgerBlue',
    //       borderWidth: 1,
    //       hoverBackgroundColor: 'DodgerBlue',
    //       data: completedValues
    //     }
    //   ]
    // };
    // const chartOptions = {
    //   scales: {
    //     yAxes: [
    //       {
    //         stacked: true,
    //         ticks: {
    //           beginAtZero: true,
    //           max: this.state.buffer,
    //           stepSize: 1
    //         }
    //       }
    //     ],
    //     xAxes: [
    //       {
    //         stacked: true,
    //         gridLines: {
    //           display: false
    //         },
    //       }
    //     ]
    //   }
    // };

    // return (
    //   <Card>
    //     <Card.Body>
    //       <Form>
    //         <Row>
    //           <Col xs='auto'>
    //             <OverlayTrigger
    //               placement='top'
    //               delay={{ show: 200, hide: 50 }}
    //               overlay={props => <Tooltip {...props}>Refresh</Tooltip>}
    //             >
    //               <Button variant='light' className='border' onClick={this.refreshButton}>
    //                 <Spinner animation='border' role='status' className={''+(this.state.loading?'':'d-none')} size='sm'/>
    //                 <BsArrowClockwise className={''+(this.state.loading?'d-none':'')}/>
    //               </Button>
    //             </OverlayTrigger>
    //           </Col>
    //           <Col>
    //             <Form.Control as='select' value={this.state.day.format()} onChange={e => this.updateDay(e.target.value)}>
    //               {
    //                 this.state.availableDays.map(v => (
    //                   <option value={v.format()}>{v.format('dddd, MMMM Do')}</option>
    //                 ))
    //               }
    //             </Form.Control>
    //           </Col>
    //         </Row>
    //       </Form>
    //       <Bar
    //         data={data}
    //         options={chartOptions}
    //       />
    //       <p className='lead m-0'>Scheduled Appointments: {scheduledTotal+completedTotal}</p>
    //       <p className='lead m-0'>Completed Appointments: {completedTotal}</p>
    //       <p className='lead m-0'>Appointments Left: {scheduledTotal}</p>
    //     </Card.Body>
    //   </Card>
    // );
  }
}
