import {Group, Image} from '@mantine/core';
import React, {useState} from 'react';

// vector of image sources
const imageSources = [
    '/img.png', '/img_1.png', '/img_2.png', '/img_3.png', '/img_4.png', '/img_5.png',
    '/img_1.png', '/img_5.png', '/img_2.png', '/img_4.png', '/img.png', '/img_3.png',
    '/img.png', '/img_2.png', '/img_5.png'
];

const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '25px',
    justifyContent: 'center',
    marginTop: '50px',
    marginBottom: 'auto',
    marginLeft: '50px',
    marginRight: '50px',
};

const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    width: '250px',
    height: '250px',
    transition: 'transform 0.3s ease-in-out, margin 0.3s ease-in-out',
};

export default function HoverImages() {

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <Group style={groupStyle}>
            {imageSources.map((src, index) => {
                const isHovered = index === hoveredIndex;
                const containerDynamicStyle: React.CSSProperties = {
                    ...imageContainerStyle,
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    zIndex: isHovered ? 1 : 0,
                };

                return (
                    <div
                        key={index}
                        style={containerDynamicStyle}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <Image
                            src={src}
                            width="100%"
                            height="100%"
                            alt={`Image ${index + 1}`}
                            style={{objectFit: 'cover'}}
                            loading={"lazy"}
                        />
                    </div>
                );
            })}
        </Group>
    );
};
