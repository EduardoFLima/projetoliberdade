import React from 'react';
import { MoonLoader } from 'react-spinners';

export default () => {
    
    return (
        <div className="spinner">
            <div className='moon-loader'>
                <MoonLoader
                    color={'#3A3985'}
                    loading={true}
                />
            </div>
    </div>);
}
