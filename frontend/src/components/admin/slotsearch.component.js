import React, { Component } from 'react';
import { Container, Table, Button, Row, Col, Form, Spinner } from 'react-bootstrap';
import moment from 'moment';

import { searchSlots, completeSlot } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      success: false,
      sortBy: 'Appointment Time',
      sortOrder: 'asc',
      search: '',
      loading: false,
    };
  }
  updateSortBy = async v => {
    this.setState({sortBy: v});
    await this.runSearch(this.state.search, v, this.state.sortOrder);
  }
  updateSortOrder = async v => {
    this.setState({sortOrder: v});
    await this.runSearch(this.state.search, this.state.sortBy, v);
  }
  updateSearch = async v => {
    this.setState({search: v});
    await this.runSearch(v, this.state.sortBy, this.state.sortOrder);
  }
  runSearch = async (term, sort, order) => {
    this.setState({loading: true});
    const res = await searchSlots(term, sort, order);
    this.setState({...res, loading: false});
  }
  markAsComplete = async uid => {
    await completeSlot(uid);
    await this.runSearch(this.state.search, this.state.sortBy, this.state.sortOrder);
  }
  componentDidMount = async () => {
    await this.runSearch(this.state.search, this.state.sortBy, this.state.sortOrder);
  }
  render() {
    const resultRows = [];
    this.state.results.forEach((v, i) => {
      resultRows.push(<tr key={i}>
        <td>{i+1}</td>
        <td>{v.calnetid}</td>
        <td>{v.name}</td>
        <td>{!!v.location?moment(v.time).format('dddd, MMMM D h:mm A'):'Week of '+moment(v.time).format('dddd, MMMM D')}</td>
        <td>{v.location}</td>
        <td>{!!v.completed?moment(v.completed).format('dddd, MMMM D h:mm A'):'Not Completed'}</td>
        {this.props.level>=10?
          <td><Button size='sm' variant={!!v.completed?'secondary':'primary'} onClick={e => this.markAsComplete(v.uid)} disabled={!!v.completed}>{!!v.completed?`Completed`:`Mark as Complete`}</Button></td>
          :
          <br />
        }
      </tr>);
    });

    return (
      <Container className='mt-3'>
        <Form className='p-2'>
          <Form.Group as={Row} controlId='search-box'>
            <Form.Label column sm={1} className='lead'>Search</Form.Label>
            <Col sm={4}>
              <Form.Control placeholder='Search' value={this.state.search} onChange={e => this.updateSearch(e.target.value)} />
            </Col>
            {/* <Form.Label column sm={1} className='lead'>Sort By</Form.Label>
            <Col sm={3}>
              <Form.Control as='select' value={this.state.sortBy} onChange={e => this.updateSortBy(e.target.value)}>
                <option>Appointment Time</option>
                <option>First Name</option>
                <option>Last Name</option>
              </Form.Control>
            </Col>
            <Col sm={2}>
              <Form.Control as='select' value={this.state.sortOrder} onChange={e => this.updateSortOrder(e.target.value)}>
                <option value='asc'>Ascending</option>
                <option value='desc'>Descending</option>
              </Form.Control>
            </Col> */}
          </Form.Group>
        </Form>
        <Table hover size='sm'>
          <thead>
            <tr>
              <th>#</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Appointment Slot</th>
              <th>Appointment Location</th>
              <th>Completed</th>
              {this.props.level>=10?
                <th>Mark as Complete</th>
                :
                <br />
              }
            </tr>
          </thead>
          <tbody>
            { resultRows }
          </tbody>
        </Table>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>
      </Container>
    );
  }
}
