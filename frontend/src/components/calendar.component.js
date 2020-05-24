import React, { Component } from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import './calendar.css';

class DateButton extends Component {
    render() {
        if(this.props.grey) {
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm text-secondary' disabled>{this.props.day}</button></div>
            );
        } else if(this.props.invisible) {
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm invisible' disabled>{this.props.day}</button></div>
            );
        }else if(this.props.active) {
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm active'>{this.props.day}</button></div>
            );
        } else{
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm' disabled>{this.props.day}</button></div>
            );
        }
    }
}

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            year: new Date().getFullYear(),
            month: new Date().getMonth()
        };
    }

    render() {
        const startDay = new Date(this.state.year, this.state.month, 1).getDay();
        const lastMonth = this.state.month > 0 ? this.state.month - 1 : 11;
        let btns = [];
        for(var i = 0;i < 6;i++){
            let btnRow = [];
            for(var d = 0;d < 7;d++) {
                let day = i*7+d;
                if(day<startDay) {
                    btnRow.push(<DateButton grey={true} day={daysInMonth[lastMonth]-startDay+1+day} key={day}/>);
                } else if(day>=startDay && day < daysInMonth[this.state.month]+startDay) {
                    btnRow.push(<DateButton active={false} day={day-startDay+1} key={day}/>);
                } else {
                    btnRow.push(<DateButton invisible={true} day={day-startDay+1} key={day}/>);
                }
            }
            btns.push(<div className='row m-0 p-0' key={i}>{btnRow}</div>);
        }
        return (
            <div className='card text-center' style={{width: '22rem'}}>
                <div className='card-header'>
                    <div className='btn-group'>
                        <button className='btn btn-light' onClick={() => {this.setState({month: (this.state.month - 1) < 0 ? 11 : this.state.month - 1, year: (this.state.month - 1) < 0 ? this.state.year - 1 : this.state.year})}}><BsChevronLeft/></button>
                        <p className='lead p-2 m-0' style={{lineHeight: 1.2}}>{months[this.state.month]}</p>
                        <button className='btn btn-light' onClick={() => {this.setState({month:(this.state.month + 1) % 12, year: ((this.state.month + 1) % 12 === 0) ? this.state.year + 1 : this.state.year})}}><BsChevronRight/></button>
                    </div>
                </div>
                <div className='card-body'>
                    {/* <table>
                        <thead>
                            <tr>
                                <th>S</th>
                                <th>M</th>
                                <th>T</th>
                                <th>W</th>
                                <th>T</th>
                                <th>F</th>
                                <th>S</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>1</button></td>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>2</button></td>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>3</button></td>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>4</button></td>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>5</button></td>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>6</button></td>
                                <td><button className='btn btn-outline-primary border-0 btn-circle btn-sm'>7</button></td>
                            </tr>
                        </tbody>
                    </table> */}
                    <div className='row m-0 p-0'>
                        <div className='col m-0 p-0'><p className='lead'>S</p></div>
                        <div className='col m-0 p-0'><p className='lead'>M</p></div>
                        <div className='col m-0 p-0'><p className='lead'>T</p></div>
                        <div className='col m-0 p-0'><p className='lead'>W</p></div>
                        <div className='col m-0 p-0'><p className='lead'>T</p></div>
                        <div className='col m-0 p-0'><p className='lead'>F</p></div>
                        <div className='col m-0 p-0'><p className='lead'>S</p></div>
                    </div>
                    {btns}
                </div>
            </div>
        );
    }
}
