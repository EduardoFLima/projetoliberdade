import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchVideosPageInfo } from '../actions';
import Spinner from './common/spinner';
import { Carousel } from 'react-responsive-carousel';
import _ from 'lodash';

class Videos extends Component {

  constructor(props) {
    super(props);

    this.props.fetchVideosPageInfo();
  }

  renderVideos() {

    if (!this.props.videos)
      return null;

    return _.map(_.omit(this.props.videos, "titulo"), (video, objKey) => {
      
      return <div className="video-detail embed-responsive embed-responsive-16by9" key={objKey} >
              <iframe className="embed-responsive-item" src={video.url} />
            </div>
    });

  }

  render() {

    console.log("render", this.props);

    if (this.props.loading)
      return <Spinner />;

    if (!this.props.videos || (Object.keys(this.props.videos).length === 0 && this.props.videos.constructor === Object))
      return <div />;

    const { titulo } = this.props.videos;

    const carouselProps = {
      showThumbs: false,
      infiniteLoop: false,
      showIndicators: false,
      autoPlay: false
    };

    return (
      <div className="content" >
        <h4>{titulo}</h4>
        <div className="inner-content">

          <Carousel className="video-carousel" {...carouselProps} >
            {this.renderVideos()}
          </Carousel>

        </div>
      </div>
    );
  }
}

/*

<div className="video-detail embed-responsive embed-responsive-16by9">
              <iframe className="embed-responsive-item" src={this.props.videos.video1.url} ></iframe>
            </div>
            <div className="video-detail embed-responsive embed-responsive-16by9">
              <iframe className="embed-responsive-item" src={this.props.videos.video2.url} ></iframe>
            </div>
            
            */

const mapStateToProps = ({ videosPage }) => {

  const { loading, videos } = videosPage;

  console.log(videosPage);

  return { loading, videos };
}

export default connect(mapStateToProps, { fetchVideosPageInfo })(Videos)