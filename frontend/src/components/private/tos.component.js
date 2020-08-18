import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Row, Col, ButtonGroup } from 'react-bootstrap';
import { Document, Page } from 'react-pdf';

class Question extends Component {
  render() {
    console.log(this.props.selected)
    return (
      <div className='row pt-2 pb-2'>
        <div className='col-lg-8'>
          <p className='m-0'>{this.props.children}</p>
        </div>
        <div className='col-lg-2'>
          <div className='btn-group'>
            <button className={`btn ${(this.props.selected === true) ? 'btn-primary' : 'btn-secondary'}`} onClick={e => this.props.select(true)}>Yes</button>
            <button className={`btn ${(this.props.selected === false) ? 'btn-primary' : 'btn-secondary'}`} onClick={e => this.props.select(false)}>No</button>
            {this.props.notApplicable?
              <button className={`btn ${(this.props.selected === null) ? 'btn-primary' : 'btn-secondary'}`} onClick={e => this.props.select(null)}>Not Applicable</button>
              :
              undefined
            }
          </div>
        </div>
      </div>
    );
  }
}

class ToSQuestions extends Component {
  render() {
    return (
      <div>
        <p className='lead text-center'>Consent</p>
        <p>
          You will be emailed a copy of this consent form and <a href={`${process.env.PUBLIC_URL}/pdfs/informedConsentEnglish.pdf`} rel='noopener noreferrer' target='_blank'>Medical Research Subject’s Bill of Rights</a>, which
                    will also be available on this webpage.
        </p>
        <p>
          Please read each sentence below and think about your choice. After reading each sentence, select either
          the “yes”, “no”, or "not applicable" (for #5 only) box. No matter what you decide, it will not affect your ability to return to campus.
        </p>
        <Question selected={this.props.questions[0]} select={v => this.props.select(0, v)}>
          My saliva samples and associated data may be used to detect SARS-CoV-2 infection. I consent
          to be contacted with my results. These results are for research purposes only and will not
          become part of my medical health record; however, they may be securely communicated to
          University Health Services or primary care clinicians you direct us to if the result is of
          clinical or public health concern.
        </Question>
        <Question selected={this.props.questions[1]} select={v => this.props.select(1, v)}>
          I consent for data I enter into this consent form, the study enrollment form, or this study’s
          scheduling system to be used for this research study on COVID-19.
        </Question>
        <Question selected={this.props.questions[2]} select={v => this.props.select(2, v)}>
          I consent for data I enter into this consent form, the study enrollment form, or this study's
          scheduling system to be used for future COVID-19 research by this group or others. Data will be
          de-identified prior to use in any future COVID-19 research by this group or others.
        </Question>
        <Question selected={this.props.questions[3]} select={v => this.props.select(3, v)}>
          Someone may contact me in the future to ask me to take part in more research.
        </Question>
        <Question selected={this.props.questions[4]} select={v => this.props.select(4, v)} notApplicable>
          I am also enrolled or plan to enroll in the UC Berkeley School of Public Health <a href='https://safecampus.covid.berkeley.edu/' target='_blank'>Safe Campus Study</a> and 
          give my consent to the IGI FAST Study to share identifiable data related to my samples
          (including results, frequency of my appointments, amount of time I report spending on campus,
          and demographic information) with the Safe Campus Study investigators. These data will be
          transmitted securely using a SharePoint server accessible to only the Safe Campus Study and IGI
          FAST Study investigators. The purpose of sharing these data will be to improve the understanding
          of asymptomatic epidemiology within the UC Berkeley campus community.
        </Question>
      </div>
    );
  }
}

class ToS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      pages: 0,
      page: 1,
      language: 'English'
    };
    this.widthRef = React.createRef();
  }
  setWidth = () => {
    this.setState({width: this.widthRef.current.clientWidth});
  }
  componentDidMount() {
    this.setWidth();
    const setWidthLoad = () => {
      this.setWidth();
      window.removeEventListener('load', setWidthLoad);
    };
    window.addEventListener('load', setWidthLoad);
    window.addEventListener('resize', this.setWidth);
  }
  componentWillUnmount = () => {
    window.removeEventListener('resize', this.setWidth);
  }
  render() {
    return (
      <div ref={this.widthRef}>
        <Row className='text-center'>
          <Col>
            <ButtonGroup>
              <Button variant='light' onClick={e => this.setState({page: this.state.page-1})} disabled={this.state.page <= 1}>{'<'}</Button>
              <p className='lead p-2 m-0'>Page {this.state.page} of {this.state.pages}</p>
              <Button variant='light' onClick={e => this.setState({page: this.state.page+1})} disabled={this.state.page >= this.state.pages}>{'>'}</Button>
            </ButtonGroup>
          </Col>
          <Col>
            <Button variant='light' onClick={e => this.setState({language: 'Spanish'})}>Ver en español</Button>
          </Col>
        </Row>
        <Document file={`/pdfs/informedConsent${this.state.language}.pdf`} onLoadSuccess={({numPages}) => this.setState({pages: numPages})}>
          <Page pageNumber={this.state.page} width={this.state.width}/>
        </Document>
      </div>
    );
  }
}

export default class ToSModal extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} backdrop='static' keyboard={false} size='lg'>
        <Modal.Header>
          <Modal.Title>
            CONSENT TO PARTICIPATE IN RESEARCH
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ToS />
          <ToSQuestions questions={this.props.questions} select={this.props.select} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={this.props.onAccept}>I Agree</Button>
          <Button variant='secondary' onClick={this.props.onClose}>Disagree</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ToSModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired
}
