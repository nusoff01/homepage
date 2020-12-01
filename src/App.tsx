import React from 'react';
import './App.css';
import Feed from './Feed/Feed';
import MlbPitching from './projects/MlbPitching/MlbPitching';
import { HashRouter, Route, Link } from "react-router-dom";

const projects = [
  {title: '2020 MLB pitching staffs', content: 'Using the ERA+ of pitchers to see how different MLB teams\' pitching staffs line up', tags: ['baseball', 'sports'], link: '#/pitching', imageLink: './images/pitching.png'},
  {title: 'Boston 911 calls', content: 'Characterizing where and why people call 911 in Boston', tags: ['Boston', 'police'], link: 'https://nusoff01.github.io/boston911/', imageLink: './images/boston911.png'},
  {title: 'The NFL since 1990', content: 'Distributions of wins by season for the NFL as a whole, and each individual team', tags: ['NFL', 'sports'], link: 'http://nflseasons.herokuapp.com/', imageLink: './images/NflSeasons.png'},
  {title: 'Counties without a covid death', content: 'Tracking the largest remaining counties without a covid death over time', tags: ['covid', 'mortality'], link: 'https://old.reddit.com/r/Sparrsoft/comments/k4fhy5/test_post/?ref=share&ref_source=link', imageLink: './images/lastRemainingCounty.png'}
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
