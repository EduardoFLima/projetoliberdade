import React, { Component } from 'react';
import GoogleMap from './common/google_map';
import { connect } from 'react-redux';
import { fetchContatoPageInfo } from '../actions';
import _ from 'lodash';
import Spinner from './common/spinner';

class Contato extends Component {
  
  constructor(props){
    super(props);

    this.props.fetchContatoPageInfo();
  }
    
  render() {

    if (this.props.loading)
      return <Spinner />;

    if (!this.props.contato || (Object.keys(this.props.contato).length === 0 && this.props.contato.constructor === Object))
      return <div />;

    const { endereco, titulo, email, telefone, map, social } = this.props.contato;
    const { localidade, bairro, cidade, uf, nome } = endereco;

    return (
      <div className="content" >
        <h4>{titulo}</h4>
        <div className="inner-content">
          <div className="contato-left-inner-content">
            <div className="phone-group">
              <h5>{telefone.subtitulo}
                <span className="telefone-img">
                  <a href="http://glyphicons.com/" ><span className="glyphicon glyphicon-phone" /></a>
                  <img src={`/src/resources/images/${telefone.whatsapp.img.src}`} style={{width:telefone.whatsapp.img.largura, height: telefone.whatsapp.img.largura}} />
                </span>
              </h5>
              {_.map(telefone.contatos, (contato, key) => {
                return <div key={key} className="telefone-contato" ><span className="telefone-contato-nome">{contato.nome}</span><span className="telefone-contato-numero">{contato.numero}</span></div>
              }) }
            </div>
            <div className="email-group">
              <h5>{email.subtitulo}</h5>
              <div>{email.endereco}</div>
            </div>
            <div className="social">
              <h5>{social.subtitulo}</h5>
              <div className="social-icons">
                <div className="fb-div">
                  <a target="_blank" href={social.fb.url}><img src={`/src/resources/images/${social.fb.img.src}`} style={{ width: social.fb.img.largura, height: social.fb.img.altura}}/></a>
                </div>
                <div className="insta-div">
                  <a target="_blank" href={social.insta.url} style={{ width: social.insta.img.largura, height: social.insta.img.altura}}>
                    <img src={`/src/resources/images/${social.insta.img.src}`} style={{ width: social.insta.img.largura, height: social.insta.img.altura}}/>
                    </a>
                </div>
              </div>
            </div>
          </div>
          <div className="contato-right-inner-content">
            <div className="endereco-group">
              <h5>{endereco.subtitulo}</h5>
              <div>{localidade}</div>
              <div>{bairro}, {cidade} - {uf}</div>
              <div><b>{nome}</b></div>
              <GoogleMap { ...map } />              
            </div>
          </div>
      </div>
    </div>
    );
  }
}

const mapStateToProps = ({ contatoPage }) => {
  
  const { loading, contato } = contatoPage;

  return { contato,
           loading };
}

export default connect(mapStateToProps, { fetchContatoPageInfo })(Contato)