import React, { Component } from 'react';
import {  Redirect } from 'react-router-dom';
import { Container, Spinner, Card, Row, Col, ButtonGroup, Button, Form, Alert } from 'react-bootstrap';

import { reconsentUser } from '../../actions/authActions';

class Question extends Component {
  render() {
    return (
      <Row className='mb-3'>
        <Col lg='8'>
          {this.props.children}
        </Col>
        <Col lg className='m-auto'>
          <ButtonGroup>
            <Button variant={this.props.value===true?`primary`:`secondary`} onClick={e => this.props.onChange(true)}>Yes</Button>
            <Button variant={this.props.value===false?`primary`:`secondary`} onClick={e => this.props.onChange(false)}>No</Button>
            {this.props.na?
              <Button variant={this.props.value===null?`primary`:`secondary`} onClick={e => this.props.onChange(null)}>Not applicable</Button>
              :
              undefined
            }
          </ButtonGroup>
        </Col>
      </Row>
    );
  }
}

export default class Reconsent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: this.props.auth.user.questions,
      submitted: false,
      submitting: false,
      error: false
    };
  }
  submit = async () => {
    this.setState({submitting: true});
    const { success } = await reconsentUser(this.state.questions);
    this.props.updateUser({
      reconsented: true
    });
    this.setState({submitting: false, submitted: success, error: !success});
  }
  componentDidUpdate = (prevProps, prevState) => {
    try {
      if(this.props.auth.user.questions !== prevProps.auth.user.questions) {
        const qs = this.props.auth.user.questions;
        this.setState({questions: qs});
      }
    } catch(err) {
      
    }
  }
  render() {
    if(this.state.submitted) {
      return <Redirect to='/dashboard' />;
    }

    if (!this.props.auth.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (this.props.auth.unauthed) {
      window.open(`/api/users/login?returnTo=${encodeURIComponent('https://igi-fast.berkeley.edu/reconsent')}`, '_self');
      return <div/>;
    } else if(!this.state.questions) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (!this.props.auth.success) {
      return <Redirect to='/newuser' />;
    }

    if(this.props.auth.user.reconsented) {
      return <Redirect to='/dashboard' />;
    }

    return (
      <Container>
        <Row>
          <Col lg='1'/>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Reconsent</Card.Title>
                <p>
                  We have updated our informed consent document, and are offering you a chance to review it
                  and make changes or additions to your responses below. If you don't want to change any of
                  your answers, just click <i>Confirm</i> to accept the new consent document. If you have
                  any questions or concerns, please email Alex Ehrenberg, the study coordinator, at <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a>.
                </p>
                <p>
                  Click <a href={`${process.env.PUBLIC_URL}/pdfs/informedConsentEnglish.pdf`} target='_blank'>here</a> to
                  view the updated informed consent document. Haga clic <a href={`${process.env.PUBLIC_URL}/pdfs/informedConsentSpanish.pdf`} target='_blank'>aquí</a> para ver el documento en español.
                </p>
                <p className='lead'>Questions</p>
                <Question value={this.state.questions[0]} onChange={v => {const tmp = this.state.questions; tmp[0]=v; this.setState({questions: tmp})}}>
                  My saliva samples and associated data may be used to detect SARS-CoV-2 infection. 
                  I consent to be contacted with my results. These results are for research purposes 
                  only and will not become part of my medical health record.
                </Question>
                <Question value={this.state.questions[1]} onChange={v => {const tmp = this.state.questions; tmp[1]=v; this.setState({questions: tmp})}}>
                  I consent for data I enter into this consent form, the study enrollment form, or this study’s 
                  scheduling system to be used for this research study on COVID-19.
                </Question>
                <Question value={this.state.questions[2]} onChange={v => {const tmp = this.state.questions; tmp[2]=v; this.setState({questions: tmp})}}>
                  I consent for data I enter into this consent form, the study enrollment form, or this study's 
                  scheduling system to be used for future COVID-19 research by this group or others. Data will be 
                  de-identified prior to use in any future COVID-19 research by this group or others.
                </Question>
                <Question value={this.state.questions[3]} onChange={v => {const tmp = this.state.questions; tmp[3]=v; this.setState({questions: tmp})}}>
                  Someone may contact me in the future to ask me to take part in more research.
                </Question>
                <Question value={this.state.questions[4]} onChange={v => {const tmp = this.state.questions; tmp[4]=v; this.setState({questions: tmp})}} na>
                  I am also enrolled or plan to enroll in the UC Berkeley School of Public Health <a href='https://safecampus.covid.berkeley.edu/' target='_blank'>Safe Campus Study</a> and 
                  give my consent to the IGI FAST Study to share identifiable data related to my samples 
                  (including results, frequency of my appointments, amount of time I report spending on campus, 
                  and demographic information) with the Safe Campus Study investigators. These data will be 
                  transmitted securely using a SharePoint server accessible to only the Safe Campus Study and 
                  IGI FAST Study investigators. The purpose of sharing these data will be to improve the 
                  understanding of asymptomatic epidemiology within the UC Berkeley campus community.
                </Question>
                <Form className='border-top pt-3'>
                  <Button onClick={this.submit} disabled={this.state.submitting}>Confirm</Button>
                </Form>
                {this.state.error?
                  <Alert variant='danger' className='mb-0 mt-3'>
                    There was an issue submitting your responses, please try again!
                  </Alert>
                  :
                  undefined
                }
              </Card.Body>
            </Card>
          </Col>
          <Col lg='1'/>
        </Row>
      </Container>
    );
  }
}
