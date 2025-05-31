import React, { Component } from 'react';

class GoogleMap extends Component {

    render() {
        const { lat, lon, title, zoom } = this.props;

        return <iframe
         src={`https://www.google.com/maps?q=${lat},${lon}&z=${zoom}&output=embed&language=pt-br`}
            style={this.props.style}
            frameBorder="0" 
            title={title}
            allowFullScreen />
    }
}

export default GoogleMap;