import React, { Component } from 'react';
import Spinner from './common/spinner';
import { connect } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import _ from 'lodash';

class Home extends Component {

    constructor(props) {
        super(props);

        //console.log("constructor home");

        if (this.props.loading)
            this.props.fetchMethod(this.props.page);
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
            showStatus: false
        };

        const styles = {
            "imgStyle": {
                maxWidth: "100%",
                maxHeight: "500px",
                width: "auto",
                height: "auto",
            }
        }

        return (
            <div className="row pt-5">
                <div className="col-12 px-0">
                    <Carousel className="homeCarousel" {...carouselProps} >
                        {_.map(_.pickBy(home, (h) => typeof h == "object"), (value, key) => {
                            return <div key={key} >
                                <img style={styles.imgStyle} src={`/src/resources/images/${value.src}`} />
                            </div>
                        })}
                    </Carousel>
                </div>
            </div>
        );
    }

    render() {

        if (this.props.loading)
            return <Spinner />;

        const { titulo } = this.props.home;

        return (
            <div className="container-fluid" >
                {this.renderHomeCarousel()}
            </div>

        );
    }

}

const mapStateToProps = ({ page }, ownProps) => {

    //console.log("homeMapStateToProps", page);

    if (page.loading || !page.pageInfo || ownProps.page != page.currentPage)
        return { loading: true };

    return { loading: page.loading, home: page.pageInfo };

}

export default connect(mapStateToProps)(Home);