import React from 'react';
import { Flex, Button, useColorModeValue } from '@chakra-ui/react';

const Navbar = ({ step }) => {
  const steps = ['Unit Information', 'Results'];
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const inactiveColor = useColorModeValue('gray.300', 'gray.600');
  console.log(step);

  return (
    <Flex as="nav" width="full" justify="space-between">
      {steps.map((label, index) => (
        <Button
          key={index}
          flex="1"
          variant="solid"
          bg={step % 2 === (index + 1)%2 ? activeColor : inactiveColor}
          color={step % 2 === (index + 1)%2 ? 'white' : 'white'}
          _hover={{
            bg: step % 2 === (index + 1)%2 ? 'blue.600' : 'gray.400',
          }}
        >
          {label}
        </Button>
      ))}
    </Flex>
  );
};

export default Navbar;