import React, { Component } from 'react';
import { Card, Row, Col, Form, OverlayTrigger, Tooltip, Button, Spinner } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

import { getCompletionStat } from '../../../actions/adminActions';

export default class Completion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: null,
      res: []
    };
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const res = await getCompletionStat();
    this.setState({
      ...res,
      loading: false
    });
  }
  refreshButton = async () => {
    this.setState({loading: true});
    const res = await getCompletionStat();
    this.setState({
      ...res,
      loading: false
    });
  }
  render() {
    const data = {
      labels: this.state.res.map(v => moment(v.week).format('MMM Do')),
      datasets: [
        {
          label: 'Total available slots by week',
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
          data: this.state.res.map(v => v.total)
        },
        {
          label: 'Completed slots by week',
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
          data: this.state.res.map(v => v.completed)
        },
        {
          label: 'Slots not completed by week',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'Tomato',
          borderColor: 'Tomato',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'Tomato',
          // pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'Tomato',
          pointHoverBorderColor: 'Tomato',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 3,
          data: this.state.res.map(v => v.notCompleted)
        },
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
