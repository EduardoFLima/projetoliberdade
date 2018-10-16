import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarNav, NavbarToggler, Collapse, NavItem, NavLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'mdbreact';
import { connect } from 'react-redux';
import { fetchHeaderInfo, fetchPageInfo } from '../actions/index';
import _ from 'lodash';

import firebase from 'firebase';
import { appendScriptTag } from './common/util';
import configuration from '../resources/config/config';
import config from 'react-global-configuration';

import {
    FIREBASE_API_KEY
    //GOOGLE_MAPS_API_KEY
} from './common/constants';


class Header extends Component {

    constructor(props) {
        super(props);

        //console.log("header constructor");

        this.state = {
            collapse: false,
            isWideEnough: false,
        };

        config.set(configuration);

        firebase.initializeApp(config.get(FIREBASE_API_KEY));

        this.onNavbarTogglerClick = this.onNavbarTogglerClick.bind(this);

        this.props.fetchHeaderInfo();

    }

    /*componentDidMount() {
        appendScriptTag(`https://maps.googleapis.com/maps/api/js?key=${config.get(GOOGLE_MAPS_API_KEY)}`);
    }*/

    onNavbarTogglerClick() {
        this.setState({
            collapse: !this.state.collapse,
        });
    }

    renderMenuItems(menu, currentPage) {

        if (!menu)
            return <div />;

        return (_.map(_.sortBy(menu, (m) => m.order), (value, key) => {


            if (!value.hasSubMenu && !value.menuText)
                return <div key={key} />;

            if (value.hasSubMenu) {
                
                const active = value.subMenu[currentPage] ? 'active' : '';
                
                //console.log('key/value', key, value);
                
                return (<NavItem key={key} className={active}>
                    <Dropdown>
                        <DropdownToggle nav caret>{value.menuText}</DropdownToggle>
                        <DropdownMenu>
                            {this.renderSubMenuItems(value.subMenu)}
                        </DropdownMenu>
                    </Dropdown>
                </NavItem>);
            }
            else {
                
                const active = currentPage != '' && value.href.indexOf(currentPage) > -1 ? 'active' : '';

                return (
                    <NavItem key={key} className={active} >
                        <NavLink to={value.href} onClick={this.onNavbarTogglerClick} >{value.menuText}</NavLink>
                    </NavItem>
                );

            }



        }));

    }

    renderSubMenuItems(subMenu) {

        if (!subMenu)
            return <div />;

        return (_.map(_.sortBy(subMenu, (m) => m.order), (value, key) => {

            const arr = value.href.split('/');
            const last = arr[arr.length - 1];
            const href = arr.length <= 2 ? `${value.href}#${last}` : `${value.href.substring(0, value.href.lastIndexOf(last)-1)}#${last}`;

            return <DropdownItem key={key} href={href} onClick={this.onNavbarTogglerClick}  >{value.menuText}</DropdownItem>;

        }));


    }

    render() {

        //console.log("header render", this.state.collapse);

        if (!this.props.menu)
            return <div />;


        return (
            <Navbar className="headerNavbar" expand="lg" sticky="top" dark scrolling>
                <NavbarBrand href="/">
                    <img src="/src/resources/images/logo_proj_liberdade.png" height="40" />

                </NavbarBrand>
                {!this.state.isWideEnough && <NavbarToggler onClick={this.onNavbarTogglerClick} />}
                <Collapse isOpen={this.state.collapse} navbar>

                    <NavbarNav left />
                    <NavbarNav right>
                        {this.renderMenuItems(this.props.menu, this.props.currentPage)}
                    </NavbarNav>
                </Collapse>
            </Navbar>

        );
    }

}

const MapStateToProps = (state) => {

    //console.log('header mapStateToProps', state);

    const { header } = state;
    const headerValues = { menu: {}, currentPage: '' };

    const pageLoading = _.filter(state, (v) => { return !v.loading && !v.headerInfo });

    
    if (pageLoading && pageLoading.length > 0 && pageLoading[0].currentPage)
        headerValues['currentPage'] = pageLoading[0].currentPage;

    _.mapKeys(header.headerInfo, (value, key) => {

        const menuObj = {
            order: value.order,
            hasSubMenu: value.submenu ? value.submenu : false,
            subMenu: {}
        };

        menuObj['menuText'] = value.menuText;

        if (menuObj.hasSubMenu) {

            _.mapKeys(_.pickBy(value, (v) => typeof v == 'object'), (subValue, subKey) => {

                const subMenuObj = {
                    menuText: subValue.menuText,
                    order: subValue.order,
                    href: `/${key + (subKey == key ? '' : '/' + subKey)}`
                };


                menuObj['subMenu'][subKey] = subMenuObj;

                return subKey;
            });
        }
        else
            menuObj['href'] = `/${key}`;

        headerValues['menu'][key] = menuObj;

        return key
    });

    return headerValues;
}

export default connect(MapStateToProps, { fetchHeaderInfo })(Header);