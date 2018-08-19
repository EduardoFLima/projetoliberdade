import React, { Component } from 'react';
import Spinner from './common/spinner';
import { connect } from 'react-redux';
import { fetchHomePageInfo } from '../actions';
import { Carousel } from 'react-responsive-carousel';
import _ from 'lodash';

class Home extends Component {

    constructor(props) {
        super(props);

        this.props.fetchHomePageInfo();
    }

    renderHomeCarousel() {

        if (!this.props.home)
            return null;

        const { home } = this.props;

        const carouselProps = {
            showThumbs: false,
            infiniteLoop: true,
            autoPlay: true,
            useKeyboardArrows: true,
            interval: 5000,
            showStatus : false
        };

        return (
            <Carousel className="homeCarousel" {...carouselProps} >

                {_.map(home, (value, key) => {
                    return <div className="homeCarouselImageDiv" key={key} >
                        <img className="homeCarouselImage" src={`/src/resources/images/${value.src}`} />
                    </div>
                })}

            </Carousel>
        );
    }

    render() {

        if (this.props.loading)
            return <Spinner />;

        const { titulo } = this.props.home;

        return (
            <div className="content" >
                {this.renderHomeCarousel()}
            </div>

        );
    }

}

const mapStateToProps = ({ homePage }) => {

    const { loading, home } = homePage;

    return { loading, home };

}

export default connect(mapStateToProps, { fetchHomePageInfo })(Home);