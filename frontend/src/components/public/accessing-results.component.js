import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

import { TrackedLink } from '../../tracker';

import unlockMessage from '../../media/accessing-results/unlockMessage.png';
import confirmEmail from '../../media/accessing-results/confirmEmail.png';
import useAnotherEmail from '../../media/accessing-results/useAnotherEmail.png';
import enterEmail from '../../media/accessing-results/enterEmail.png';
import howToVerify from '../../media/accessing-results/howToVerify.png';
import verificationCode from '../../media/accessing-results/verificationCode.png';
import enterCode from '../../media/accessing-results/enterCode.png';

export default class AccessingResults extends Component {
  render() {
    return (
      <div>
        <Container>
          <p className='display-4 text-center'>Accessing Results</p>
          <p>
            All results will be sent to the email you used to register for this study using Virtru encryption.
            Please make sure to look for emails from <TrackedLink ext to='mailto:igi-fast@berkeley.edu' action='accessing-results email 1'>igi-fast@berkeley.edu</TrackedLink> with the subject line “Your IGI
            FAST Study Result” each week you get tested.
          </p>
          <p>
            You may also receive a phone call from a blocked or unknown number if your sample tests
            positive or inconclusive.
          </p>
          <p>
            Virtru is an email encryption service that we use to securely communicate your data to you.
            While it can be frustrating to have to go through extra steps to read the message, it is important
            that we protect your information. In most cases, you will only need to complete the below steps
            once. If you have cookies disabled or use alias emails, you may need to complete these steps
            multiple times.
          </p>
          <p>
            When you get a Virtru-encypted email, it will look like this:
          </p>
          <Row>
            <Col lg='4'>
              <Card>
                <Card.Img variant='top' src={unlockMessage}/>
              </Card>
            </Col>
          </Row>
          <p>
            Selecting “Unlock Message” will open a new page that looks like
            this:
          </p>
          <Row>
            <Col lg='7'>
              <Card>
                <Card.Img variant='top' src={confirmEmail}/>
              </Card>
            </Col>
          </Row>
          <p>
            or
          </p>
          <Row>
            <Col lg='7'>
              <Card>
                <Card.Img variant='top' src={useAnotherEmail}/>
              </Card>
            </Col>
          </Row>
          <p>
            If your email does not appear, select “Use another email address” and type in the email you
            registered for the IGI FAST study with:
          </p>
          <Row>
            <Col lg='7'>
              <Card>
                <Card.Img variant='top' src={enterEmail}/>
              </Card>
            </Col>
          </Row>
          <p>
            When you hit submit, it will typically prompt you to sign in with Google:
          </p>
          <Row>
            <Col lg='7'>
              <Card>
                <Card.Img variant='top' src={howToVerify}/>
              </Card>
            </Col>
          </Row>
          <p>
            If you do not wish to sign in with Google, you can click “Or sign-in with a one-time verification
            link.” Virtru will email you a verification code.
          </p>
          <p>
            In some rare cases, like when cookies are disabled in your browser, you will not have the
            option to log in with Google, and Virtru will automatically email you a verification code.
          </p>
          <p>
            Enter the code into the blank spaces that appear:
          </p>
          <Row>
            <Col lg='4'>
              <Card>
                <Card.Img variant='top' src={verificationCode}/>
              </Card>
            </Col>
            <Col lg='7'>
              <Card>
                <Card.Img variant='top' src={enterCode}/>
              </Card>
            </Col>
          </Row>
          <p>
            Once you complete these steps, you will be logged in and can read the secure message with your
            results. You can also reply to us through the encrypted service in this window.
          </p>
          <p>
            For more details on using Virtru to get these results, please see <TrackedLink ext to='https://support.virtru.com/hc/en-us/articles/115012284147' action='virtru support'>https://support.virtru.com/hc/en-us/articles/115012284147</TrackedLink>.
          </p>
          <p>
            The test you are getting through this study has not yet received FDA approval for use. Because of this,
            any positive or inconclusive results must be confirmed by an FDA approved test. If SARS-CoV-2, the
            virus causing COVID-19, is detected in your sample or the test is inconclusive, you will be contacted via
            both phone and encrypted email by the study clinician. They will give you this information, recommend
            that you self-isolate, and provide instructions explaining how to get clinical testing at University Health
            Services.
          </p>
          <p>
            If SARS-CoV-2 is not detected in your sample, you will be notified via encrypted email only. Remember
            that this test is experimental and we cannot guarantee that an individual with a negative test result is
            truly negative for SARS-CoV-2. You should take this result with caution, continue to monitor yourself for
            symptoms, maintain social distancing, wear a mask or face covering any time you are outside or on
            campus (including inside campus buildings), and complete the campus screening questionnaire before
            coming to work.
          </p>
          <p>
            No results from this study will enter into your medical record.
          </p>
          <p>
            If you have issues accessing your results through the protocol listed here, please contact the study
            coordinator at <TrackedLink ext to='mailto:igi-fast@berkeley.edu' action='accessing-results email 2'>igi-fast@berkeley.edu</TrackedLink>.
          </p>
        </Container>
      </div>
    );
  }
}
