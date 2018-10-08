import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchVideosPageInfo } from '../actions';
import Spinner from './common/spinner';
import _ from 'lodash';
import { renderTitle, renderSubTitle } from './common/util'

class Videos extends Component {

  constructor(props) {
    super(props);

    //console.log('constructor videos ', this.props);

    if (this.props.loading)
      this.props.fetchMethod(this.props.page);

    //this.props.fetchVideosPageInfo();
  }

  renderVideos() {

    if (!this.props.videos)
      return null;

    return _.map(_.pickBy(this.props.videos, (v) => typeof v == 'object'), (video, objKey) => {

      //console.log(objKey, video);

      return <section className="block"  key={objKey}>
        {renderTitle(video.titulo)}
        {renderSubTitle(video.subtitulo)}
        <div className="row" >
          <div className="col-12">
            <div className="w-75 m-auto embed-responsive embed-responsive-16by9" >
              <iframe className="embed-responsive-item" src={video.url} />
            </div>
          </div>
        </div>
      </section>
    });

  }

  render() {

    //console.log("render", this.props);

    if (this.props.loading)
      return <Spinner />;

    if (!this.props.videos || (Object.keys(this.props.videos).length === 0 && this.props.videos.constructor === Object))
      return <div />;

    return (
      <section className="container mt-4" >
        {this.renderVideos()}
      </section>
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

const mapStateToProps = ({ page }, ownProps) => {

  //console.log('videos mapStateToProps', page, ownProps);

  if (!page.pageInfo || (page.currentPage && ownProps.page != page.currentPage))
    return { loading: true };

  return { loading: page.loading, page: page.currentPage, videos: page.pageInfo };
}

export default connect(mapStateToProps, { fetchVideosPageInfo })(Videos)