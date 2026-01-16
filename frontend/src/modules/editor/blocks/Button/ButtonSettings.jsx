// frontend/src/modules/editor/blocks/Button/ButtonSettings.jsx
import React from 'react';
import ButtonEditor from '../../ui/components/ButtonEditor';

const ButtonSettings = ({ data, onChange, siteData }) => {
    return (
        <div style={{ paddingBottom: '20px' }}>
            <ButtonEditor 
                data={data} 
                onChange={onChange} 
                siteData={siteData} 
            />
        </div>
    );
};

export default ButtonSettings;