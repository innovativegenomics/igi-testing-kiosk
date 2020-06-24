import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { getScheduledSlotsStat, getSettings } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduled: [],
      settings: null,
      loading: false,
      success: false,
      day: null,
      starttime: moment().startOf('hour').set('hour', 12),
      endtime: moment().startOf('hour').set('hour', 16).set('minute', 40),
    };
  }
  runScheduledStats = async (starttime, endtime) => {
    this.setState({loading: true});
    const res = await getScheduledSlotsStat(starttime, endtime);
    this.setState({...res, loading: false});
  }
  updateDay = async day => {
    const newStarttime = this.state.starttime.clone().set('day', day);
    const newEndtime = this.state.endtime.clone().set('day', day);
    this.setState({day: day, starttime: newStarttime, endtime: newEndtime});
    this.runScheduledStats(newStarttime, newEndtime);
  }
  componentDidMount = () => {
    this.runScheduledStats(this.state.starttime, this.state.endtime);
    getSettings().then(res => {
      if(res.success) {
        this.setState({settings: res.settings, day: res.settings.days[0], starttime: moment().startOf('week').set('day', res.settings.days[0]).set('hour', res.settings.starttime).set('minute', res.settings.startminute), endtime: moment().startOf('week').set('day', res.settings.days[0]).set('hour', res.settings.endtime).set('minute', res.settings.endminute)});
      }
    });
  }
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    } else if(!this.state.settings) {
      return (
        <div>
          <Spinner animation='border' role='status' className='position-absolute' size='sm' style={{left: '40vw', top: '40vh', width: '20vw', height: '20vw', borderWidth: '4vw', animationDuration: '4.5s'}} />
        </div>
      );
    }
    
    const labels = [];
    const values = [];
    var scheduledCount = 0;
    var unscheduledCount = 0;
    if(!this.state.loading) {
      for(var i = this.state.starttime.clone();i.isBefore(this.state.endtime);i = i.add(this.state.settings.window, 'minute')) {
        console.log(i.format('H:mm'));
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
      ],
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
                      <Form.Control as='select' value={(this.state.day?this.state.day:this.state.settings.days[0])} onChange={e => this.updateDay(parseInt(e.target.value))}>
                        {this.state.settings.days.map(v => (
                          <option key={v} value={v}>{moment().set('day', v).format('dddd')}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Row>
                </Form>
                <Bar
                  data={data}
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
