import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Table, Button, Row, Col, Form, Spinner, InputGroup } from 'react-bootstrap';
import ContentEditable from 'react-contenteditable';
import moment from 'moment';

import { searchParticipants, updateUser } from '../../actions/adminActions';

class EditableBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value||'',
      oldValue: this.props.value||'',
      success: null,
    };
    this.tout = null;
  }
  onSave = async () => {
    if(this.state.value === this.state.oldValue) {
      return;
    }
    window.clearTimeout(this.tout);
    this.setState({success: null});
    const success = await this.props.onSave(this.state.value);
    let values = {};
    if(success) {
      values = {oldValue: this.state.value};
    } else {
      values = {value: this.state.oldValue};
    }
    this.setState({success: success, ...values});
    this.tout = window.setTimeout(() => {
      this.setState({success: null});
    }, 2000);
  }
  onFocus = () => {
    window.clearTimeout(this.tout);
    this.highlightAll();
    this.setState({success: null});
  }
  onChange = e => {
    const trimSpaces = string => (
      string
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
    );
    this.setState({value: trimSpaces(e.target.value)});
  }
  disableNewlines = (event) => {
    const keyCode = event.keyCode || event.which
  
    if (keyCode === 13) {
      event.returnValue = false
      if (event.preventDefault) event.preventDefault()
      event.target.blur();
    }
  }
  pasteAsPlainText = e => {
    e.preventDefault();
  
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  }
  highlightAll = () => {
    setTimeout(() => {
      document.execCommand('selectAll', false, null)
    }, 0)
  }
  componentDidUpdate = (prevProps, prevState) => {
    if(this.props.value !== prevProps.value) {
      this.setState({value: this.props.value || '', oldValue: this.props.value || ''});
    }
  }
  render() {
    return (
      <ContentEditable
        tagName='span'
        html={this.state.value}
        className={'p-1 ' + (this.state.success?'border rounded border-success':(this.state.success===false?'border rounded border-danger':''))}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onSave}
        onPaste={this.pasteAsPlainText}
        onKeyPress={this.disableNewlines}
      />
    );
  }
}

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
  updateUser = async (i, v) => {
    const { success } = await updateUser(this.state.results[i].calnetid, v);
    if(success) {
      const tmpRes = this.state.results;
      tmpRes[i] = {...tmpRes[i], ...v};
      this.setState({results: tmpRes});
      return true;
    } else {
      return false;
    }
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
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.firstname} onSave={nv => this.updateUser(i, {firstname: nv})}/>
          <EditableBox value={v.middlename} onSave={nv => this.updateUser(i, {middlename: nv})}/>
          <EditableBox value={v.lastname} onSave={nv => this.updateUser(i, {lastname: nv})}/>
        </td>
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.dob} onSave={nv => this.updateUser(i, {dob: nv})}/>
        </td>
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.email} onSave={nv => this.updateUser(i, {email: nv})}/>
        </td>
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.phone} onSave={nv => this.updateUser(i, {phone: nv})}/>
        </td>
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.sex} onSave={nv => this.updateUser(i, {sex: nv})}/>
        </td>
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.pbuilding} onSave={nv => this.updateUser(i, {pbuilding: nv})}/>
        </td>
        <td style={{whiteSpace: 'nowrap'}}>
          <EditableBox value={v.patientid} onSave={nv => this.updateUser(i, {patientid: nv})}/>
        </td>
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
