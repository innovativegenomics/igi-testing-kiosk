import React, { Component } from 'react';
import { Container, Table, Button, Row, Col, Form, Spinner, InputGroup } from 'react-bootstrap';
import moment from 'moment';

import { searchSlots, completeSlot } from '../../actions/adminActions';

export default class SlotSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      count: 0,
      page: 0,
      perpage: 25,
      success: false,
      search: '',
      loading: false,
    };
  }
  updateSearch = async v => {
    this.setState({search: v});
    const c = await this.runSearch(v, this.state.perpage, this.state.page);
  }
  runSearch = async (term, perpage, page) => {
    this.setState({loading: true});
    const res = await searchSlots(term, perpage, page);
    this.setState({...res, loading: false});
    return res.count;
  }
  markAsComplete = async uid => {
    await completeSlot(uid);
    await this.runSearch(this.state.search, this.state.perpage, this.state.page);
  }
  updatePage = async p => {
    this.setState({page: p});
    await this.runSearch(this.state.search, this.state.perpage, p);
  }
  updatePerPage = async c => {
    const page = (c*this.state.page>this.state.count?(Math.floor((this.state.count-c)/c)<0?0:Math.floor((this.state.count-c)/c)):this.state.page);
    this.setState({perpage: c, page: page});
    await this.runSearch(this.state.search, c, page);
  }
  componentDidMount = async () => {
    await this.runSearch(this.state.search, this.state.perpage, this.state.page);
  }
  render() {
    console.log(this.state);

    // const pageButtons = [];
    // for(let i = 0;i<this.state.count/this.state.perpage;i++) {
    //   pageButtons.push(
    //     <Pagination.Item key={i} active={this.state.page===i} onClick={e => this.updatePage(i)}>
    //       {i+1}
    //     </Pagination.Item>
    //   );
    // }

    const resultRows = [];
    this.state.results.forEach((v, i) => {
      resultRows.push(<tr key={i}>
        <td>{i+1+(this.state.page*this.state.perpage)}</td>
        <td>{v.calnetid}</td>
        <td>{v.name}</td>
        <td>{!!v.location?moment(v.time).format('dddd, MMMM D h:mm A'):'Week of '+moment(v.time).format('dddd, MMMM D')}</td>
        <td>{v.location}</td>
        <td>{!!v.completed?moment(v.completed).format('dddd, MMMM D h:mm A'):'Not Completed'}</td>
        {this.props.level>=10?
          <td><Button size='sm' className={!!v.location?'':'d-none'} variant={!!v.completed?'secondary':'primary'} onClick={e => this.markAsComplete(v.uid)} disabled={!!v.completed}>{!!v.completed?`Completed`:`Mark as Complete`}</Button></td>
          :
          <td></td>
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
            <Form.Label column sm={1} className='lead'>Page</Form.Label>
            <Col sm={2}>
              <InputGroup>
                <Button variant='light' disabled={this.state.page<=0} onClick={e => this.updatePage(this.state.page-1)}>{'<'}</Button>
                <Form.Control plaintext readOnly value={`${this.state.page+1} of ${Math.ceil(this.state.count/this.state.perpage)}`} className='text-center'/>
                <Button variant='light' disabled={this.state.page>=(this.state.count/this.state.perpage)-1} onClick={e => this.updatePage(this.state.page+1)}>{'>'}</Button>
              </InputGroup>
            </Col>
            <Form.Label column sm={2} className='lead'>Items per page</Form.Label>
            <Col sm={2}>
              <Form.Control as='select' onChange={e => this.updatePerPage(parseInt(e.target.value))} value={this.state.perpage}>
                <option>25</option>
                <option>50</option>
              </Form.Control>
            </Col>
          </Form.Group>
        </Form>
        <Table hover size='sm' responsive>
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
                <th></th>
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
