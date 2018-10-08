import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Spinner from './spinner';
import Sidebar from './sidebar';
import { renderTitle, renderSubTitleRow} from './util';


class Content extends Component {

  constructor(props) {
    super(props);

    this.state = { loading: true, pageInfo : null };

    const pageInfoIsEmpty = Object.keys(this.props.pageInfo).length === 0 && this.props.pageInfo.constructor === Object;

    if (pageInfoIsEmpty || !this.props.pageInfo[this.props.page])
      this.props.fetchMethod(this.props.page);
  }

  componentDidMount() {
    this.scrollTo();
  }

  componentDidUpdate() {
    this.scrollTo();
  }
  

  scrollTo() {

    if (this.props.page) {
      const element = document.getElementById(this.props.page);

      if (element)
        element.scrollIntoView(true);
    }

  }

  renderPageInfo() {

    const { pageInfo } = this.props;

    if (!pageInfo)
      return <div />;

    const filteredPageInfo = _.mapValues(_.pickBy(pageInfo, (i) => typeof i == 'object'), (value, key) => {
      return { ...value, 'page': key }
    });

    return _.map(_.sortBy(filteredPageInfo, (i) => i.order), (value, objKey) => {

      //console.log('value', value.subtitulo);
      return <div className="block" key={objKey} >

        <div className="anchor" id={value.page ? value.page : ''} />

        {renderTitle(value.titulo)}
        {renderSubTitleRow(value.subtitulo)}

        {this.renderContent(value)}

      </div>
    });
  }

  renderContent(pageContent) {

    if (!pageContent)
      return <div />;

    return _.map(_.pickBy(pageContent, (c) => typeof c == 'object'), (value, objKey) => {

      //console.log('objKey/value', objKey, value);

      if (objKey == 'menuText' || objKey == 'order' || objKey == 'subtitulo' || objKey == 'titulo')
        return null;

      return <div className="row mt-3" key={objKey}>

        {(value.img_esq) ? <div className="col-lg-6 col-md-12 d-flex justify-content-center align-items-center"><img className="img-esq" src={`/src/resources/images/${value.img_esq.src}`} style={{ width: value.img_esq.largura, height: value.img_esq.altura }} /></div> : null}

        {this.renderText(value)}

        {objKey == `video` ? this.renderVideo(value.url) : null }

        {(value.img_dir) ? <div className="col-lg-6 col-md-12 d-flex justify-content-center align-items-center"><img className="img-dir" src={`/src/resources/images/${value.img_dir.src}`} style={{ width: value.img_dir.largura, height: value.img_dir.altura }} /></div> : null}
      </div>
    });

  }

  renderText(value) {

    if (!value.txts)
      return null;

    return <div className={`text-center ${value.img_esq || value.img_dir ? "col-lg-6 col-md-12" : "col-12"}`}>
      
      {_.map(value.txts, (txt, txtKey) => {

        if (txtKey == "ul") {
          return <ul key={txtKey} className="text-left" >{_.map(txt, (liTxt, liKey) => <li key={liKey}>{liTxt}</li>)}</ul>
        }

        return <p key={txtKey} className="text-justify" >{txt}</p>;
      })}

    </div>

  }

  renderVideo(url) {

    if (!url)
      return null;

    return <div className="col-12">
            <div className="w-75 m-auto embed-responsive embed-responsive-16by9" >
              <iframe className="embed-responsive-item" src={url} />
            </div>
          </div>;
  }

  renderSidebar() {

    if (this.props.sidebar)
      return <Sidebar sidebar={this.props.pageInfo} page={this.props.page} titulo={this.props.fetchResult.titulo} />;
  }

  render() {

    console.log(this.props);
    
    if (this.props.loading)
      return <Spinner />


    return (
      <section className="container mt-4">
        {this.renderPageInfo()}
      </section>
    );
  }
}

const mapStateToProps = ({ page }, ownProps) => {

  console.log('page', page);

  if (page.loading || !page.pageInfo || ownProps.page != page.currentPage)
    return { pageInfo: {}, loading: true };

  const { pageInfo, loading } = page;

  console.log('aqui');

  return {
    page: ownProps.location.hash ? ownProps.location.hash.substring(1) : ownProps.page,
    //sidebar: pageInfo.sidebar ? true : false, //_.omit(_.mapValues(pageInfo, (value, key) => { return {to : `/${ownProps.page}/${key == ownProps.page ? '' : key}`,  text : value.menu_txt ? value.menu_txt : value.titulo, order : value.order ? value.order : 1 } }),  "sidebar") : false, 
    //fetchResult: pageInfo[hasSubpages ? ownProps.match.params.id : ownProps.page],
    pageInfo,
    loading
  };
}

export default connect(mapStateToProps)(Content);