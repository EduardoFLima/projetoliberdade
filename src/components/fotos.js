import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchFotosPageInfo } from '../actions/index';
import Spinner from './common/spinner';
import Gallery from 'react-photo-gallery';
import Lightbox from 'react-images';
import _ from 'lodash';
import ImageDarkening from './common/ImageDarkening';

class Fotos extends Component {

    constructor(props) {
        super(props);

        this.state = { currentImage: 0, currentAlbum: '' };
        this.closeLightbox = this.closeLightbox.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.gotoNext = this.gotoNext.bind(this);
        this.gotoPrevious = this.gotoPrevious.bind(this);

        this.props.fetchFotosPageInfo();
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
        let i = -1;


        //console.log("renderFotos", albumList);

        return <div>
            <Gallery ref='test' photos={albumList} onClick={this.openLightbox} ImageComponent={ImageDarkening} />

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
            <div className="content" >
                <h4>{titulo}</h4>
                <div className="inner-content-fotos">
                    {this.renderFotos()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ fotosPage, loading }) => {

    //console.log('fotos  mapStateToProps', fotosPage);

    const { fotos } = fotosPage;

    if (!fotosPage || loading || !fotos)
        return { loading: true };

    const { titulo } = fotos;

    if (!fotos.albumList || !titulo)
        return { loading: true };

    const albumList = _.values(_.mapValues(fotos.albumList, (o) => {

        const src = "/src/resources/images/" + o.capa.src;
        const width = Number(o.capa.width.replace("px", ""));
        const height = Number(o.capa.height.replace("px", ""));

        const fotos = _.values(_.mapValues(o.fotos, (f) => {
            return { src: '/src/resources/images/' + f.src, width: f.width, height: f.height }
        }));

        return { src, width, height, fotos, titulo: o.capa.titulo };
    }));

    return { loading, titulo, albumList };
}



export default connect(mapStateToProps, { fetchFotosPageInfo })(Fotos)