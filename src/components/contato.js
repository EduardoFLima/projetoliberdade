import React, { Component } from 'react';
import GoogleMap from './common/google_map';
import { connect } from 'react-redux';
import _ from 'lodash';
import Spinner from './common/spinner';
import { renderTitle, renderSubTitle } from './common/util';
import { IoMdPhonePortrait, IoLogoWhatsapp, IoLogoFacebook, IoLogoInstagram } from 'react-icons/io';

class Contato extends Component {

  constructor(props) {
    super(props);

    //console.log('constructor contato ', this.props);
    
    if (this.props.loading)
      this.props.fetchMethod(this.props.page);
  }
  
  componentWillReceiveProps(nextProps){
    //console.log('componentWillReceiveProps', nextProps);
    this.setState({ loading: true, pageInfo : null });
  }

  render() {

    //console.log('this.props', this.props);

    if (this.props.loading)
      return <Spinner />;

    if (!this.props.contato || (Object.keys(this.props.contato).length === 0 && this.props.contato.constructor === Object))
      return <div />;

    const { endereco, titulo, email, telefone, map, social } = this.props.contato;
    const { localidade, bairro, cidade, uf, nome } = endereco;

    return (
      <section className="container-fluid block mt-4" >
        {renderTitle(titulo)}

        <div className="container-fluid px-0">
          <div className="row">
            <div className="col-12 px-0">
              <GoogleMap {...map} style={{ width: '100vw', height: '35vh', border: '0' }} />
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">

            <div className="col-sm-6 col-12 mt-5">
              {renderSubTitle(endereco.subtitulo)}
              <div className="mt-3">{localidade}</div>
              <div className="mt-3">{bairro}, {cidade} - {uf}</div>
              <div className="mt-3"><b>{nome}</b></div>
            </div>

            <div className="col-sm-6 col-12 mt-5">
              <div className="d-inline-flex">
                {renderSubTitle(telefone.subtitulo)}
                <IoMdPhonePortrait color="#00AA5A" className="ml-3" />
                <IoLogoWhatsapp color="#00AA5A" className="ml-3" />
              </div>
              {_.map(telefone.contatos, (contato, key) => {
                return <div key={key} className="telefone-contato mt-3" ><span className="telefone-contato-nome">{contato.nome}</span><span className="telefone-contato-numero">{contato.numero}</span></div>
              })}

            </div>
          </div>
          <div className="row">

            <div className="col-sm-6 col-12 mt-5">
              <div className="container pl-0">
                <div className="row">
                  <div className="col-12">
                    {renderSubTitle(social.subtitulo)}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-xl-3 col-6 d-flex justify-content-center" >
                    <div>
                      <a target="_blank" href={social.fb.url} ><IoLogoFacebook color="#00AA5A" style={{ width: social.fb.img.largura, height: social.fb.img.altura }} /></a>
                    </div></div>
                  <div className="col-xl-3 col-6 d-flex justify-content-center">
                    <a target="_blank" href={social.insta.url}><IoLogoInstagram color="#00AA5A" style={{ width: social.insta.img.largura, height: social.insta.img.altura }} /></a>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-3 col-6 d-flex justify-content-center">
                    <b>{social.fb.url.substring(social.fb.url.lastIndexOf("/"))}</b>
                  </div>
                  <div className="col-xl-3 col-6 d-flex justify-content-center">
                    <b>{social.insta.url.substring(social.insta.url.lastIndexOf("/")).replace("/", "@")}</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-12 mt-5">
              {renderSubTitle(email.subtitulo)}
              <div>{email.endereco}</div>
            </div>
          </div>
        </div>



      </section >
    );
  }
}

const mapStateToProps = ({ page }, ownProps) => {

  //console.log('mapStateToProps contatoPage', page, ownProps);

  if (page.loading || !page.pageInfo || ownProps.page != page.currentPage)
    return { loading: true };

  return {
    contato: page.pageInfo,
    loading: page.loading
  };
}

export default connect(mapStateToProps)(Contato)