import React, {Component} from 'react';
import Cookies from 'js-cookie'
import './Login.css'

// Assets
import logo from '../images/logo_default.svg'

interface loginInFormProps {
  setCurrentDatabaseConnectionJWT: any;
}

interface loginInFormBuffer {
  databaseAddress: string;
  username: string;
  password: string;
  rememberMe: boolean;
  returnMessage: string;
}

class Login extends Component<loginInFormProps, loginInFormBuffer> {
  constructor(props: any) {
    super(props);

    // Default values
    this.state = {
      databaseAddress: '',
      username: '',
      password: '',
      rememberMe: false,
      returnMessage: ''
    }

    // Bind on change functions
    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onDatabaseAddressChange = this.onDatabaseAddressChange.bind(this);
    this.onRememberMeChange = this.onRememberMeChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    // Load databaseAddress and usernameCookie from cookies
    var databaseAddressCookie = Cookies.get('databaseAddress');
    var usernameCookie = Cookies.get('username')

    this.setState({
      databaseAddress: databaseAddressCookie === undefined ? '' : databaseAddressCookie,
      username: usernameCookie === undefined ? '' : usernameCookie
    })
  }

  onDatabaseAddressChange(event: any) {
    this.setState({databaseAddress: event.target.value});
  }

  onUsernameChange(event: any) {
    this.setState({username: event.target.value});
  }

  onPasswordChange(event: any) {
    this.setState({password: event.target.value});
  }

  onRememberMeChange(event: any) {
    this.setState({rememberMe: event.target.checked})
  }

  async onSubmit(event: any) {
    if (this.state.rememberMe) {
      Cookies.set('databaseAddress', this.state.databaseAddress);
      Cookies.set('username', this.state.username);
    }

    // Attempt to authenticate
    const response = await fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        databaseAddress: this.state.databaseAddress,
        username: this.state.username,
        password: this.state.password
      })
    })

    if (response.status === 500) {
      const errorMessage = await response.text();
      this.setState({returnMessage: errorMessage.toString()});
      return;
    }
    
    const jsonObject = await response.json();
    this.props.setCurrentDatabaseConnectionJWT(jsonObject.jwt, this.state.databaseAddress);
  }

  isFormReady() {
    return this.state.databaseAddress && this.state.username && this.state.password ? true : false
  }

  render() {
    return (
      <div className='login-div'>
        <div className='login-container'>
          <img className="login-top-logo" src={logo} alt="datajoint gui logo"/>
          <form className='login-form'>
            <label className='login-input-label'>Host/Database Address</label>
            <input className='login-input' type='text' id='database-server' value={this.state.databaseAddress} onChange={this.onDatabaseAddressChange}></input>
            <label className='login-input-label'>Username</label>
            <input className='login-input' type='text' id='username' value={this.state.username} onChange={this.onUsernameChange}></input>
            <label className='login-input-label'>Password</label>
            <input className='login-input' type='password' id='password' value={this.state.password} onChange={this.onPasswordChange}></input>
            <div className='login-interaction-div'>
              <div>
                <input className='remember-me-checkbox' type='checkbox' id='remember-me-checkbox' checked={this.state.rememberMe} onChange={this.onRememberMeChange}></input>
                <label className='remember-me-checkbox-label' htmlFor='remember-me-checkbox'>Remember Me</label>
              </div>
              <button className={this.isFormReady() ? 'login-input-button ready' : 'login-input-button'} disabled={!this.isFormReady()} onClick={this.onSubmit} type='button'>Connect</button>
            </div>
            <p className="form-message">{this.state.returnMessage}</p>
          </form>
        </div>
      </div>
    )
  }
}

export default Login;