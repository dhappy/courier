import React from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css'
import Main from './Main'
import Jobs from './Jobs'
import QRReader from './QRReader'

export default () => (
  <Router>
    <Switch>
      <Route path='/' exact>
        <Main />
      </Route>
      <Route path="/jobs">
        <Jobs />
      </Route>
      <Route path="/pkg">
        <QRReader />
      </Route>
    </Switch>
  </Router>
)