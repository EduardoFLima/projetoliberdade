import React from 'react';

export const isIE = () => {
  return /MSIE \d|Trident.*rv:/.test(navigator.userAgent);
}

export const appendScriptTag = (src) => {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
}

export const renderTitle = (value) => {

  if (!value)
    return null;

  return <div>
    {renderTitleText(value)}
    {renderUnderTitle()}
  </div>;
}

export const renderTitleText = (value) => {
  return <div className="row text-center">
    <div className="col-12">
      <h4 className="title" ><b>{value}</b></h4>
    </div>
  </div>;
}

export const renderUnderTitle = () => {
  return <div className="row">
    <div className="col-4" />
    <div className="col-4"><hr className="under-title" /></div>
    <div className="col-4" />
    <br />
  </div>;
}

export const renderSubTitleRow = (value) => {

  if (!value)
    return null;


  return <div className="row">
    <div className="col-12">
      {renderSubTitle(value)}
    </div>
    <br /><br />
  </div>;
}

export const renderSubTitle = (value) => {
  
  if (!value)
    return null;

  return <h5 className="subtitle"><b>{value}</b></h5>;
}
