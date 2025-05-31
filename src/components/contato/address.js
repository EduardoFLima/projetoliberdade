import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { renderSubTitle } from '../../components/common/util';
import GoogleMap from './google_map';

class Address extends Component {

  render() {
    const { subtitulo, localidade, bairro, cidade, uf, nome, cep, telefone, mapa } = this.props.address;

    if (!localidade)
      return <div />;

    return (
      <div>
        {renderSubTitle(subtitulo)}
        <div className="mt-3">{localidade}</div>
        <div className="mt-3">{bairro}, {cidade} - {uf}</div>
        <div className="mt-3">CEP: {cep}</div>
        <div className="mt-3">{telefone}</div>


        <div className="row mt-5 mb-3">
          <div className="col-12 px-3 min-vh-100">
            <GoogleMap {...mapa} 
            style={{ width: '90%', height: '30vh' }}
            title={nome}
             />
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(Address)