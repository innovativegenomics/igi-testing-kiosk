import React, { Component } from 'react';
import qrcode from 'qrcode';
import qs from 'qs';

import { getUser } from '../../actions/authActions';
import berkeleyLogo from '../../media/berkeley_logo.png';

import Navbar from '../navbar.component';

export default class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      img: '',
      authed: false,
      loaded: false,
      loading: false,
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
    if (this.state.img === '') {
      const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
      if (query.uid) {
        const scanUrl = window.location.protocol + '//' + window.location.host + '/admin/scanner?uid=' + query.uid;
        console.log(scanUrl);
        qrcode.toDataURL(scanUrl, { errorCorrectionLevel: 'H' }).then(res => {
          this.setState({ img: res });
        });
      }
    }
    return (
      <div>
        <Navbar authed={!this.state.auth.unauthed} />
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-md-5'>
              <img src={this.state.img} style={{ width: '100%' }} alt='QR code' />
            </div>
          </div>
        </div>
        <footer className='navbar navbar-light bg-transparent'>
          <div className='navbar-nav'></div>
          <img src={berkeleyLogo} className='form-inline' style={{height: '5rem'}}/>
        </footer>
      </div>
    );
  }
}
