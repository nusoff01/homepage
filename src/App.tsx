import React from 'react';
import './App.css';
import Feed from './Feed/Feed';
import MlbPitching from './projects/MlbPitching/MlbPitching';
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";

const projects = [
  {title: 'The demographics of death', content: 'A look at the difference across race, gender, and geography for mortality rates in the United States', tags: ['mortality', 'suicide'], link: 'https://nusoff01.github.io/mortalityFrontend/'},
  {title: '2020 MLB pitching staffs', content: 'Using the ERA+ of pitchers to see how different MLB teams\' pitching staffs line up', tags: ['baseball', 'sports'], link: '/pitching'},
  {title: 'The NFL since 1990', content: 'Distributions of wins by season for the NFL as a whole, and each individual team', tags: ['NFL', 'sports'], link: 'http://nflseasons.herokuapp.com/'}
];

export default function App () {
  return (
    <BrowserRouter basename='/'>
    <div className="App">
      <Switch>
        <Route exact path="/" render={(props) => <Feed projects={projects} />} />
        <Route exact path="/pitching" render={(props) => <MlbPitching/>}  />
        <Route render={(props) => <Feed projects={projects}/>}/>
      </Switch>
    </div>
  </BrowserRouter>
  );
}
