import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Navbar from '../navbar.component';

import { submitScreening } from '../../actions/authActions';

class Question extends Component {
    render() {
        const listItems = [];
        if(this.props.list) {
            for(var l in this.props.list) {
                listItems.push(<li key={l}>{this.props.list[l]}</li>);
            }
        }
        return (
            <div className='row pt-2 pb-2'>
                <div className='col-md-9'>
                    <p className='m-0'>{this.props.question}</p>
                    <ul>
                        {listItems}
                    </ul>
                </div>
                <div className='col-2'>
                    <div className='btn-group'>
                        <button className={`btn ${(this.props.selected===true)?'btn-primary':'btn-secondary'}`} onClick={this.props.option1Click}>{this.props.option1}</button>
                        <button className={`btn ${(this.props.selected===false)?'btn-primary':'btn-secondary'}`} onClick={this.props.option2Click}>{this.props.option2}</button>
                    </div>
                </div>
            </div>
        );
    }
}

class Screening extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question0: undefined,
            question1: undefined,
            question2: undefined,
            question3: undefined,
            question4: undefined,
            question5: undefined,
            question6: undefined,
            isSubmitted: false,
        };
    }
    submit = () => {
        const {isSubmitted, ...questions} = this.state;
        submitScreening(questions).then(res => {
            if(res) {
                this.setState({isSubmitted: true});
            } else {
                // do something to let user know submission failed
            }
        });
    }
    render() {
        if(this.state.isSubmitted) return <Redirect to='/dashboard' />;
        var isComplete = true;
        for(var k in this.state) {
            if(this.state[k] === undefined) {
                isComplete = false;
                break;
            }
        }
        return (
            <div>
            <Navbar/>
            <div style={{backgroundColor: '#eeeeee'}}>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-md-8 p-3'>
                        <div className='card'>
                            <div className='card-body'>
                                <h5 className='card-title text-center'>Daily COVID-19 Screening Questionnaire</h5>
                                <Question question='Have you been diagnosed with Covid 19 in the past 30 days?'
                                          selected={this.state.question0}
                                          option1='Yes'
                                          option2='No'
                                          option1Click={e => this.setState({question0: true})}
                                          option2Click={e => this.setState({question0: false})}/>
                                <Question question='Have you traveled in the past 14 days?'
                                          selected={this.state.question1}
                                          option1='Yes'
                                          option2='No'
                                          option1Click={e => this.setState({question1: true})}
                                          option2Click={e => this.setState({question1: false})}/>
                                <Question question='Do you live with someone who has been diagnosed with COVID-19 in the past 30 days?'
                                          selected={this.state.question2}
                                          option1='Yes'
                                          option2='No'
                                          option1Click={e => this.setState({question2: true})}
                                          option2Click={e => this.setState({question2: false})}/>
                                <Question question='Have you been in unprotected (without full, approved PPE) contact with anyone 
                                                    diagnosed with COVID-19 or associated biofluids/clinical samples in the past 14 days?'
                                          selected={this.state.question3}
                                          option1='Yes'
                                          option2='No'
                                          option1Click={e => this.setState({question3: true})}
                                          option2Click={e => this.setState({question3: false})}/>
                                <Question question='What is your current temperature?'
                                          selected={this.state.question4}
                                          option1='Over 100F'
                                          option2='Under 100F'
                                          option1Click={e => this.setState({question4: true})}
                                          option2Click={e => this.setState({question4: false})}/>
                                <Question question='In the last 24 hours, have you had any of:'
                                          selected={this.state.question5}
                                          option1='Yes'
                                          option2='No'
                                          option1Click={e => this.setState({question5: true})}
                                          option2Click={e => this.setState({question5: false})}
                                          list={['New cough?', 
                                                 'Difficulty breathing?', 
                                                 'Repeated shaking with chills?',
                                                 'Nausea/vomiting?',
                                                 'Shortness of breath?',
                                                 'New loss of taste or smell?']}/>
                                <Question question='In the last 24 hours, have you had any TWO of the following:'
                                          selected={this.state.question6}
                                          option1='Yes'
                                          option2='No'
                                          option1Click={e => this.setState({question6: true})}
                                          option2Click={e => this.setState({question6: false})}
                                          list={['Persistent runny nose?', 
                                                 'Unexplained muscle aches?', 
                                                 'Congestion?',
                                                 'Sneezing?',
                                                 'Sore throat?',
                                                 'Headache?',
                                                 'Diarrhea?']}/>
                                <div className='row mt-4 pt-3 border-top'>
                                    <div className='col-2'>
                                        <button className='btn btn-primary' onClick={e => this.submit()} disabled={!isComplete}>Submit</button>
                                    </div>
                                    <div className='col-md-9'>
                                        <p className='m-0'>By clicking 'Submit' you agree that you have answered the above questions truthfully.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            </div>
        );
    }
}

export default Screening;
