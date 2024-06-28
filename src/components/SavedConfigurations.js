import React from 'react';
import {
  VStack,
  Text,
  Button,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from '@chakra-ui/react';

function SavedConfigurations({ configurations, applyConfiguration, deleteConfiguration }) {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const configBgColor = useColorModeValue('white', 'gray.600');

  return (
    <VStack spacing={4} align="stretch">
      <Accordion allowToggle>
        {configurations.map((config, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton bg={bgColor}>
                <Box flex="1" textAlign="left" fontWeight="bold" color={textColor}>
                  {config.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg={configBgColor}>
              <Text fontSize="sm" color={textColor}>
                Grid: {config.gridWidth}m x {config.gridHeight}m
              </Text>
              <Text fontSize="sm" color={textColor}>
                Boxes: {config.boxes.length}
              </Text>
              <Button
                mt={2}
                size="sm"
                colorScheme="blue"
                onClick={() => applyConfiguration(config)}
              >
                Apply
              </Button>
              <Button
                mt={2}
                ml={2}
                size="sm"
                colorScheme="red"
                onClick={() => deleteConfiguration(config)}
              >
                Delete
              </Button>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
}

export default SavedConfigurations;