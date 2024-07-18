import React from 'react';
import { Flex, Text, Switch, useColorModeValue } from '@chakra-ui/react';

const ModeToggle = ({ mode, toggleMode }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const switchColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Flex align="center">
      <Text mr={2} fontWeight="medium" color={textColor}>
        {mode === 'auto' ? 'Auto' : 'Manual'}
      </Text>
      <Switch
        isChecked={mode === 'manual'}
        onChange={toggleMode}
        colorScheme="blue"
        size="md"
      />
    </Flex>
  );
};

export default ModeToggle;