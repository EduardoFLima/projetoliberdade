import React from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export default (props) => {

    if (!props.sidebar)
        return <div />;

    const sidebar = _.omit(_.mapValues(props.sidebar, (value, key) => { return { to: `/${props.page}/${key == props.page ? '' : key}`, text: value.menu_txt ? value.menu_txt : value.titulo, order: value.order ? value.order : 1 } }), "sidebar");

    return <div className="sidebar list-group">
        {_.map(_.sortBy(sidebar, (r) => r.order), (value, objKey) => {

            const linkProps = {
                key: objKey,
                className: `list-group-item list-group-item-action ${props.titulo && value["text"] == props.titulo ? 'list-group-item-active' : ''}`,
                to: value["to"]
            };

            return <Link {...linkProps}  >{value["text"]}</Link>
        })}
    </div>
}