import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import SubmitJob from './components/SubmitJob';
import LookupJob from './components/LookupJob';
import ContactUs from './components/ContactUs';
//add CSS stuff

const App = () => {
    return (
        <Router>
            <div className="App">
                <header>
                    <h1>SANA Interface</h1>
                    <nav>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/submit-job">Submit New Job</a></li>
                            <li><a href="/lookup-job">Look Up Previous Job</a></li>
                            <li><a href="/contact-us">Contact Us</a></li>
                        </ul>
                    </nav>
                </header>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/submit-job" component={SubmitJob} />
                    <Route path="/lookup-job" component={LookupJob} />
                    <Route path="/contact-us" component={ContactUs} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;
