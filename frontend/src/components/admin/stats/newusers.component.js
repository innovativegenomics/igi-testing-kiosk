import React, { Component } from 'react';
import { Card, Row, Col, Form, OverlayTrigger, Tooltip, Button, Spinner } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

import { getNewUsersStat } from '../../../actions/adminActions';

export default class NewUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: null,
      newusers: []
    };
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const newusers = await getNewUsersStat();
    this.setState({
      ...newusers,
      loading: false
    });
  }
  refreshButton = async () => {
    this.setState({loading: true});
    const newusers = await getNewUsersStat();
    this.setState({
      ...newusers,
      loading: false
    });
  }
  render() {
    const totals = [];
    this.state.newusers.forEach((v, i) => {
      if(i===0) {
        totals.push(v.count);
      } else {
        totals.push(totals[i-1]+v.count);
      }
    });

    const data = {
      labels: this.state.newusers.map(v => moment(v.date).format('MMM Do')),
      datasets: [
        {
          label: 'Total users over time',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'MediumSeaGreen',
          borderColor: 'MediumSeaGreen',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'MediumSeaGreen',
          // pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'MediumSeaGreen',
          pointHoverBorderColor: 'MediumSeaGreen',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 3,
          data: totals
        },
        {
          label: 'New users per day',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'DodgerBlue',
          borderColor: 'DodgerBlue',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'DodgerBlue',
          // pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'DodgerBlue',
          pointHoverBorderColor: 'DodgerBlue',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 3,
          data: this.state.newusers.map(v => v.count)
        }
      ]
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
            </Row>
          </Form>
          <Line data={data}/>
        </Card.Body>
      </Card>
    );
  }
}
