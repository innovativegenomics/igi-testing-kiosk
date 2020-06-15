import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';
import billOfRights from '../../media/IGI_Healthy_Campus_Study_Bill_of_Rights.pdf';

class Question extends Component {
  render() {
    return (
      <div className='row pt-2 pb-2'>
        <div className='col-md-10'>
          <p className='m-0'>{this.props.children}</p>
        </div>
        <div className='col-1'>
          <div className='btn-group'>
            <button className={`btn ${(this.props.selected === true) ? 'btn-primary' : 'btn-secondary'}`} onClick={e => this.props.select(true)}>Yes</button>
            <button className={`btn ${(this.props.selected === false) ? 'btn-primary' : 'btn-secondary'}`} onClick={e => this.props.select(false)}>No</button>
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
          You will be emailed a copy of this consent form and <a href={billOfRights} rel='noopener noreferrer' target='_blank'>Medical Research Subject’s Bill of Rights</a>, which
                    will also be available on this webpage.
                </p>
        <p>
          Please read each sentence below and think about your choice. After reading each sentence, select either
          the “yes” or “no” box. No matter what you decide, it will not affect your ability to return to campus.
                </p>
        <Question selected={this.props.questions[0]} select={v => this.props.select(0, v)}>
          My saliva samples and associated data may be used to detect SARS-CoV-2 infection. I consent to
          be contacted with my results. These results are for research purposes only and will not become
          part of my medical health record.
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
      </div>
    );
  }
}

class ToS extends Component {
  render() {
    return (
      <div>
        <h5 className='text-center'><i>IGI Healthy Campus Study: An integrated approach to safely reintroduce onsite work during the COVID-19 pandemic</i></h5>
        <div className='p-3 border border-dark'>
          <p className='lead text-center w-100'>Key Information</p>
          <ul>
            <li>
              You are being invited to participate in a research study. Participation in research is completely
              voluntary.
                        </li>
            <li>
              The specific purpose of this study is to model and evaluate the efficacy of asymptomatic
              testing and automated contact tracing to prevent the spread of COVID-19 within the campus
              population.
                        </li>
            <li>
              The study will take a total of 2.5 hours over the course of 6 months, and you will be asked to
              give saliva samples at campus kiosks every other week which will be tested in a COVID-19
              diagnostics lab. These tests are not FDA approved so if they return a positive or inconclusive
              result, you will be directed to confirmatory testing at University Health Services.
                        </li>
            <li>
              The clinical validity of this test has not yet been shown so we cannot fully ensure the accuracy
              of any results, positive or negative.
                        </li>
            <li>
              Results will be reported to participants by encrypted email and, in the case of positive or
              inconclusive results, by phone.
                        </li>
            <li>
              Risks and/or discomforts may include breach of confidentiality.
                        </li>
            <li>
              There is no direct benefit to you. The results from the study may benefit the UC Berkeley
              campus by mitigating spread of COVID-19.
                        </li>
          </ul>
        </div>
        <p className='lead text-center'>Introduction and Purpose</p>
        <p>
          The IGI Healthy Campus Initiative is an investigation into preventative measures being taken to protect
          on-campus employees during the COVID-19 pandemic. The study’s Principal Investigators are Professor
          Jennifer Doudna, PhD (Executive Director, Innovative Genomics Institute) and Dr. Guy Nicolette, MD
          (Assistant Vice Chancellor for University Health Services), and the study coordinator is Alexander
          Ehrenberg (PhD Student, Dept. of Integrative Biology).
                </p>
        <p>
          The purpose of this study is to model and evaluate the efficacy of asymptomatic testing to prevent the
          spread of COVID-19 within the campus population. You are being invited to participate in this study
          because you have been approved for on-campus work at UC Berkeley between June 2020 and January
          2021.
                </p>
        <p>
          The saliva-based test for COVID-19 we refer to here will use an OMNIgene kit (OM-505) for saliva
          sampling. This device is not FDA-approved for clinical use. The test done in the lab is derived from an
          FDA-authorized test currently used in the same diagnostics lab. As such, this test is experimental, and
          results require confirmation by an FDA-approved clinical test.
                </p>
        <p className='lead text-center'>Procedures</p>
        <p>
          If you agree to participate in this study, you will be given access to regular (every two weeks) saliva-
          based COVID-19 testing using an experimental test focused exclusively on asymptomatic individuals. If
          at any point in the study you experience symptoms of COVID-19, you should contact University Health
          Services using the 24/7 phone triage at 510-643-7197 to be clinically tested. You should not return for
          asymptomatic testing until you test negative and your symptoms resolve.
                </p>
        <p>
          You will schedule visits to testing kiosks spread throughout the UC Berkeley campus using an online
          scheduling application. During the online scheduling you will be asked several brief questions to get
          information on how much time you are spending on campus, where you are working on campus, whether
          or not you have ever been diagnosed with COVID-19, and your use of a mobile contact tracing
          application, if any. At the testing kiosk you will need to present your ID and confirmation email. At the
          kiosk, you will spit into a tube while being watched by kiosk personnel. You will then return the tube to
          the personnel. This sample will be brought to the IGI SARS-CoV-2 diagnostics lab for testing.
                </p>
        <p>
          The procedure at the testing site will take 5-10 minutes each visit. In total, for the duration of this study,
          you can expect to spend a total of roughly 2.5 hours for the asymptomatic testing. You can choose to end
          participation in this study at any time and will not be penalized for missing appointments.
                </p>
        <p>
          The diagnostic test used in this study, SARS-CoV-2 detection from an OMNIgene saliva collection kit, is
          not currently approved by the FDA and is investigational. If your sample tests positive for SARS-CoV-2,
          the virus that causes COVID-19, or is inconclusive, you will be called and send an encrypted email by a
          clinician who will recommend that you to self-isolate and guide you to make an appointment with the
          UHS Tang Center for confirmatory testing. This confirmatory testing is important because the saliva-
          based test has not been fully approved by the FDA for diagnosis of COVID-19. The confirmatory testing
          is not a part of this research study and only exists to inform clinical decisions about your care. If your
          saliva sample tests negative, you will receive an encrypted email from a clinician that will mention the
          limitations of it as a research result.
                </p>
        <p><b>Study time:</b> Your study participation will take a total of 2.5 hours over the course of 6 months.</p>
        <p><b>Study location:</b> All study procedures will take place online and at tent kiosks throughout the UC
                    Berkeley campus.</p>
        <p className='lead text-center'>Benefits</p>
        <p>
          COVID-19 does not present with symptoms in many individuals and features a varied incubation period
          where individuals may still be infectious. Asymptomatic surveillance testing can be used to prevent the
          spread of COVID-19 between asymptomatic individuals. By receiving asymptomatic testing in this study,
          you will have the benefit of preventing the spread of COVID-19 from yourself to others. As a whole, this
          study protects the campus community by minimizing the spread of COVID-19 between asymptomatic
          individuals.
                </p>
        <p className='lead text-center'>Risks/Discomforts</p>
        <p>
          Saliva sampling is not associated with any physical risks. You will be asked to avoid food or drink for 30
          minutes prior to your appointments which may involve mild discomfort. Some individuals may
          experience social or cultural discomfort with individuals watching them spit. We will maximize, to the
          best of our ability, your privacy during sample collection. Additionally, there may be stigma associated
          with a diagnosis of COVID-19. This can be minimized by only disclosing your personal results to
          individuals you feel responsible to.
                </p>
        <p><b>Breach of confidentiality:</b> As with all research, there is a chance that confidentiality could be
                    compromised; however, we are taking precautions to minimize this risk.</p>
        <p className='lead text-center'>Confidentiality</p>
        <p>
          Your study data will be handled as confidentially as possible. If results of this study are published or
          presented, individual names and other personally identifiable information will not be used.
                </p>
        <p>
          To minimize the risks to confidentiality, we will not store any information regarding your test results
          outside of the database ran by the licensed clinical lab. Any information entered into the scheduling
          system or at the time of enrollment are kept on an encrypted server that will not be distributed to anyone
          other than the diagnostic testing lab; local, state, and federal public health agencies such as the California
          Department of Public Health; the Food and Drug Administration (FDA) and other government agencies
          involved in keeping research safe for people; and University of California staff who have oversight over
          the diagnostic lab or the testing kiosks.
                </p>
        <p>
          When the research is completed, your data and samples may be saved for future research. You have the
          option to opt-out of this at the end of this consent form. Your data will be retained indefinitely by the
          diagnostics lab in a HIPAA-compliant database for legal requirements of their licensure. Your samples
          will be retained indefinitely by the diagnostics lab.
                </p>
        <p>
          Clinically relevant results, including individual results, will be disclosed to you if the diagnostics lab finds
          that your saliva sample is positive for SARS-CoV-2 or is inconclusive. These results are for research
          purposes only and will not become part of your medical health record.
                </p>
        <p>
          Your personal information may be released if required by law. Authorized representatives from the
          following organizations may review your research data for purposes such as monitoring or managing the
          conduct of this study:
                    <ul>
            <li>University of California</li>
            <li>Food and Drug Administration (FDA) and other government agencies involved in keeping research
                            safe for people.</li>
          </ul>
        </p>
        <p>
          Identifiers might be removed from the identifiable private information or identifiable biospecimens. After
          such removal, the information or biospecimens could be used for future research studies or distributed to
          other investigators for future research studies without additional informed consent from the subject or the
          legally authorized representative.
                </p>
        <p>
          Saliva samples collected from you for this study and/or information obtained from your biospecimens
          may be used in this research or other research and shared with other organizations. You will not share in
          any commercial value or profit derived from the use of your biospecimens and/or information obtained
          from them.
                </p>
        <p>
          This research study will not include whole genome DNA or RNA sequencing.
                </p>
        <p>
          Clinically relevant research results, including individual research results, will be disclosed to subjects if
          they are positive or inconclusive samples.
                </p>
        <p className='lead text-center'>Alternatives</p>
        <p>
          Your other choices may include:
                    <ul>
            <li>Getting no asymptomatic testing</li>
            <li>Getting standard testing outside of this study.</li>
            <li>Participating in another study providing asymptomatic testing.</li>
          </ul>
        </p>
        <p className='lead text-center'>Compensation/Payment</p>
        <p>
          You will not be paid for participation in this study, nor will you or your insurance carriers be asked to pay
          to participate in this study.
                </p>
        <p className='lead text-center'>Costs of Study Participation</p>
        <p>
          You will not be charged for any of the study activities.
                </p>
        <p className='lead text-center'>Rights</p>
        <p>
          <b><i>Participation in research is completely voluntary.</i></b>
                    You have the right to decline to participate or to
                    withdraw at any point in this study without penalty or loss of benefits to which you are otherwise entitled.
                    You will not be penalized for missing appointments. If you want to withdraw from the study, please
                    contact <a href='mailto:igistudy@berkeley.edu'>igistudy@berkeley.edu</a>.
                </p>
        <p>
          If you withdraw from the research, the data collected about you up to the point of withdrawal will remain
          part of the study and may not be removed from the study database per FDA regulations.
                </p>
        <p className='lead text-center'>Questions</p>
        <p>
          If you have any questions or concerns about this study, you may contact the study coordinator, Alexander
                    Ehrenberg, at <a href='mailto:igistudy@berkeley.edu'>igistudy@berkeley.edu</a>.
                </p>
        <p>
          If you have any questions or concerns about your rights and treatment as a research subject, you may
          contact the office of UC Berkeley's Committee for the Protection of Human Subjects, at 510-642-7461 or
                    <a href='mailto:subjects@berkeley.edu'>subjects@berkeley.edu</a>.
                </p>
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
          <Button variant='primary' onClick={this.props.onAccept} disabled={this.props.questions.includes(null)}>I Agree</Button>
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
