/**
 * Created by chenlizan on 2017/6/18.
 */

import React from 'react';
import {Router, Route, IndexRoute, hashHistory} from 'react-router';

import App from '../App';
// import Login from '../containers/Login';
import Home from '../containers/Home';

export const routes = (
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            {/* <IndexRoute component={PolicyContainer}/> */}
            <IndexRoute component={Home}/>
            <Route path="home" component={Home}/>
        </Route>
    </Router>
);
