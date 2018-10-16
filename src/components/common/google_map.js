import React, { Component } from 'react';

class GoogleMap extends Component {

    /* componentDidMount(){
 
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
     }*/

    render() {
        //return <div className="map border" style={ this.props.style ? {...this.props.style} : null } ref="map" />;
        return <iframe src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3662.5989341996765!2d-46.59801984962991!3d-23.366540584705294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cef18bb3a0d019%3A0x6aa85706d4c5ed0f!2sEstr.+Mun.+Voltas%2C+Mairipor%C3%A3+-+SP%2C+07600-000!5e0!3m2!1spt-BR!2sbr!4v1539714182849`}
            style={this.props.style} frameBorder="0" allowFullScreen />
    }
}

export default GoogleMap;