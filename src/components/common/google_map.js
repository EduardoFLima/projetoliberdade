import React, { Component } from 'react';

class GoogleMap extends Component {

    componentDidMount(){

        const position = { 
            lat:this.props.lat,
            lng:this.props.lon
        };
        
        const map = new google.maps.Map(this.refs.map, {
            zoom: this.props.zoom,
            center: position
        });
        
        new google.maps.Marker({
            position,
            map,
            title: this.props.title
            });
    }

    render(){
        return <div className="map" ref="map" />;
    }
}

export default GoogleMap;