import React from 'react';
import ReactDOM  from 'react-dom';
import { Router, Route } from 'react-router';
import { createHistory } from 'history';

import Generator from "./components/Generator"
import List from "./components/List"
import FourOhFoured from "./components/FourOhFoured"


var routes = (
  <Router history={createHistory()}>
    <Route path="/" component={Generator}/>
    <Route path="/list" component={List}/>
    <Route path="*" component={FourOhFoured}/>
  </Router>
);

ReactDOM.render(routes, document.querySelector("#main"));