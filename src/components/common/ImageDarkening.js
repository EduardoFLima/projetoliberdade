import React, { Component } from "react";
import { isMobile } from 'react-device-detect';

class SelectedImage extends Component {

    constructor(props) {
        super(props);

        this.state = { showOverlay: isMobile ? true : false };
    }

    showOverlay() {
        this.setState({ showOverlay: true });
    }

    hideOverlay() {
        if (!isMobile)
            this.setState({ showOverlay: false });
    }

    render() {


        const { index, photo, onClick, margin } = this.props;
        //console.log('photo', photo);

        const commonStyle = { margin, height: photo.height, width: photo.width, cursor: 'pointer', borderRadius: '9px' }

        const overlayStyle = {
            position: 'absolute',
            backgroundColor: this.state.showOverlay ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0)',
        };

        const overlayTextStyle = {
            position: 'absolute',
            color: 'white',
            fontSize: '30px',
            margin: '0',
            marginRight: '-50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'

        }

        return <div className="dkImageDiv"
            style={{ ...commonStyle }}
        >
            <div className="overlay"
                style={{ ...commonStyle, ...overlayStyle }}
                onMouseEnter={this.showOverlay.bind(this)}
                onMouseLeave={this.hideOverlay.bind(this)}
                onClick={e => onClick(e, { index, photo })}
            >
                <span style={{ ...overlayTextStyle }} >{this.state.showOverlay ? photo.titulo : ''}</span>
            </div>
            <img
                src={photo.src}
                className="dkImage"
                style={{ ...commonStyle }}
            />

        </div>
    }
}


export default SelectedImage;