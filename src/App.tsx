import React from 'react';
import './App.css';
import Feed from './Feed/Feed';
import MlbPitching from './projects/MlbPitching/MlbPitching';
import { HashRouter, Route, Link } from "react-router-dom";

const projects = [
  {title: '2020 MLB pitching staffs', content: 'Using the ERA+ of pitchers to see how different MLB teams\' pitching staffs line up', tags: ['baseball', 'sports'], link: '#/pitching'},
  {title: 'The demographics of death', content: 'A look at the difference across race, gender, and geography for mortality rates in the United States', tags: ['mortality'], link: 'https://nusoff01.github.io/mortalityFrontend/'},
  {title: 'The NFL since 1990', content: 'Distributions of wins by season for the NFL as a whole, and each individual team', tags: ['NFL', 'sports'], link: 'http://nflseasons.herokuapp.com/'}
];

export default function App () {
  return (
    <HashRouter basename='/'>
    <div className="App">
        <Route exact path="/" render={(props) => <Feed projects={projects} />} />
        <Route exact path="/pitching" render={(props) => <MlbPitching/>}  />
    </div>
  </HashRouter>
  );
}
