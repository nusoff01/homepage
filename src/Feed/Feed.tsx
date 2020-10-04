import React from 'react';
import './Feed.scss';
import { type } from 'os';

type FeedProps = {
    projects: Array<any>
}

type FeedState = {
    tags: Array<Array<any>>;
}

class Feed extends React.Component<FeedProps, {}> {
    
    public componentDidMount () {
        this.state = {
            tags: []
        }
    }

    private getTags (): Array<Array<any>> {
        let tagMap: any = {};
        this.props.projects.forEach((project) => {
            project.tags.forEach((tag: string) => {
                tagMap[tag] = true;
            });
        });
        return Object.keys(tagMap).map((tagName) => {
            return [tagName, true];
        });
    }

    public render () {
        let tags: Array<Array<any>> = this.getTags();
        return (
            <div className="feedContainer">
                <h1 className='feedTitle'>Projects</h1>
                <h4 className='tagToggles'>
                    Tags: 
                    {tags.map((tagState) => {
                        return <button className='tagToggle'>{tagState[0]}</button>;
                    })}
                </h4>
                {this.props.projects.map((project) => {
                    return <div className='projectContainer'>
                        <h2 className='projectHeader'>{project.title}</h2>
                        <h4 className='tags'>
                            {project.tags.map((tag: String) => {
                                return <span className='tag'>{tag}</span>;
                            })}
                        </h4>
                        <hr/>
                        <p className='projectSubheader'>
                            {project.content}     
                            <br/>
                            <br/>
                            <a href={project.link}>
                            <button className='projectLink'>Check it out</button>
                            </a>
                        </p>
                    </div>;
                })}
      </div>
    );  
  }
}

export default Feed;
