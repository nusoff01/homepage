import React, { useState, useEffect, DOMElement } from "react";
import * as d3 from "d3";
import teamNameMap from './constants';
import './MlbPitching.scss';

const padding = 32;
const xVar = 'ERA+';
const minCircleWidthBelow = 4;
const minCircleWidthAbove = 12;
const maxCircleWidthBelow = 16;
const maxCircleWidthAbove = 36;
const styleWidthCutoff = 720;
const inningsCutoffOptions = [0,10,20,30,40,50,60];
// const guidelineValues = [0,50,100,150,200,250];
// const currTeam = 29;
const guidelineValues = [0,50,100,150,200,400,800,1200, Infinity];


let simulationMap: any = {};

function getName (rawName: string) {
    if (!rawName)
        return '';
    if (rawName.indexOf('*') !== -1) {
        return rawName.split('*')[0];
    }
    else if (rawName.indexOf('\\') !== -1) {
        return rawName.split('\\')[0];
    }
    return rawName;
}

const getTeamPrimary = (teamKey: string): string => {
    if (teamKey in teamNameMap) {
        return teamNameMap[teamKey].primaryColor;
    } else {
        return 'black';
    }
}

const getTeamSecondary = (teamKey: string): string => {
    if (teamKey in teamNameMap) {
        return teamNameMap[teamKey].secondaryColor;
    } else {
        return 'black';
    }    
}

function getInitials (rawName: string) {
    let fullName = getName(rawName);
    let initials = fullName.split(' ').reduce((initials, currNamePart) => {
        return initials + currNamePart[0] + '.'
    }, '');
    return initials;
}

const MlbPitching = () => {

    const [playersPitchingData, setPlayersPitchingData] = useState([]);
    const [teamsPitchingData, setTeamsPitchingData] = useState([]);
    const [domain, setDomain] = useState();
    const [minInnings, setMinInnings] = useState(0);
    const xVar = 'ERA+';


    const getInningsFilteredPitchers = () => {
        let filteredPlayers = playersPitchingData.filter((player: any) => {
            return player.IP >= minInnings;
        }); 
        return filteredPlayers;
    }

    const filterPlayers = (players: Array<any>, team: string = '', minInnings: number = 0) => {
        let filteredPlayers = players;
        if (team !== '') {
            filteredPlayers = filteredPlayers.filter((player: any) => {
                return (player.Tm === team); 
            });
        }
        if (minInnings !== 0) {
            filteredPlayers = filteredPlayers.filter((player: any) => {
                return player.IP >= minInnings;
            }); 
        }
        return filteredPlayers;    
    }

    useEffect(() => {
        async function fetchData() {
            d3.queue()
                .defer(d3.csv, "data/pitchingData.csv")
                .defer(d3.csv, "data/teamPitchingData.csv")
                .await(function(error, players, teams) {
                    setPlayersPitchingData(players);
                    teams.map((team: any) => {
                        team['ERA+'] = Number(team['ERA+']);
                        team['ERA'] = Number(team['ERA']);
                        return team;
                    });

                    teams.sort((teamA: any, teamB: any) => {
                        if (teamA[xVar] < teamB[xVar]) {
                            return 1;
                        } else if (teamA[xVar] > teamB[xVar]) {
                            return -1;
                        }
                        return 0;
                    });

                    players = players.map((player: any) => {
                        player.xValue = player[xVar] !== '' ? Number(player[xVar]) : Infinity;
                        player.r = Number(player['IP']);
                        player.y = 0;
                        return player;
                    });

                    //FOR SINGLE TEAM
                    // let activeTeam = teams[currTeam];
                    // players = filterPlayers(players, activeTeam.Tm);
                    // teams = [activeTeam];

                    setDomain(d3.extent(players.filter((player: any) => {
                        return player.xValue !== Infinity;
                    }), (d: any) => d.xValue) as any);                
                    setTeamsPitchingData(teams);
                });   
        }
        fetchData();
    }, []);

    const getTeamName = (teamKey: string): string => {
        if (teamKey in teamNameMap) {
            return teamNameMap[teamKey].teamName;
        } else {
            return '';
        }
    }

    const chartWidth = useWindowSize();

    return (<div className={'mlbPitchingContainer'}>
        <h1 className={'header title'}>2020 MLB Pitching Staff Comparisons</h1>
        <p className={'header subtitle'}>Each team's pitchers are circles: the size of the circle is how much that pitcher has been used by that team (Innings pitched), and the horizontal position is how effective they've been (ERA+)</p>
        <div className={'controls'}>
            <span>Minimum innings: </span>
            <select onChange={(e: any) => {setMinInnings(Number(e.target.value))}}>
                {inningsCutoffOptions.map((innings: any, i: number) => 
                (<option  key={i}>
                    {innings}
                </option>))}
            </select>
        </div>
        <Legend domain={domain} width={chartWidth} firstTeam={teamsPitchingData[0]}/>
        <div id={'eachTeam'}>
            {teamsPitchingData.map((team: any, i: number) => (
                <div key={i} className={'teamRow'}>
                    <div className={'teamOverview'}>
                        <h1 className={'teamName'} style={{'color': getTeamPrimary(team.Tm)}}>{getTeamName(team.Tm)}</h1>
                        <p className={'teamStats'}>team ERA+: {team['ERA+']}</p>
                        <p className={'teamStats'}>team ERA: {team['ERA']}</p>
                    </div>
                    <TeamPitching teamID={team.Tm} domain={domain} data={getInningsFilteredPitchers()} team={team} width={chartWidth} firstTeam={teamsPitchingData[0]}/>
                </div>
            ))}
        </div>
        <div className={'credits'}> Data comes from baseball-reference.com, found <a href='https://www.baseball-reference.com/leagues/MLB/2020-standard-pitching.shtml'>here</a>. Comments or concerns? Send to <a href="https://twitter.com/heyusoft">@heyusoft</a></div>
    </div>);
}

const Legend = (legendProps: any, width: number) => {
    console.log(legendProps);
    const drawLegend = (container: any, xScale: any) => {
        const teamTop = 50;
        const leagueTop = 30;
        const teamAvgValue = legendProps.firstTeam ? legendProps.firstTeam[xVar] : 141;

        let svg: any = container.selectAll('svg')
            .data([legendProps.domain]);
        svg.enter().append('svg')
            .attr('height', 80)
            .merge(svg)
            .attr('width', legendProps.width);
        svg.exit().remove();

        addVerticalLine(svg, xScale(102), leagueTop, 80, 'totalAvg');
        addVerticalLine(svg, xScale(teamAvgValue), teamTop, 80, 'teamAvg');

        let leagueAvgText = svg.selectAll('.leagueAvgText').data(['League avg']);
        leagueAvgText.enter().append('text')
            .attr('class', 'leagueAvgText')
            .text((d: string) => d)
            .attr('y', leagueTop - 4)
            .merge(leagueAvgText)
            .attr('x', xScale(102));
        leagueAvgText.exit().remove();

        let teamAvgText = svg.selectAll('.teamAvgText').data(['Team avg']);
        teamAvgText.enter().append('text')
            .attr('class', 'teamAvgText')
            .text((d: string) => d)
            .attr('y', teamTop - 4)
            .merge(teamAvgText)
            .style('text-anchor', (teamAvgValue < 102) ? 'end' : 'start')
            .attr('x', xScale(teamAvgValue))
        teamAvgText.exit().remove();

        let guidelineLabels = svg.selectAll('.guidelineLabel').data(guidelineValues);
        guidelineLabels.enter()
            .append('text')
            .attr('class', (d: any) => `guidelineLabel guidelineLabel${d}`)
            .attr('y', 78)
            .merge(guidelineLabels)
            .text((d: any) => d === Infinity ? '∞' : d)
            .attr('x', (d: any) => {
                // console.log(d === Infinity);
                return (d === Infinity ? (legendProps.width - 24) : xScale(d));
            });
        guidelineLabels.exit().remove();
    }

    useEffect(() => {
        let container: any = d3.select(`#legend`);
        if (legendProps.domain) {
            const xScale = d3.scaleLinear().domain(legendProps.domain).range([padding, legendProps.width - (2 * padding)]);
            drawLegend(container, xScale);    
        }
    });

    return (<div id={`legend`}>
    </div>);
}

const addVerticalLine = (svg: any, xPos: number, y1: number, y2: number, lineClass: string, secondaryLineClass: string = '') => {
    let avgLine = svg.selectAll(`.${lineClass}`)
            .data([xPos]); 
        avgLine.enter()
            .append('line')
            .attr('class', `${lineClass} ${secondaryLineClass}`)
            .merge(avgLine)
            .attr('y1', y1)
            .attr('y2', y2)
            .attr('x1', (xPos: number) => xPos)
            .attr('x2', (xPos: number) => xPos);
    avgLine.exit().remove();
}

const TeamPitching = (teamProps: any) => {
    const data: Array<any> = teamProps.data;
    const width: number = teamProps.width;

    const drawChart = (container: any) => {
        let svg: any = container.selectAll(`.${teamProps.teamID}PlayerChart`)
            .data([teamProps.teamID]);
        let containerHeight = width > styleWidthCutoff ? 360 : 180;
        const height: number = containerHeight;
        let enteredSVG = svg.enter()
            .append('svg')
            .attr('class', (d: any) => `${d}PlayerChart teamPlayersChart`)
            .merge(svg)
            .attr('width', width)
            .attr('height', height);
        svg.exit().remove();

        let localDomain = teamProps.domain ? teamProps.domain : [0,1];

        const xScale = d3.scaleLinear().domain(teamProps.domain).range([padding, width - (2 * padding)]);
        let minCircleWidth = (width < styleWidthCutoff) ? minCircleWidthBelow : minCircleWidthAbove;
        let maxCircleWidth = (width < styleWidthCutoff) ? maxCircleWidthBelow : maxCircleWidthAbove;
        const rScale = d3.scaleLinear().domain([0, d3.max(data, (d: any) => d.r)]).range([minCircleWidth, maxCircleWidth]);

        let teamPlayers = data.filter((player: any) => {
            if (player.Tm !== teamProps.teamID) {
                return false;
            }
            return true;
        });
        teamPlayers = teamPlayers.map((player: any) => {
            player.x = xScale(player[xVar]);
            player.originalX = player.x;
            player.y = height / 2;
            return player;
        });

        const tooltip = container.select('.tooltipContainer');

        drawAvgLine(enteredSVG, xScale);
        drawTeamAvgLine(enteredSVG, xScale, teamProps.team[xVar]);
        guidelineValues.forEach((v: number) => {
            addVerticalLine(enteredSVG, (v === Infinity ? (width - 24) : xScale(v)), 0, height, `guideline${v}`,  `guideline`);
        })
        drawPlayers(enteredSVG, xScale, rScale, teamPlayers, tooltip);
    }

    const drawAvgLine = (svg: any, xScale: any) => {
        let avgLine = svg.selectAll('.avgLine')
            .data([102]); //HARDCODED
        avgLine.enter()
            .append('line')
            .attr('class', 'avgLine')
            .merge(avgLine)
            .attr('y1', 0)
            .attr('y2', svg.attr('height'))
            .attr('x1', (d: number) => xScale(d))
            .attr('x2', (d: number) => xScale(d));
        avgLine.exit().remove();
    }

    const drawTeamAvgLine = (svg: any, xScale: any, teamAvg: number) => {
        let avgLine = svg.selectAll('.teamAvgLine')
            .data([teamAvg]); 
        avgLine.enter()
            .append('line')
            .attr('class', 'teamAvgLine')
            .attr('y1', 0)
            .merge(avgLine)
            .attr('y2', svg.attr('height'))
            .attr('x1', (d: number) => xScale(d))
            .attr('x2', (d: number) => xScale(d));
        avgLine.exit().remove();
    }

    const setTooltipText = (tooltip: any, player: any) => {
        let playerName = tooltip.selectAll('.playerName').data([getName(player.Name)]);
        playerName.enter().append('h3')
            .attr('class', 'playerName')
            .merge(playerName)
            .text((d: String) => d);
        playerName.exit().remove();

        let playerStats = tooltip.selectAll('.playerStats').data([player])
        playerStats.enter().append('p')
            .attr('class', 'playerStats')
            .merge(playerStats)
            .text((d: any) => `ERA: ${d.ERA !== '' ? d.ERA : '∞'}, ERA+: ${d['ERA+'] !== '' ? d['ERA+'] : '∞'}, IP: ${d.IP}`);
        playerStats.exit().remove();
    }


    const drawPlayers = (svg: any, xScale: any, rScale: any, players: any, tooltip: any) => {
        let height = svg.attr('height');

        let playerGroups = svg.selectAll('.playerGroup')
            .data(players);
        let enteredPlayerGroups = playerGroups.enter()
            .append('g')
            .attr('class', 'playerGroup')
            .merge(playerGroups)
            .attr('transform', (d: any) => `translate(${xScale(d.xValue)},${height/2})`);
        enteredPlayerGroups.each(function (d: any) {
                let selection = enteredPlayerGroups.filter((dLocal: any) => {
                    return d === dLocal;
                });
                let circle = selection.selectAll('circle').data([d]);
                circle.enter().append('circle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('class', 'playerDot')
                    .attr('fill', getTeamPrimary(d.Tm))
                    .merge(circle)
                    .attr('r', (d: any) => rScale(d.r))
                    .on('mouseover', function () {
                        tooltip.classed('hidden', false);
                        let y = height - (d.y - rScale(d.r) - 8);
                        let x = Math.max((width - d.x < 100) ? width - 200 : d.x - 100, 16);
                        tooltip.style('left', `${Math.floor(x)}px`)
                            .style('bottom', `${Math.floor(y)}px`);
                        setTooltipText(tooltip, d);
                    })
                    .style('stroke', getTeamSecondary(d.Tm))
                    .on('mouseout', () => {
                        tooltip.classed('hidden', true);
                    });
                circle.exit().remove();

                let initials = selection.selectAll('text').data([d]);
                initials.enter().append('text')
                    .attr('class', 'playerInitials')
                    .attr('alignment-baseline', 'middle')
                    .style('fill', getTeamSecondary(d.Tm))
                    .merge(initials)
                    .style('display', width < styleWidthCutoff ? 'none' : 'block')
                    .text(getInitials(d.Name))
                initials.exit().remove();
            })
        playerGroups.exit().remove();

        if (simulationMap[teamProps.teamID]) {
            simulationMap[teamProps.teamID].stop();
        }

        var simulation = d3.forceSimulation()
            .nodes(players)
            .force("y", d3.forceY(function(d) { return height / 2; }).strength(0.001))
            .force("collide", d3.forceCollide().radius(function(d: any) { return rScale(d.r); }))
            .on('tick', () => {
                enteredPlayerGroups.each(function(d: any){d.x = d.originalX; }) //constrains/fixes x-position
                let xTransform = 0;
                let yTransform = 0;
                enteredPlayerGroups.attr('transform', (d: any) => {
                    d.y = Math.max(rScale(d.r), Math.min(height - rScale(d.r), d.y));
                    d.x = (d[xVar] === '') ? (width - 24) : Math.max(rScale(d.r), Math.min(width - rScale(d.r), d.x));
                    return `translate(${d.x},${d.y})`;
                });
            });
        simulationMap[teamProps.teamID] = simulation;
    };
    
    useEffect(() => {
        let container: any = d3.select(`.${teamProps.teamID}teamChartContainer`);
        drawChart(container);
    });

    return (<div className={`teamChartContainer ${teamProps.teamID}teamChartContainer`}>
        <div className={'tooltipContainer hidden'} >
            <h4 className={'playerName'}></h4>
        </div>
    </div>);
}

const useWindowSize = () => {
    const [chartWidth, setChartWidth] = useState(0);
    useEffect(() => {
        function handleResize() {
            let container: any = d3.select(`#eachTeam`);
            setChartWidth((container.node() ? container.node().getBoundingClientRect().width - 24 : 0));
        }
          
        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return chartWidth;
}

export default MlbPitching;