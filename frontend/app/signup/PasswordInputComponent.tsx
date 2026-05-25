import React, {useState} from 'react';
import {Box, PasswordInput, Popover, Progress, rem, Text} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {IconCheck, IconX} from '@tabler/icons-react';

function PasswordRequirement({meets, label}: { meets: boolean; label: string }) {
    return (
        <Text
            c={meets ? 'teal' : 'red'}
            style={{display: 'flex', alignItems: 'center'}}
            mt={7}
            size="sm"
            component="span"
        >
            {meets ? (
                <IconCheck style={{width: rem(14), height: rem(14)}}/>
            ) : (
                <IconX style={{width: rem(14), height: rem(14)}}/>
            )}{' '}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

export const requirements = [
    {re: /[0-9]/, label: 'Includes number'},
    {re: /[a-z]/, label: 'Includes lowercase letter'},
    {re: /[A-Z]/, label: 'Includes uppercase letter'},
    {re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol'},
];

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

interface PasswordInputComponentProps {
    value: string;
    onChange: (value: string) => void;
}

export function PasswordInputComponent({value, onChange}: PasswordInputComponentProps) {
    const [visible, {toggle}] = useDisclosure(false);
    const [popoverOpened, setPopoverOpened] = useState(false);

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)}/>
    ));

    return (
        <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{transition: 'pop'}}>
            <Popover.Target>
                <div
                    onFocusCapture={() => setPopoverOpened(true)}
                    onBlurCapture={() => setPopoverOpened(false)}
                >
                    <PasswordInput
                        label="Password"
                        placeholder="marius"
                        type="password"
                        visible={visible}
                        onVisibilityChange={toggle}
                        value={value}
                        onChange={(event) => onChange(event.currentTarget.value)}
                        required
                    />
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs"/>
                <PasswordRequirement label="Includes at least 6 characters" meets={value.length > 5}/>
                {checks}
            </Popover.Dropdown>
        </Popover>
    );
}
