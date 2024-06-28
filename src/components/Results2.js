import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Button, VStack, HStack, Text, Flex, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import Visual from './Visual';

const socket = io('http://localhost:5000');

const Results2 = ({ coordinates, palletDimensions, prevStep }) => {
  const [messages, setMessages] = useState([{type:'prompt',content:"Trying to connect"}]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [processStarted, setProcessStarted] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    socket.on('prompt', (data) => {
      setMessages((prevMessages) => [...prevMessages, { type: 'prompt', content: data.message }]);
      setWaitingForInput(true);
    });

    socket.on('info', (data) => {
      setMessages((prevMessages) => [...prevMessages, { type: 'info', content: data.message }]);
      if (processStarted) {
        setWaitingForInput(true);
      }
    });

    socket.on('error', (data) => {
      setMessages((prevMessages) => [...prevMessages, { type: 'error', content: data.message }]);
      toast({
        title: "Error",
        description: data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    });

    return () => {
      socket.off('prompt');
      socket.off('info');
      socket.off('error');
    };
  }, [processStarted]);

  const sendCoordinatesToRobot = async () => {
    try {
      const response = await axios.post('http://localhost:5000/send-coordinates', { coordinates });
      console.log('Server response:', response.data);
      setMessages((prevMessages) => [...prevMessages, { type: 'success', content: 'Coordinates sent successfully!' }]);
      
      const processResponse = await axios.post('http://localhost:5000/start-process');
      console.log('Process response:', processResponse.data);
      setProcessStarted(true);
    } catch (error) {
      console.error('Failed to send coordinates or start process:', error);
      setMessages((prevMessages) => [...prevMessages, { type: 'error', content: 'Failed to send coordinates or start process.' }]);
    }
  };

  const handleUserInput = () => {
    socket.emit('done');
    setWaitingForInput(false);
  };

  return (
    <Flex h="100vh" w="90%" bg="gray.100" p={4}>
      <VStack w="60%" spacing={4} align="stretch">
        <Box bg="white" rounded="lg" shadow="md" p={5}>
          <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={2}>Pallet Coordinates</Text>
          <Button onClick={onOpen} colorScheme="blue" mb={2}>
            View Coordinates
          </Button>
        </Box>
        <Box bg="white" rounded="lg" shadow="md" p={6} flex="1" overflow="hidden"> 
          <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>Visual Representation</Text>
          
          <Visual palletDimensions={palletDimensions} coordinates={coordinates} />
        </Box>
        <HStack spacing={4}>
          <Button
            onClick={prevStep}
            colorScheme="red"
          >
            Previous Step
          </Button>
          {!processStarted && (
            <Button
              onClick={sendCoordinatesToRobot}
              colorScheme="blue"
            >
              Send to Robot and Start Process
            </Button>
          )}
          {waitingForInput && (
            <Button
              onClick={handleUserInput}
              colorScheme="green"
            >
              Confirm Step
            </Button>
          )}
        </HStack>
      </VStack>
      <Box w="40%" paddingLeft={4}>
        <Box bg="white" rounded="lg" shadow="md" p={6} h="full" overflowY="auto">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>Messages</Text>
          <VStack spacing={4}>
            {messages.map((message, index) => (
              <Box 
                key={index} 
                p={3} 
                rounded="lg" 
                w="full"
                bg={
                  message.type === 'error' ? 'red.100' :
                  message.type === 'success' ? 'green.100' :
                  message.type === 'prompt' ? 'yellow.100' :
                  'blue.100'
                }
                color={
                  message.type === 'error' ? 'red.800' :
                  message.type === 'success' ? 'green.800' :
                  message.type === 'prompt' ? 'yellow.800' :
                  'blue.800'
                }
              >
                {message.content}
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.100">
          <ModalHeader>Coordinates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {coordinates.map((coord) => (
                <Box key={coord.id} bg="gray.50" p={4} rounded="md" w="full">
                  <Text fontWeight="semibold">Box {coord.id} - Layer: {coord.layer}</Text>
                  <Text>Position: ({coord.x}, {coord.y}, {coord.z})</Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Results2;
