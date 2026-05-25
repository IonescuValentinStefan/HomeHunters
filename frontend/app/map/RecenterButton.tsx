// RecenterButton.tsx
import React from 'react';
import {Button} from '@mantine/core';

// Define the type for the props
interface RecenterButtonProps {
    onClick: () => void;
}

const RecenterButton: React.FC<RecenterButtonProps> = ({onClick}) => {
    return (
        <Button onClick={onClick} variant="filled" color="blue">
            Recenter to Current Location
        </Button>
    );
};

export default RecenterButton;
