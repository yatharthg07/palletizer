import React from 'react';
import { Flex, Text, Switch, useColorModeValue } from '@chakra-ui/react';

const ModeToggle = ({ mode, toggleMode }) => {
  const textColor = useColorModeValue('gray.600', 'gray.800');

  return (
    <Flex mr={2}align="center">
      <Text mr={2} fontWeight="medium" color={textColor}>
        {mode === 'auto' ? 'Auto Mode' : 'Manual Mode'}
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