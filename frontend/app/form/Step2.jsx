import React from 'react';
import {Radio, Select} from '@mantine/core';

function Step1({formValues, setFormValues}) {
    return (
        <>
            <Select
                label="Property Type"
                placeholder="Select property type"
                data={['Apartment', 'House', 'Field', 'Commercial', 'Penthouse']}
                value={formValues.propertyType}
                onChange={(value) => setFormValues({...formValues, propertyType: value})}
                required
            />
            <Radio.Group
                label="Transaction Type"
                value={formValues.transactionType}
                onChange={(value) => setFormValues({...formValues, transactionType: value})}
                required
            >
                <Radio value="selling" label="Selling"/>
                <Radio value="renting" label="Renting"/>
            </Radio.Group>
        </>
    );
}

export default Step1;
