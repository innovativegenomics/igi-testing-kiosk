import React, { Component } from 'react';
import { Card, Row, Col, Form, OverlayTrigger, Tooltip, Button, Spinner } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Doughnut } from 'react-chartjs-2';

import { getScheduledParticipantsStat, getUnscheduledParticipantsStat } from '../../../actions/adminActions';

export default class Slots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      scheduled: 0,
      unscheduled: 0,
    };
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const [scheduled, unscheduled] = await Promise.all([getScheduledParticipantsStat(), getUnscheduledParticipantsStat()]);
    this.setState({
      scheduled: scheduled.scheduled,
      unscheduled: unscheduled.unscheduled,
      loading: false
    });
  }
  refreshButton = async () => {
    this.setState({loading: true});
    const [scheduled, unscheduled] = await Promise.all([getScheduledParticipantsStat(), getUnscheduledParticipantsStat()]);
    this.setState({
      scheduled: scheduled.scheduled,
      unscheduled: unscheduled.unscheduled,
      loading: false
    });
  }
  render() {
    const data = {
      datasets: [{
        data: [this.state.scheduled, this.state.unscheduled],
        backgroundColor: [
          '#FF6384',
          '#36A2EB'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB'
        ]
      }],
      labels: [
        'Scheduled',
        'Unscheduled'
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
          <Doughnut data={data}/>
          <p className='lead m-0'>Total Participants: {this.state.scheduled+this.state.unscheduled}</p>
        </Card.Body>
      </Card>
    );
  }
}
