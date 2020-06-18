import React, { Component } from 'react';
import { Container, Table, Button, Spinner, Modal, Row, Col, Form } from 'react-bootstrap';
import { validate as validateEmail } from 'email-validator';

import { getAdmins, removeAdmin, createAdmin, getAdminsPending } from '../../actions/adminActions';

class NewUserModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      level: 0,
    };
  }
  updateName = v => {
    this.setState({name: v});
  }
  updateEmail = v => {
    this.setState({email: v});
  }
  updateLevel = v => {
    this.setState({level: v});
  }
  render() {
    const valid = this.state.name !== '' && validateEmail(this.state.email);
    return (
      <Modal show={this.props.show} onHide={() => this.props.handleClose()} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Administrator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row} controlId='newAdminName'>
              <Form.Label column sm="2">
                Name
              </Form.Label>
              <Col sm={10}>
                <Form.Control type='text' placeholder='name' value={this.state.name} onChange={e => this.updateName(e.target.value)}/>
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='newAdminName'>
              <Form.Label column sm="2">
                Email
              </Form.Label>
              <Col sm={10}>
                <Form.Control type='email' placeholder='email' value={this.state.email} onChange={e => this.updateEmail(e.target.value)}/>
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='newAdminName'>
              <Form.Label column sm="2">
                Level
              </Form.Label>
              <Col sm={10}>
                <Form.Control as='select' value={this.state.level} onChange={e => this.updateLevel(parseInt(e.target.value))}>
                  <option>0</option>
                  <option>10</option>
                  <option>20</option>
                  <option>30</option>
                </Form.Control>
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={e => this.props.handleClose()}>
            Close
          </Button>
          <Button variant="primary" onClick={e => this.props.createNewUser(this.state.name, this.state.email, this.state.level)} disabled={!valid}>Create</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default class AdminUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      admins: [],
      adminsPending: [],
      adminsSuccess: false,
      adminsPendingSuccess: false,
      loading: false,
      showNewUser: false,
    };
  }
  createNewUser = async (name, email, level) => {
    await createAdmin(name, email, level);
    this.setState({showNewUser: false});
    await this.runGet();
  }
  removeAdmin = async uid => {
    await removeAdmin(uid);
    await this.runGet();
  }
  runGet = async () => {
    this.setState({loading: true});
    const admins = await getAdmins();
    const adminsPending = await getAdminsPending();
    this.setState({
      admins: admins.admins,
      adminsSuccess: admins.success,
      adminsPending: adminsPending.admins,
      adminsPendingSuccess: adminsPending.success,
      loading: false
    });
  }
  componentDidMount = async () => {
    await this.runGet();
  }
  render() {
    const adminRows = [];
    this.state.admins.forEach((v, i) => {
      adminRows.push(<tr key={i}>
        <td>{i+1}</td>
        <td>{v.name}</td>
        <td>{v.email}</td>
        <td>{v.level}</td>
        <td><Button size='sm' onClick={e => this.removeAdmin(v.uid)}>Remove</Button></td>
      </tr>);
    });

    const adminPendingRows = [];
    this.state.adminsPending.forEach((v, i) => {
      adminPendingRows.push(<tr key={i}>
        <td>{i+1}</td>
        <td>{v.name}</td>
        <td>{v.email}</td>
        <td>{v.level}</td>
        <td><Button size='sm' onClick={e => this.removeAdmin(v.uid)}>Remove</Button></td>
      </tr>);
    });

    return (
      <Container>
        <Button className='m-2' onClick={e => this.setState({showNewUser: true})}>Create new admin</Button>
        <Table size='sm' hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Admin Level</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            { adminRows }
          </tbody>
        </Table>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>

        <h2 className='font-weight-light mt-5'>Pending Administrators</h2>
        <Table size='sm' hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Admin Level</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            { adminPendingRows }
          </tbody>
        </Table>
        <div className='text-center'>
          <Spinner animation='border' role='status' className={this.state.loading?'':'d-none'}/>
        </div>

        <NewUserModal show={this.state.showNewUser} handleClose={() => this.setState({showNewUser: false})} createNewUser={this.createNewUser}/>
      </Container>
    );
  }
}
