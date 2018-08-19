import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Redirect } from 'react-router-dom';
import Spinner from './spinner';
import { leaveContentPage } from '../../actions';
import Sidebar from './sidebar';
 

class Content extends Component {

  constructor(props){
    super(props);
    
    const pageInfoIsEmpty = Object.keys(this.props.pageInfo).length === 0 && this.props.pageInfo.constructor === Object;
    
    if (pageInfoIsEmpty || !this.props.pageInfo[this.props.page])
      this.props.fetchMethod(this.props.page, this.props.match.params && this.props.match.params.id ? this.props.match.params.id : "");
  }

  renderFetchResult(){

    const { fetchResult } = this.props;

    if (fetchResult){
      return _.map(fetchResult, (value, objKey) => {
              return <div key={objKey}>
              {(value.img_esq) ? <img className="img-esq" src={`/src/resources/images/${value.img_esq.src}`} style={{width:value.img_esq.largura, height:value.img_esq.altura}} /> : null}
              {(value.img_dir) ? <img className="img-dir" src={`/src/resources/images/${value.img_dir.src}`} style={{width:value.img_dir.largura, height:value.img_dir.altura}} /> : null}
              {value.txts ? _.map(value.txts, (txt, txtKey) => {

                if (txtKey == "ul"){
                  return <ul key={txtKey} >{_.map(txt, (liTxt, liKey) => <li key={liKey}>{liTxt}</li>)}</ul>
                }

                  return <p key={txtKey} >{txt}</p>;
                }) : null}
                  </div>
              });
    }
    else return <div/>;
  }

  renderSidebar(){

    if (this.props.sidebar)
      return <Sidebar sidebar={this.props.pageInfo} page={this.props.page} titulo={this.props.fetchResult.titulo} />;
  }

  render() {

    if (this.props.loading)
      return <Spinner />

    return (
    <div className="content">
      <h4>{this.props.fetchResult && this.props.fetchResult.titulo ? this.props.fetchResult.titulo : null }</h4>
      <br/>
      <div className="inner-content">
        {this.renderSidebar()}
        <div className="right-inner-content" >
          <h5>{this.props.fetchResult && this.props.fetchResult.subtitulo ? this.props.fetchResult.subtitulo : null }</h5>
          {this.renderFetchResult()}   
        </div>
      </div>
    </div>
    );
  }
}

const mapStateToProps = ({ page}, ownProps) => {

  //console.log(page);
  
  if (page.loading || !page.pageInfo || !page.pageInfo[ownProps.page])
    return { pageInfo: {}, loading: true };
  
  const { pageInfo, loading } = page;  
  const hasSubpages = ownProps.match.params && ownProps.match.params.id;
   
  return { page: ownProps.page,
           sidebar: pageInfo.sidebar ? true : false, //_.omit(_.mapValues(pageInfo, (value, key) => { return {to : `/${ownProps.page}/${key == ownProps.page ? '' : key}`,  text : value.menu_txt ? value.menu_txt : value.titulo, order : value.order ? value.order : 1 } }),  "sidebar") : false, 
           fetchResult: pageInfo[hasSubpages ? ownProps.match.params.id : ownProps.page],
           pageInfo,
           loading };
}

export default connect(mapStateToProps, { leaveContentPage })(Content);