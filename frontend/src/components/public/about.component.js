import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

import { getUser } from '../../actions/authActions';

import './about.css';
import Navbar from '../navbar.component';

export default class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: {
        user: {},
        loaded: false,
        unauthed: false,
        success: false
      },
    };
  }
  componentDidMount = async () => {
    getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
  }
  render() {
    return (
      <div>
        <Navbar authed={!this.state.auth.unauthed}/>
        <Container>
          <p className='display-4 text-center'>IGI FAST: Free Asymtomatic Saliva Testing</p>
          <p>
            Community spread of COVID-19 is likely exacerbated by transmission from people who
            are infected, but don’t display any symptoms. Regular surveillance testing of these
            asymptomatic individuals can help to mitigate this spread. As a UC Berkeley employee
            approved to work on campus during the pandemic, you are invited to participate in a
            study that provides regular asymptomatic testing using an experimental saliva-based
            test for COVID-19 on the UC Berkeley campus.
          </p>
          <p>
            For more information and to enroll, see <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a> or contact the study
            coordinator at <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a>.
          </p>
          <p className='lead'><b>How do I schedule my tests?</b></p>
          <p>
            All test scheduling will be done on the study website at <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a>. You will
            be assigned to a regular testing schedule and will receive an email on the week you are
            to be tested inviting you to schedule your test day, time, and location
          </p>
          <p className='lead'><b>Where will testing happen?</b></p>
          <p>
            Tent kiosks are being set up around the UC Berkeley campus. Directions to your kiosk
            will be included in the email and text message confirming your appointment.
          </p>
          <p className='lead'><b>What do I need for my appointment?</b></p>
          <ul>
            <li>
              Appointment barcode - You will receive an email with an appointment barcode.
              Either print this out or bring it on your phone to present at the testing kiosk.
            </li>
            <li>
              Campus clearance message - As with all campus activities, you must complete
              the campus symptom screener before coming to campus. You will be asked to
              present the clearance message at the testing kiosk. If you do not pass this
              screener (i.e. you have symptoms), you should not come to a kiosk for testing
              and instead contact UHS at <a href='tel:+15106437197'>510-643-7197</a>.
            </li>
            <li>
              Eating and drinking - Do not eat or drink anything including gum and water, and
              do not smoke, for 30 minutes prior to your appointment.
            </li>
          </ul>
          <p className='lead'><b>What will happen at my appointment?</b></p>
          <p>
            You will present your appointment barcode and campus clearance message to the kiosk
            personnel. You will be given an OMNIgene saliva collection kit which you will spit into
            and close. You will be instructed to scan the barcode on this kit and sanitize it and your
            hands with hand sanitizer. You will then hand in your kit.
          </p>
          <p>
            If you are concerned about being able to perform the procedure due to disability or other
            physical limitations, please contact the study coordinator at <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a> as
            soon as possible.
          </p>
          <p className='lead'><b>How will I get my results?</b></p>
          <p>
            The test you are getting through this study has not yet received FDA approval for use.
            Because of this, any positive or inconclusive results must be confirmed by an FDA
            approved test. If SARS-CoV-2, the virus causing COVID-19, is detected in your sample
            or the test result is inconclusive, you will be contacted via both phone call and encrypted
            email by the study clinician, who will give you this information, recommend that you
            self-isolate, and provide instructions explaining how to get clinical testing at University
            Health Services.
          </p>
          <p>
            If SARS-CoV-2 is not detected in your sample, you will be notified via encrypted email
            only. Because <b>this test is experimental, we cannot guarantee that an individual
            with a negative test result is truly negative for SARS-CoV-2.</b> You should take this
            result with caution, continue to monitor yourself for symptoms, maintain social
            distancing, wear a mask or face covering any time you are outside or on campus
            (including inside campus buildings), and complete the campus screening questionnaire
            before coming to work.
          </p>
          <p>
            No results from this study will enter into your medical record.
          </p>
        </Container>
      </div>
    );
  }
}
