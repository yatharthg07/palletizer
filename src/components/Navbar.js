import React from 'react';
import { Flex, Button, useColorModeValue } from '@chakra-ui/react';

const Navbar = ({ step }) => {
  const steps = ['Unit Information', 'Results'];
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const inactiveColor = useColorModeValue('gray.200', 'gray.700');
  const activeTextColor = useColorModeValue('white', 'gray.900');
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Flex as="nav" width="full" justify="space-between" wrap="wrap" gap={2}>
      {steps.map((label, index) => (
        <Button
          key={index}
          flex={{ base: '1 0 40%', md: '1' }}
          variant="solid"
          bg={step % 2 === (index + 1)%2 ? activeColor : inactiveColor}
          color={step % 2 === (index + 1)%2 ? 'white' : 'white'}
          _hover={{
            bg: step % 2 === (index + 1)%2 ? 'blue.600' : 'gray.400',
          }}
          fontWeight="medium"
        >
          {label}
        </Button>
      ))}
    </Flex>
  );
};

export default Navbar;