import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchFotosPageInfo } from '../actions/index';
import Spinner from './common/spinner';
import Gallery from 'react-photo-gallery';
import Measure from 'react-measure';
import Lightbox from 'react-images';
import _ from 'lodash';
import ImageDarkening from './common/ImageDarkening';
import { renderTitle } from './common/util';

class Fotos extends Component {

    constructor(props) {
        super(props);

        this.state = { currentImage: 0, currentAlbum: '', width: -1 };
        this.closeLightbox = this.closeLightbox.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.gotoNext = this.gotoNext.bind(this);
        this.gotoPrevious = this.gotoPrevious.bind(this);

        if (this.props.loading)
            this.props.fetchMethod(this.props.page);
    }

    openLightbox(event, obj) {
        this.setState({
            currentImage: 0,
            currentAlbum: obj.index,
            lightboxIsOpen: true,
        });
    }

    closeLightbox() {
        this.setState({
            currentImage: 0,
            currentAlbum: 0,
            lightboxIsOpen: false,
        });
    }

    gotoPrevious() {
        this.setState({
            currentImage: this.state.currentImage - 1,
        });
    }

    gotoNext() {
        this.setState({
            currentImage: this.state.currentImage + 1,
        });
    }

    renderFotos() {

        const { albumList } = this.props;
        const width = this.state.width;
        let i = -1;

        //console.log("renderFotos", albumList);

        return <div>

            <Measure bounds onResize={(contentRect) => this.setState({ width: contentRect.bounds.width })}>
                {
                    ({ measureRef }) => {
                        if (width < 1) {
                            return <div ref={measureRef}></div>;
                        }
                        let columns = 1;
                        if (width >= 480) {
                            columns = 2;
                        }
                        if (width >= 1024) {
                            columns = 3;
                        }
                        if (width >= 1824) {
                            columns = 4;
                        }
                        return <div ref={measureRef}>
                            <Gallery photos={albumList} columns={columns} onClick={this.openLightbox} ImageComponent={ImageDarkening} />
                        </div>
                    }
                }
            </Measure>

            {albumList.map((a) => {
                i++;
                return <Lightbox images={a.fotos}
                    onClose={this.closeLightbox}
                    onClickPrev={this.gotoPrevious}
                    onClickNext={this.gotoNext}
                    currentImage={this.state.currentImage}
                    isOpen={this.state.lightboxIsOpen && this.state.currentAlbum == i}
                    key={i}
                />
            })}

        </div>;

    }

    render() {

        //console.log("render", this.props.titulo, titulo);

        if (this.props.loading)
            return <Spinner />;

        const { titulo } = this.props;

        return (
            <div className="container mt-4">
                {renderTitle(titulo)}
                {this.renderFotos()}
            </div>
        );
    }
}

const mapStateToProps = ({ page }, ownProps) => {

    //console.log('fotos  mapStateToProps', page);

    if (page.loading || !page.pageInfo || ownProps.page != page.currentPage)
        return { loading: true };

    const { albumList } = page.pageInfo;

    if (!albumList)
        return { loading: true };

    const { titulo } = albumList;

    const filteredAlbumList = _.values(_.mapValues(_.pickBy(albumList, (p) => typeof p == 'object'), (o) => {

        //console.log('fotos  mapStateToProps O', page);

        const src = "/src/resources/images/" + o.capa.src;
        const width = Number(o.capa.width.replace("px", ""));
        const height = Number(o.capa.height.replace("px", ""));

        const fotos = _.values(_.mapValues(o.fotos, (f) => {
            return { src: '/src/resources/images/' + f.src, width: f.width, height: f.height }
        }));

        return { src, width, height, fotos, titulo: o.capa.titulo };
    }));

    return { loading: page.loading, titulo, albumList: filteredAlbumList };
}



export default connect(mapStateToProps)(Fotos)