import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Table, Button, Row, Col, Form, Spinner, InputGroup } from 'react-bootstrap';
import moment from 'moment';

import { searchParticipants } from '../../actions/adminActions';

export default class Participants extends Component {
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
    const res = await searchParticipants(term, perpage, page);
    this.setState({...res, loading: false});
    return res.count;
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
    if(this.props.level < 20) {
      return <Redirect to='search' />;
    }

    const resultRows = [];
    this.state.results.forEach((v, i) => {
      resultRows.push(<tr key={i}>
        <td style={{whiteSpace: 'nowrap'}}>{i+1+(this.state.page*this.state.perpage)}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.calnetid}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.firstname} {v.middlename} {v.lastname}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.dob}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.email}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.phone}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.sex}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.pbuilding}</td>
        <td style={{whiteSpace: 'nowrap'}}>{v.patientid}</td>
        <td style={{whiteSpace: 'nowrap'}}>{moment(v.datejoined).format('YYYY-MM-DD h:mm A')}</td>
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
              <th>CalNet ID</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Sex</th>
              <th>Primary Building</th>
              <th>Patient ID</th>
              <th>Date Joined</th>
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
