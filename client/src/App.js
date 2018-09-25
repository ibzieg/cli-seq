/******************************************************************************
 * Copyright 2018 Ian Bertram Zieg
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import React, { Component } from 'react';
import './styles/app.css';
import reducer from './store/reducer';

import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { Switch, Route, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import SequencerView from './views/SequencerView';
import Header from "./components/Header";

const store = createStore(reducer);

class App extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    <div className="app">
                        <Header/>
                        <Route path="/" component={SequencerView}/>
                    </div>
                </BrowserRouter>
            </Provider>
        );
    }
}

export default App;
