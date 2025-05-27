import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { renderSubTitle } from '../../components/common/util';

class Address extends Component {

  render() {
    console.log('props', this.props, this.ownProps);
    const { subtitulo, localidade, bairro, cidade, uf, nome, cep, telefone } = this.props.address;

    if (!localidade)
      return <div />;

    return (
      <div>
              {renderSubTitle(subtitulo)}
              <div className="mt-3">{localidade}</div>
              <div className="mt-3">{bairro}, {cidade} - {uf}</div>
              <div className="mt-3">CEP{}: {cep}</div>
              <div className="mt-3">{telefone}</div>
      </div>
    );
  }
}

export default connect()(Address)