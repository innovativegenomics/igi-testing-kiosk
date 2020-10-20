import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import { TrackedLink } from '../../tracker';

export default class About extends Component {
  render() {
    return (
      <div>
        <Container>
          <p className='display-4 text-center'>IGI FAST: Free Asymptomatic Saliva Testing</p>
          <ul>
            <li><TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/billOfRightsEnglish.pdf`} action='bill of rights english 1'>IGI FAST Bill of Rights</TrackedLink> - <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/billOfRightsEnglish.pdf`} action='bill of rights english 2'>English</TrackedLink>, <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/billOfRightsSpanish.pdf`} action='bill of rights spanish 1'>Español</TrackedLink></li>
            <li><TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/infoSheetEnglish.pdf`} action='info sheet english 1'>IGI FAST Info Sheet</TrackedLink> - <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/infoSheetEnglish.pdf`} action='info sheet english 2'>English</TrackedLink>, <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/infoSheetSpanish.pdf`} action='info sheet spanish 1'>Español</TrackedLink></li>
            <li><TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/informedConsentEnglish.pdf`} action='informed consent english 1'>IGI FAST Informed Consent</TrackedLink> - <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/informedConsentEnglish.pdf`} action='informed consent english 2'>English</TrackedLink>, <TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/informedConsentSpanish.pdf`} action='informed consent spanish 1'>Español</TrackedLink></li>
            <li><TrackedLink ext to={`${process.env.PUBLIC_URL}/pdfs/transitionRequestFeedback.pdf`} action='rampdown'>IGI FAST Discontinuation and Request for Feedback</TrackedLink></li>
          </ul>
          <p>
            Community spread of COVID-19 is likely exacerbated by transmission from people who
            are infected, but don’t display any symptoms. Regular testing of these asymptomatic
            individuals can help to mitigate this spread. As someone approved to work on the UC
            Berkeley campus during the pandemic, you are invited to participate in a study that
            provides regular asymptomatic testing using an experimental saliva-based test for
            COVID-19 on campus.
          </p>
          <p>
            This test is for people without symptoms who are approved to work on campus or
            campus satellite locations. If you do not pass the campus screener the day of an
            appointment, please do not come to campus, cancel your appointment, and visit <TrackedLink ext to='https://uhs.berkeley.edu/coronavirus-covid-19-information' action='uhs guidance'>https://uhs.berkeley.edu/coronavirus-covid-19-information</TrackedLink> for guidance. 
            Additionally, if you are concerned 
            that you may have been exposed to someone with COVID-19, contact UHS.
          </p>
          <p>
            For more information and to enroll, see <TrackedLink ext to='https://igi-fast.berkeley.edu' action='fast home 1'>igi-fast.berkeley.edu</TrackedLink> or contact the study
            coordinator at <TrackedLink ext to='mailto:igi-fast@berkeley.edu' action='igi email 1'>igi-fast@berkeley.edu</TrackedLink>.
          </p>
          <p className='lead'><b>How do I enroll?</b></p>
          <p>
            Enrollment occurs on this website (<TrackedLink ext to='https://igi-fast.berkeley.edu' action='fast home 1'>igi-fast.berkeley.edu</TrackedLink>). You will need to log in with
            your CalNet ID and answer a few questions.
            If you are a UC Berkeley employee, log in with your CalNet ID. If
            you are a contractor, or other individual approved for regular work on the UC Berkeley
            campus, please email <TrackedLink ext to='mailto:igi-fast@berkeley.edu' action='igi email 2'>igi-fast@berkeley.edu</TrackedLink> to check your eligibility and get log in
            information.
          </p>
          <p className='lead'><b>How do I schedule my tests?</b></p>
          <p>
            All test scheduling will be done on this website (<TrackedLink ext to='https://igi-fast.berkeley.edu' action='fast home 2'>igi-fast.berkeley.edu</TrackedLink>). You will be
            assigned to a regular testing schedule and will receive emails every-other week inviting
            you to schedule your next test day, time, and location. You will need to answer a few
            questions when making each appointment.
          </p>
          <p className='lead'><b>Where will testing happen?</b></p>
          <p>
            Tent kiosks are being set up around the UC Berkeley campus. Directions to your kiosk
            will be included as a link to a google maps location in the email and text message
            confirming your appointment.
          </p>
          <p className='lead'><b>Can I be enrolled in another study while participating in this one?</b></p>
          <p>
            Absolutely! There are several studies you might be eligible to participate in, which are
            each looking at different aspects of public health or the biology of COVID-19. The IGI
            FAST study is designed solely to assess how regular saliva-based COVID-19 testing
            protects against the spread of COVID-19 within the on-campus population during the
            pandemic. Your participation in other studies does not preclude you from participating in
            this one.
          </p>
          <p>
            The IGI FAST Study has partnered with the UC Berkeley School of Public Health <TrackedLink ext to='https://safecampus.covid.berkeley.edu/'>Safe Campus Study</TrackedLink>. 
            If you are enrolled in both studies and give us specific permission, we will
            send your results to the Safe Campus Study to help make a more comprehensive dataset
            for the researchers.
          </p>
          <p className='lead'><b>What do I need for my appointment?</b></p>
          <ul>
            <li>
              Appointment barcode - You will receive an email with an appointment barcode. Either
              print this out or bring it on your phone to present at the testing kiosk.
            </li>
            <li>
              Campus clearance message - As with all campus activities, you must complete
              the <TrackedLink ext to='https://calberkeley.ca1.qualtrics.com/jfe/form/SV_3xTgcs162K19qRv'>campus symptom screener</TrackedLink> before coming to campus. You will be asked to present
              the clearance message at the testing kiosk. If you do not pass this screener (i.e. you
              have symptoms), you should not come to a kiosk for testing and visit <TrackedLink ext to='https://uhs.berkeley.edu/coronavirus-covid-19-information'>https://uhs.berkeley.edu/coronavirus-covid-19-information</TrackedLink> for guidance.
            </li>
            <li>
              Eating and drinking - Do not eat or drink anything (even water), do not chew gum, and
              do not smoke or vape for 30 minutes prior to your appointment.
            </li>
          </ul>
          <p className='lead'><b>What will happen at my appointment?</b></p>
          <p>
            Each appointment will take an estimated 10 minutes to complete. You will present your
            appointment barcode and campus clearance message to the kiosk personnel. You will
            be given an OMNIgene saliva collection kit that you will spit into and close. You will be
            instructed to scan the barcode on this kit and sanitize both the kit and your hands with
            hand sanitizer. You will then hand in your kit.
          </p>
          <p>
            If you are concerned about being able to perform the procedure due to disability or other
            physical limitations, please contact the study coordinator at <TrackedLink ext to='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</TrackedLink> as
            soon as possible.
          </p>
          <p className='lead'><b>How do I give a high-quality saliva sample?</b></p>
          <p>
            Occasionally, samples return from the lab with an “Invalid” or “Specimen Insufficient”
            note. This can be due to any number of reasons. Most commonly, it is due to collection
            issues such as the introduction of food particles to the sample, excessive mucous
            (sometimes called sputum) present, failure of the funnel cap to “pop” when it is closed,
            or insufficient or excessive saliva volume.
          </p>
          <p>
            To maximize the chances of successful sampling, we have the following general
            recommendations for saliva collection:
          </p>
          <ul>
            <li>
              Make sure to hydrate well during the day, but not eat, drink (including water),
              smoke, or vape for at least 30 minutes prior to your appointment.
            </li>
            <li>
              Do not attempt to cough up mucous or sputum to add to the volume in your
              sample. The viscosity of mucous interferes with the volume in the lab.
            </li>
            <li>
              Make sure to fill your tube up to, but not exceeding the line. A kiosk volunteer is
              happy to check the levels you have if you are unsure.
            </li>
            <li>
              Make sure to fully close the funnel cap until you hear a pop or click, which
              indicates that a preservative fluid has been released into your sample. Kiosk
              personnel can help confirm whether or not this has happened.
            </li>
            <li>
              Take as much time as you need at the kiosk. Saliva production rates can vary
              throughout the day and by person-to-person. You do not need to feel rushed at
              any point.
            </li>
            <li>
              The IGI SARS-CoV-2 testing lab has observed that coffee, even when consumed
              long before specimen collection, interferes with the detection of viral RNA in the
              laboratory test. We advise to avoid consuming coffee within several hours of your
              test and washing your mouth with water after consumption of coffee (more than
              30 minutes prior to the appointment).
            </li>
          </ul>
          <p className='lead'><b>What kind of test is this?</b></p>
          <p>
            Your sample will be analyzed by the Innovative Genomics Institute’s SARS-CoV-2
            testing team. This group uses a procedure that extracts and isolates any RNA present
            in your sample, then uses molecular probes to see if any of that RNA belongs to SARS-
            CoV-2 using a technique called quantitative reverse-transcriptase polymerase chain
            reaction (RT-qPCR).
          </p>
          <p>
            The procedure the lab will use for your saliva sample is based on a clinical diagnostic
            test for COVID-19 that measures whether SARS-CoV-2 is present in respiratory swabs
            instead of spit. If you are interested in the details of this protocol, please see our peer-
            reviewed correspondence, published in <TrackedLink ext to='https://www.nature.com/articles/s41587-020-0583-3'>Nature Biotechnology</TrackedLink>.
          </p>
          <p className='lead'><b>How will I get my results?</b></p>
          <p>
            Please see <TrackedLink to='/accessing-results'>igi-fast.berkeley.edu/accessing-results</TrackedLink> for instructions on how to access
            your results through the secure messaging service we use, Virtru.
          </p>
          <p className='lead'><b>What do my results mean?</b></p>
          <p>
            The test you are getting through this study has not yet received FDA approval for use.
            Because of this, any <b>positive</b> or <b>inconclusive</b> results must be confirmed by an FDA-
            authorized test. If SARS-CoV-2, the virus causing COVID-19, is detected in your sample
            or the test result is inconclusive, you will be contacted via both phone call and encrypted
            email by the study clinician, who will give you this information, recommend that you self-
            isolate, and provide instructions explaining how to get clinical testing at University
            Health Services.
          </p>
          <p>
            If SARS-CoV-2 is <b>not detected</b> in your sample, you will be notified via encrypted email
            only. Remember that this test is experimental and we cannot guarantee that an
            individual with a negative test result is truly negative for SARS-CoV-2. You should take
            this result with caution, continue to monitor yourself for symptoms, maintain social
            distancing, wear a mask or face covering any time you are outside or on campus
            (including inside campus buildings), and complete the campus screening questionnaire
            before coming to work.
          </p>
          <p>
            Sometimes a test is returned from the lab with a “<b>specimen insufficient</b>” or “<b>invalid</b>” note.
            This means that some characteristic of the sample interfered with the lab’s ability to
            extract and measure viral RNA, the kind of molecule measured to detect SARS-CoV-2
            with this test. This note is different from an inconclusive result. While an insufficient or
            invalid note indicates that there was an issue with the sample, an inconclusive result
            indicates that viral RNA was successfully extracted and some signal associated with
            SARS-CoV-2 was detected but did not reach the threshold necessary to label the sample
            as positive. This is why an inconclusive result necessitates confirmatory clinical testing
            while an insufficient or invalid result does not.
          </p>
          <p>
            No results from this study will enter into your medical record.
          </p>
        </Container>
      </div>
    );
  }
}
