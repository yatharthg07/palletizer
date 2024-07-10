import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, off, remove,onChildAdded } from 'firebase/database';
import { Box, Button, VStack, HStack, Text, Flex, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import Visual from './Visual';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK49S7R9f8md-9bvtMRJ3IZMmR-1dpVmk",
  authDomain: "palletizer-322e0.firebaseapp.com",
  databaseURL: "https://palletizer-322e0-default-rtdb.firebaseio.com",
  projectId: "palletizer-322e0",
  storageBucket: "palletizer-322e0.appspot.com",
  messagingSenderId: "317851958274",
  appId: "1:317851958274:web:5c3bd761fc70053efc3b1b",
  measurementId: "G-C918XCXRW1"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Results2 = ({ coordinates, palletDimensions, prevStep }) => {
  const [messages, setMessages] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [processStarted, setProcessStarted] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const clearDatabase = async () => {
      await remove(ref(database, 'palletizer'));
    };

    clearDatabase();

    const messagesRef = ref(database, 'palletizer/messages');

    // Listen for the initial data and subsequent updates
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMessages(messageList);
        
        const lastMessage = messageList[messageList.length - 1];
        if (lastMessage.type === 'prompt') {
          setWaitingForInput(true);
        } else if (lastMessage.type === 'error') {
          toast({
            title: "Error",
            description: lastMessage.content,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        setMessages([]);
      }
    });

    // Listen for new messages being added
    const childAddedUnsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const newMessage = {
        id: snapshot.key,
        ...snapshot.val()
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      if (newMessage.type === 'prompt') {
        setWaitingForInput(true);
      } else if (newMessage.type === 'error') {
        toast({
          title: "Error",
          description: newMessage.content,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    });

    return () => {
      unsubscribe();
      childAddedUnsubscribe();
    };
  }, [toast]);

  const sendCoordinatesToRobot = async () => {
    try {
      await set(ref(database, 'palletizer/coordinates'), coordinates);
      
      await set(ref(database, 'palletizer/processStart'), true);
      setProcessStarted(true);

    } catch (error) {
      console.error('Failed to send coordinates or start process:', error);
      toast({
        title: "Error",
        description: 'Failed to send coordinates or start process.',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUserInput = () => {
    set(ref(database, 'palletizer/userInput'), 'done');
    setWaitingForInput(false);
  };

  return (
    <Flex h="80%" w="90%" bg="gray.200" p={5} rounded="lg" shadow="lg">
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
          <Button onClick={prevStep} colorScheme="red">
            Previous Step
          </Button>
          {!processStarted && (
            <Button onClick={sendCoordinatesToRobot} colorScheme="blue">
              Send to Robot and Start Process
            </Button>
          )}
          {waitingForInput && (
            <Button onClick={handleUserInput} colorScheme="green">
              Confirm Step
            </Button>
          )}
        </HStack>
      </VStack>
      <Box w="40%" paddingLeft={4}>
        <Box bg="white" rounded="lg" shadow="md" p={6} h="full" overflowY="auto">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>Messages</Text>
          <VStack spacing={4}>
            {messages.map((message) => (
              <Box 
                key={message.id} 
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