import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Navigation'
import TremorMap from './components/TremorMap'
import About from './components/About'



ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Header/>
	<br/>
      <Routes>
        <Route exact path="/" element={<App/>} />
        <Route path="/dashboard" element={<TremorMap/>} />
        <Route path="/about" element={<About/>} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
