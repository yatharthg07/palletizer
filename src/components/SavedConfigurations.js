import React, { useState } from 'react';
import {
  VStack,
  Text,
  Button,
  Image,
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';

const SavedConfigurations = ({ configurations, applyConfiguration, deleteConfiguration }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    onOpen();
  };

  return (
    <>
      <VStack spacing={4} align="stretch">
        {configurations.map((config, index) => (
          <Box key={index} borderWidth="1px" borderRadius="lg" p={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Box>
                <Text color='white' fontWeight="bold">{config.name}</Text>
                <Text color='white' fontSize="sm">Grid: {config.gridWidth}x{config.gridHeight}</Text>
                <Text color='white' fontSize="sm">Box: {config.boxWidth}x{config.boxLength}x{config.boxHeight}</Text>
                <Text color='white' fontSize="sm">Layers: {config.numLayers}</Text>
              </Box>
              {config.previewImage && (
                <Box position="relative" cursor="pointer">
                  <Image 
                    src={config.previewImage} 
                    alt={`Preview of ${config.name}`}
                    boxSize="100px"
                    objectFit="contain"
                  />
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    opacity="0"
                    bg="rgba(0,0,0,0.5)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    transition="opacity 0.2s"
                    _hover={{ opacity: 1 }}
                    onClick={() => handleImageClick(config.previewImage)}
                  >
                    <ViewIcon color="white" boxSize={6} />
                  </Box>
                </Box>
              )}
            </Flex>
            <Flex mt={2} justifyContent="space-between">
            <Button size="sm" colorScheme="red" onClick={() => deleteConfiguration(config)}>Delete</Button>
              <Button size="sm" colorScheme='green' onClick={() => applyConfiguration(config)}>Apply</Button>
              
            </Flex>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color='white'>Configuration Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image 
                src={selectedImage} 
                alt="Configuration Preview"
                maxW="100%"
                maxH="70vh"
                objectFit="contain"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SavedConfigurations;