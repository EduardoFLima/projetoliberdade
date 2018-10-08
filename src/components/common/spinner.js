import React from 'react';
import { MoonLoader } from 'react-spinners';

export default () => {
    
    return (
        <div className="row spinner block">
            <div className="m-auto">
                <MoonLoader
                    color={'#3A3985'}
                    loading={true}
                />
            </div>
    </div>);
}
