import React, { useState, useEffect} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BoxGrid from './BoxGrid';
import SavedConfigurations from './SavedConfigurations';
import "./draganddrop.css"
import { ChevronLeftIcon } from '@chakra-ui/icons';
import html2canvas from 'html2canvas';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';

function App({onSubmit}) {
  const [boxes, setBoxes] = useState([]);
  const [gridWidth, setGridWidth] = useState("5");
  const [gridHeight, setGridHeight] = useState("5");
  const [boxWidth, setBoxWidth] = useState("1");
  const [boxLength, setBoxLength] = useState("1");
  const [boxHeight, setBoxHeight] = useState("1");
  const [numLayers, setNumLayers] = useState(1);
  const [scaleFactorWidth, setScaleFactorWidth] = useState(100);
  const [scaleFactorLength, setScaleFactorLength] = useState(100);
  const [displayWidth, setDisplayWidth] = useState(500);
  const [displayHeight, setDisplayHeight] = useState(500);
  const [nextId, setNextId] = useState(0);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const { 
    isOpen: isModalOpen, 
    onOpen: onModalOpen, 
    onClose: onModalClose 
  } = useDisclosure();
  const { 
    isOpen: isDrawerOpen, 
    onOpen: onDrawerOpen, 
    onClose: onDrawerClose 
  } = useDisclosure();
  const [configName, setConfigName] = useState('');
  const toast = useToast();
  useEffect(() => {
    const loadedConfigurations = localStorage.getItem('palletConfigurations');
    if (loadedConfigurations) {
      setSavedConfigurations(JSON.parse(loadedConfigurations));
    }
  }, []);


  const saveConfiguration = () => {
    const newConfig = {
      name: configName,
      boxes: boxes,
      gridWidth,
      gridHeight,
      boxWidth,
      boxLength,
      boxHeight,
      numLayers,
      scaleFactorWidth: scaleFactorWidth,
      scaleFactorLength: scaleFactorLength,
      displayHeight: displayHeight,
      displayWidth: displayWidth,
      nextId: nextId,
    };
    const updatedConfigurations = [...savedConfigurations, newConfig];
    setSavedConfigurations(updatedConfigurations);
    localStorage.setItem('palletConfigurations', JSON.stringify(updatedConfigurations));
    onModalClose();
    setConfigName('');
    toast({
      title: "Configuration saved",
      description: `${configName} has been saved successfully.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const applyConfiguration = (config) => {
    setBoxes(config.boxes);
    setGridWidth(config.gridWidth);
    setGridHeight(config.gridHeight);
    setBoxWidth(config.boxWidth);
    setBoxLength(config.boxLength);
    setBoxHeight(config.boxHeight);
    setNumLayers(config.numLayers);
    setScaleFactorLength(config.scaleFactorLength);
    setScaleFactorWidth(config.scaleFactorWidth);
    setDisplayWidth(config.displayWidth);
    setDisplayHeight(config.displayHeight);
    setNextId(config.nextId);
    toast({
      title: "Configuration applied",
      description: `${config.name} has been applied successfully.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    console.log(config);
    console.log(nextId);
  };

  const deleteConfiguration = (configToDelete) => {
    const updatedConfigurations = savedConfigurations.filter(
      config => config.name !== configToDelete.name
    );
    setSavedConfigurations(updatedConfigurations);
    localStorage.setItem('palletConfigurations', JSON.stringify(updatedConfigurations));
    toast({
      title: "Configuration deleted",
      description: `${configToDelete.name} has been deleted.`,
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const widthNum = Number(gridWidth);
    const heightNum = Number(gridHeight);
    let newDisplayWidth, newDisplayHeight;

    if (widthNum >= heightNum) {
      newDisplayWidth = 500;
      newDisplayHeight = Math.round((heightNum / widthNum) * 500);
    } else {
      newDisplayHeight = 500;
      newDisplayWidth = Math.round((widthNum / heightNum) * 500);
    }

    setDisplayWidth(newDisplayWidth);
    setDisplayHeight(newDisplayHeight);

    const widthScale = newDisplayWidth / (widthNum * 100);
    const heightScale = newDisplayHeight / (heightNum * 100);
    setScaleFactorWidth(widthScale * 100);
    setScaleFactorLength(heightScale * 100);
  }, [gridWidth, gridHeight]);


  useEffect(() => {
    // Update all boxes with the new dimensions
    const updatedBoxes = boxes.map(box => {
      if (box.rotate) {
        return {
          ...box,
          width: Number(boxLength),  // Swap width and length
          height: Number(boxHeight),
          length: Number(boxWidth),  // Swap length and width
        };
      } else {
        return {
          ...box,
          width: Number(boxWidth),
          height: Number(boxHeight),
          length: Number(boxLength),
        };
      }
    });
    setBoxes(updatedBoxes);
  }, [boxWidth, boxHeight, boxLength]); 

  const addBox = () => {
    const newBox = {
      id: nextId,
      x: 10,
      y: 10,
      width: Number(boxWidth),
      length: Number(boxLength),  // Changed to boxLength
      height: Number(boxHeight),
      layer: 1,  // Default to layer 1
      rotate: false
    };
    setBoxes([...boxes, newBox]); 
    setNextId(nextId + 1);
  };

  
  const boxesOverlap = (box1, box2) => {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.length &&
      box1.y + box1.length > box2.y
    );
  };
  const moveBox = (id, x, y) => {
    const movingBox = boxes.find(box => box.id === id);
    const scaledWidth = movingBox.width * scaleFactorWidth;
    const scaledLength = movingBox.length * scaleFactorLength;
    let newX = Math.max(0, Math.min(Number(gridWidth) * scaleFactorWidth - scaledWidth, x));
    let newY = Math.max(0, Math.min(Number(gridHeight) * scaleFactorLength - scaledLength, y));
  
    const alignmentThreshold = 15; // pixels within which boxes will snap to each other
    let snapX = newX;
    let snapY = newY;
  
    // Iterate through all boxes to find the closest edge within the threshold and check for overlap
    boxes.forEach(otherBox => {
      if (otherBox.id !== id) {
        const otherX = otherBox.x;
        const otherY = otherBox.y;
        const otherWidth = otherBox.width * scaleFactorWidth;
        const otherLength  = otherBox.length * scaleFactorLength;
  
        // Magnetic alignment calculations
        if (Math.abs(newX + scaledWidth - otherX) < alignmentThreshold) {
          snapX = otherX - scaledWidth;
        } else if (Math.abs(newX - (otherX + otherWidth)) < alignmentThreshold) {
          snapX = otherX + otherWidth;
        }
  
        if (Math.abs(newY + scaledLength - otherY) < alignmentThreshold) {
          snapY = otherY - scaledLength;
        } else if (Math.abs(newY - (otherY + otherLength)) < alignmentThreshold) {
          snapY = otherY + otherLength;
        }
      }
    });
  
    // Use the snapped coordinates if they do not cause an overlap
    const testPosition = { ...movingBox, x: snapX, y: snapY, width: scaledWidth, length: scaledLength };
    const overlapExists = boxes.some(otherBox =>
      otherBox.id !== id && boxesOverlap(testPosition, {
        ...otherBox,
        x: otherBox.x,
        y: otherBox.y,
        width: otherBox.width * scaleFactorWidth,
        length: otherBox.length * scaleFactorLength
      })
    );
  
    // Update the box position only if there is no overlap
    if (!overlapExists) {
      setBoxes(boxes.map(box => {
        if (box.id === id) {
          return { ...box, x: snapX, y: snapY };
        }
        return box;
      }));
    } else {
      console.error("Overlap detected, move not allowed. Trying to move Box", id, "to", newX, newY);
    }
  };
  
  
  
  

  const rotateBox = (id) => {
    setBoxes(boxes.map(box => {
      if (box.id === id) {
        return { ...box, width: box.length, length: box.width,rotate:!box.rotate };
      }
      return box;
    }));
    console.log(boxes);
  };

  const removeBox = id => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  

  const submitBoxes = () => {
    const coordinates = boxes.map(box => {
      const results = [];
      for (let layer = 1; layer <= numLayers; layer++) {
        const z = box.height * (layer - 0.5);  // Calculate center Z for each layer
        const xCenter = ((box.x + (box.width * scaleFactorWidth / 2)) / scaleFactorWidth).toFixed(3);
        const yCenter = ((box.y + (box.length * scaleFactorLength / 2)) / scaleFactorLength).toFixed(3);
        results.push({
          id: box.id,
          layer: layer,
          x: parseFloat(xCenter),
          y: parseFloat(yCenter),
          z: parseFloat(z),
          width: box.width,
          height: box.height,
          length: box.length,
          totalLayers: numLayers,
        });
      }
      return results;
    }).flat(); // Flatten the array if multiple layers produce multiple entries per box
    
    // Call the onSubmit function passed via props with the necessary data
    onSubmit({
      coordinates: coordinates,
      gridWidth: parseFloat(gridWidth),
      gridHeight: parseFloat(gridHeight)
    });
    console.log(boxes)
  };
  
  


  const handleDimensionChange = (setter) => (e) => {
    const value = e.target.value.replace(/^0+/, '') || ''; // Allows empty string
    setter(value);
  };
  const formBg = useColorModeValue('white', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.50');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');

  return (
    <DndProvider backend={HTML5Backend}>
      <Box position="relative" display="flex" justifyContent="center" w="100%" h="80%">
        <Flex direction="row" w="80%" h="80%">
          <Box
            bg={useColorModeValue('white', 'gray.200')}
            rounded="lg"
            shadow="lg"
            p={8}
            w="100%"
            display="flex"
            flexDirection={{ base: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            h="100%"
          >
          <Stack spacing={4} w={{ base: '100%', lg: '40%' }} mb={{ base: 'auto', lg: 'auto' }}>
            <Heading as="h2" size="lg" color="blue.600">
              Manual Pallet Configuration
            </Heading>
            <Text color="gray.600">
              Enter the width, length, height, and weight of each unit below.
            </Text>
            <FormControl>
              <FormLabel fontWeight="bold" color="gray.800">
                Box Dimensions (in meters)
              </FormLabel>
              <Flex gap={4}>
                <Box>
                  <FormLabel>Width</FormLabel>
                  <Input
                    type="number"
                    value={boxWidth}
                    onChange={(e) => setBoxWidth(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                  />
                </Box>
                <Box>
                  <FormLabel>Length</FormLabel>
                  <Input
                    type="number"
                    value={boxLength}
                    onChange={(e) => setBoxLength(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                  />
                </Box>
                <Box>
                  <FormLabel>Height</FormLabel>
                  <Input
                    type="number"
                    value={boxHeight}
                    onChange={(e) => setBoxHeight(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                  />
                </Box>
              </Flex>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="bold" color="gray.800">
                Grid Dimensions (in meters)
              </FormLabel>
              <Flex gap={4}>
                <Box>
                  <FormLabel>Width</FormLabel>
                  <Input
                    type="number"
                    value={gridWidth}
                    onChange={(e) => setGridWidth(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                  />
                </Box>
                <Box>
                  <FormLabel>Height</FormLabel>
                  <Input
                    type="number"
                    value={gridHeight}
                    onChange={(e) => setGridHeight(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                  />
                </Box>
              </Flex>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="bold" color="gray.800">
                Number of Layers
              </FormLabel>
              <Input
                type="number"
                value={numLayers}
                onChange={(e) => setNumLayers(e.target.value)}
                width="100px"
                bg={inputBg}
                borderColor={inputBorder}
              />
            </FormControl>
            <Flex justify="space-between"  mt={4}>
            <Button colorScheme="blue" onClick={addBox}>
              Add Box
            </Button>
            <Button colorScheme="green" onClick={onModalOpen}>
              Save Configuration
            </Button>
            <Button colorScheme="green" onClick={submitBoxes}>
              Submit Boxes
            </Button>

            {/* <Button colorScheme="teal" onClick={onDrawerOpen}>
              Saved Configurations
            </Button> */}
          </Flex>
          </Stack>
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={{ base: '100%', lg: '50%' }}
            ml={{ lg: 4 }}
          >
            <BoxGrid
              boxes={boxes}
              gridWidth={displayWidth}
              gridHeight={displayHeight}
              moveBox={moveBox}
              rotateBox={rotateBox}
              removeBox={removeBox}
              scaleFactorWidth={scaleFactorWidth} // Adjusted for display
              scaleFactorLength={scaleFactorLength} // Adjusted for display
            />
          </Box>
        </Box>
        {/* <Box w="30%" ml={4}>
         <SavedConfigurations
          configurations={savedConfigurations}
          applyConfiguration={applyConfiguration}
          deleteConfiguration={deleteConfiguration}
        />
        </Box> */}
      </Flex>
      <Button
          position="fixed"
          right="0"
          top="50%"
          transform="translateY(-50%)"
          colorScheme="teal"
          onClick={onDrawerOpen}
          zIndex="1000"
          h="100px"
          w="40px"
          borderRightRadius="0"
          borderLeftRadius="md"
        > 
          <ChevronLeftIcon boxSize={6} />
        </Button>
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="white">Save Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl >
              <FormLabel color="white" mb="2">Configuration Name</FormLabel>
              <Input 
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Enter a name for this configuration"
                color="white"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveConfiguration}>
              Save
            </Button>
            <Button variant="ghost" onClick={onModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay>
          <DrawerContent bg="gray.700">
            <DrawerCloseButton />
            <DrawerHeader color="white">Saved Configurations</DrawerHeader>
            <DrawerBody>
              <SavedConfigurations
                configurations={savedConfigurations}
                applyConfiguration={(config) => {
                  applyConfiguration(config);
                  onDrawerClose();
                }}
                deleteConfiguration={deleteConfiguration}
              />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
      </Box>
    </DndProvider>
  );
};
  

export default App;
