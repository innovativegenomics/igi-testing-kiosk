import React, { Component } from 'react';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { searchSlots, getSettings } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      settings: null,
      loading: false,
      success: false,
      day: null,
    };
  }
  runSearch = async (term, sort, order) => {
    this.setState({loading: true});
    const res = await searchSlots(term, sort, order);
    this.setState({...res, loading: false});
  }
  componentDidMount = () => {
    this.runSearch('', 'Appointment Time', 'asc');
    getSettings().then(res => {
      if(res.success) {
        this.setState({settings: res.settings});
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
    var unscheduledCount = 0;
    if(!this.state.loading) {
      for(var i = moment().set('day', this.state.day||this.state.settings.days[0]).set('hour', this.state.settings.starttime).set('minute', this.state.settings.startminute);i.isBefore(moment().set('day', this.state.day||this.state.settings.days[0]).set('hour', this.state.settings.endtime).set('minute', this.state.settings.endminute));i = i.add(this.state.settings.window, 'minute')) {
        labels.push(i.format('H:mm'));
        values.push(0);
      }

      this.state.results.forEach((v, i) => {
        const time = moment(v.time);
        const index = labels.indexOf(time.format('H:mm'));
        if(time.hour() === 0) {
          unscheduledCount ++;
          return;
        } else if(time.day() === (this.state.day?this.state.day:this.state.settings.days[0])) {
          values[index]++;
        }
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
          <Col md>
            <Form>
              <Row>
                <Col>
                  <Form.Control as='select' value={(this.state.day?this.state.day:this.state.settings.days[0])} onChange={e => this.setState({day: parseInt(e.target.value)})}>
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
            <p className='lead'>Unscheduled Appointments: {unscheduledCount}</p>
            <div className={this.state.loading?'':'d-none'}>
              <div className='position-absolute d-block bg-secondary' style={{width: '100%', height: '100%', top: '0px', left: '0px', opacity: 0.3}}></div>
              <Spinner animation='border' role='status' className='position-absolute d-block' style={{top: '50%', left: '50%'}}/>
            </div>
          </Col>
          <Col md>
          </Col>
        </Row>
      </Container>
    );
  }
}
