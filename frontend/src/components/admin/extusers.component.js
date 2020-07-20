import React, { Component } from 'react';
import { Container, Table, Form, Row, Col, Button, Spinner, Modal } from 'react-bootstrap';

import { getExternalUsers, approveExternalUser, rejectExternalUser } from '../../actions/adminActions';

export default class ExtUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      success: null,
      loading: false,
      extUsers: [],
      showDetailModal: false,
      selectedIndex: 0
    };
  }
  approveUser = async uid => {
    await approveExternalUser(uid);
    this.setState({loading: true});
    const res = await getExternalUsers(this.state.search);
    this.setState({
      ...res,
      loading: false
    });
  }
  rejectUser = async uid => {
    await rejectExternalUser(uid);
    this.setState({loading: true});
    const res = await getExternalUsers(this.state.search);
    this.setState({
      ...res,
      loading: false
    });
  }
  runSearch = async e => {
    this.setState({search: e.target.value, loading: true});
    const res = await getExternalUsers(e.target.value);
    this.setState({
      ...res,
      loading: false
    });
  }
  componentDidMount = async () => {
    this.setState({loading: true});
    const res = await getExternalUsers(this.state.search);
    this.setState({
      ...res,
      loading: false
    });
  }
  render() {
    const selected = this.state.extUsers[this.state.selectedIndex]||{};
    return (
      <Container>
        <Form className='mt-3'>
          <Form.Group as={Row}>
            <Form.Label column sm={1} className='lead'>Search</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' value={this.state.search} onChange={this.runSearch}/>
            </Col>
          </Form.Group>
        </Form>
        <Table hover size='sm' responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Job Description</th>
              <th>Employer</th>
              <th>Work Frequency</th>
              <th>Approve</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.extUsers.map((v, i) => (
                <tr key={v.uid} style={{cursor: 'pointer'}}>
                  <td style={{whiteSpace: 'nowrap'}} onClick={e => this.setState({selectedIndex: i, showDetailModal: true})}>{i+1}</td>
                  <td style={{whiteSpace: 'nowrap'}} onClick={e => this.setState({selectedIndex: i, showDetailModal: true})}>{v.name}</td>
                  <td style={{whiteSpace: 'nowrap'}} onClick={e => this.setState({selectedIndex: i, showDetailModal: true})}>{v.email}</td>
                  <td style={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '8rem'}} onClick={e => this.setState({selectedIndex: i, showDetailModal: true})}>{v.jobDescription}</td>
                  <td style={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '6rem'}} onClick={e => this.setState({selectedIndex: i, showDetailModal: true})}>{v.employer}</td>
                  <td style={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '6rem'}} onClick={e => this.setState({selectedIndex: i, showDetailModal: true})}>{v.workFrequency}</td>
                  <td style={{whiteSpace: 'nowrap'}}>
                    {(v.approved)?
                      <Button size='sm' variant='secondary' disabled>Approved</Button>
                      :
                      <div>
                        <Button size='sm' onClick={e => this.approveUser(v.uid)}>Approve</Button>
                        <Button size='sm' variant='danger' className='ml-1' onClick={e => this.rejectUser(v.uid)}>Reject</Button>
                      </div>
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>
        <Modal show={this.state.showDetailModal} onHide={() => this.setState({showDetailModal: false})} size='lg'>
          <Modal.Header closeButton>
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col lg={3}><u>Full Name</u></Col>
              <Col>
                <p>
                  {selected.name}
                </p>
              </Col>
            </Row>
            <Row>
              <Col lg={3}><u>Email</u></Col>
              <Col>
                <p>
                  {selected.email}
                </p>
              </Col>
            </Row>
            <Row>
              <Col lg={3}><u>Job Description</u></Col>
              <Col>
                <p>
                  {selected.jobDescription}
                </p>
              </Col>
            </Row>
            <Row>
              <Col lg={3}><u>Employer</u></Col>
              <Col>
                <p>
                  {selected.employer}
                </p>
              </Col>
            </Row>
            <Row>
              <Col lg={3}><u>Work Frequency</u></Col>
              <Col>
                <p>
                  {selected.workFrequency}
                </p>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => this.setState({showDetailModal: false})}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}
