import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {

    shouldComponentUpdate(){
        return false;
    }

    render() {        
        return (
            <header className="container-header clearfix" >
                <div className="logo">
                    <Link to="/"><img src="/src/resources/images/logo_proj_liberdade.png" />
                    </Link>
                </div>
                <div className="menu-group">
                    <Link to="/historia" className="btn btn-success menu-item">
                        HISTÓRIA
                    </Link>
                    <Link to="/servicos" className="btn btn-success menu-item">
                        SERVIÇOS
                    </Link>
                    <Link to="/missao" className="btn btn-success menu-item">
                        MISSÃO
                    </Link>
                    <Link to="/equipe" className="btn btn-success menu-item">
                        EQUIPE
                    </Link>
                    <Link to="/hippussuit" className="btn btn-success menu-item">
                        HIPPUSSUIT
                    </Link>
                    <Link to="/fotos" className="btn btn-success menu-item">
                        FOTOS
                    </Link>
                    <Link to="/videos" className="btn btn-success menu-item">
                        VÍDEOS
                    </Link>
                    <Link to="/contato" className="btn btn-success menu-item">
                        CONTATO
                    </Link>
                </div>
                <hr/>
            </header>
        );
    }

}

export default Header;