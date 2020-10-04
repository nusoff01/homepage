import React from 'react';
import './App.css';
import Feed from './Feed/Feed';
import MlbPitching from './projects/MlbPitching/MlbPitching';
// import {
//   BrowserRouter as Router,
//   Switch,
//   Route,
//   Link
// } from "react-router-dom";
import { HashRouter, Route, Link } from "react-router-dom";

const projects = [
  {title: 'The demographics of suicide', content: 'A look at the difference across race, gender, and geography for suicide rates in the United States', tags: ['mortality', 'suicide'], link: 'https://nusoff01.github.io/mortalityFrontend/'},
  {title: '2020 MLB pitching staffs', content: 'Using the ERA+ of pitchers to see how different MLB teams\' pitching staffs line up', tags: ['baseball'], link: '#/pitching'}
]

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
