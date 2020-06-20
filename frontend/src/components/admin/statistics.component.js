import React, { Component } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { searchSlots } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: [],
      values: [],
      results: [],
      loading: false,
      success: false,
    };
  }
  runSearch = async (term, sort, order) => {
    this.setState({loading: true});
    const res = await searchSlots(term, sort, order);
    this.setState({...res, loading: false});
  }
  componentDidMount = async () => {
    await this.runSearch('', 'Appointment Time', 'asc');
  }
  render() {
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }
    
    const labels = [];
    const values = [];
    if(!this.state.loading) {
      this.state.results.forEach((v, i) => {
        const label = moment(v.time).format('H:mm');
        const index = labels.indexOf(label);
        if(index >= 0) {
          values[index]++;
        } else {
          labels.push(label);
          values.push(1);
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
      ]
    };

    return (
      <Container className='mt-3'>
        <Row>
          <Col md>
            <Bar
              data={data}
            />
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
