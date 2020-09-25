import React, { Component } from 'react';
import { Card, Row, Col, Form, OverlayTrigger, Tooltip, Button, Spinner } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

import { getAffiliationStat } from '../../../actions/adminActions';

export default class Affiliation extends Component {
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
    const res = await getAffiliationStat();
    this.setState({
      ...res,
      loading: false
    });
  }
  refreshButton = async () => {
    this.setState({loading: true});
    const res = await getAffiliationStat();
    this.setState({
      ...res,
      loading: false
    });
  }
  render() {
    const data = {
      labels: this.state.res.map(v => v.affiliation),
      datasets: [
        {
          label: 'Participants',
          backgroundColor: 'MediumSeaGreen',
          hoverBackgroundColor: 'MediumSeaGreen',
          data: this.state.res.map(v => v.count)
        },
      ]
    };
    const options = {
      // plugins: {
      //   datalabels: {
      //     formatter: (value, ctx) => {
      //       let sum = 0;
      //       let dataArr = ctx.chart.data.datasets[0].data;
      //       dataArr.map(data => {
      //         sum += data;
      //       });
      //       let percentage = (value*100 / sum).toFixed(2)+"%";
      //       return percentage;
      //     },
      //     color: '#fff',
      //   }
      // }
    };
    const plugins = [];

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
          <Bar data={data} options={options} plugins={plugins}/>
        </Card.Body>
      </Card>
    );
  }
}
