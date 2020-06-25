import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { getScheduledSlotsStat } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduled: [],
      loading: false,
      success: false,
      day: moment().get('day'),
    };
  }
  runScheduledStats = async m => {
    this.setState({loading: true});
    const res = await getScheduledSlotsStat(m);
    this.setState({...res, loading: false});
  }
  updateDay = async day => {
    this.setState({day: day});
    this.runScheduledStats(moment().set('day', day));
  }
  componentDidMount = () => {
    this.runScheduledStats(moment().set('day', this.state.day));
  }
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }
    
    const labels = [];
    const values = [];
    var scheduledCount = 0;
    var unscheduledCount = 0;
    if(!this.state.loading) {
      for(var i = this.state.starttime.clone();i.isBefore(this.state.endtime);i = i.add(this.props.settings.window, 'minute')) {
        labels.push(i.format('H:mm'));
        values.push(0);
      }

      this.state.scheduled.forEach((v, i) => {
        const time = moment(v.time);
        const index = labels.indexOf(time.format('H:mm'));
        values[index] = v.count;
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
          data: values
        }
      ]
    };
    const chartOptions = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              max: this.props.settings.buffer,
              stepSize: 1
            }
          }
        ],
        xAxes: [
          {
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
