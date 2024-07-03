import React, { useState, useEffect, useRef } from 'react';
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
  Switch,
} from '@chakra-ui/react';

function App({onSubmit}) {
  const [oddBoxes, setOddBoxes] = useState([]);
  const [evenBoxes, setEvenBoxes] = useState([]);
  const [currentLayer, setCurrentLayer] = useState('odd');
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
  const gridRef = useRef(null);
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

  const saveConfiguration = async() => {
    if (gridRef.current) {
      const canvas = await html2canvas(gridRef.current);
      const previewImage = canvas.toDataURL();  
      const newConfig = {
        name: configName,
        oddBoxes,
        evenBoxes,
        gridWidth,
        gridHeight,
        boxWidth,
        boxLength,
        boxHeight,
        numLayers,
        scaleFactorWidth,
        scaleFactorLength,
        displayHeight,
        displayWidth,
        nextId,
        previewImage
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
    }
  };

  const applyConfiguration = (config) => {
    setOddBoxes(config.oddBoxes);
    setEvenBoxes(config.evenBoxes);
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
    const updateBoxes = (boxes) => boxes.map(box => {
      if (box.rotate === 1 || box.rotate === 3) {
        return {
          ...box,
          width: Number(boxLength),
          height: Number(boxHeight),
          length: Number(boxWidth),
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

    setOddBoxes(updateBoxes(oddBoxes));
    setEvenBoxes(updateBoxes(evenBoxes));
  }, [boxWidth, boxHeight, boxLength]);

  const addBox = () => {
    const newBox = {
      id: nextId,
      x: 10,
      y: 10,
      width: Number(boxWidth),
      length: Number(boxLength),
      height: Number(boxHeight),
      rotate: 0
    };
    if (currentLayer === 'odd') {
      setOddBoxes([...oddBoxes, newBox]);
    } else {
      setEvenBoxes([...evenBoxes, newBox]);
    }
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
    const boxes = currentLayer === 'odd' ? oddBoxes : evenBoxes;
    const setBoxes = currentLayer === 'odd' ? setOddBoxes : setEvenBoxes;

    const movingBox = boxes.find(box => box.id === id);
    const scaledWidth = movingBox.width * scaleFactorWidth;
    const scaledLength = movingBox.length * scaleFactorLength;
    let newX = Math.max(0, Math.min(Number(gridWidth) * scaleFactorWidth - scaledWidth, x));
    let newY = Math.max(0, Math.min(Number(gridHeight) * scaleFactorLength - scaledLength, y));
  
    const alignmentThreshold = 15;
    let snapX = newX;
    let snapY = newY;
  
    boxes.forEach(otherBox => {
      if (otherBox.id !== id) {
        const otherX = otherBox.x;
        const otherY = otherBox.y;
        const otherWidth = otherBox.width * scaleFactorWidth;
        const otherLength  = otherBox.length * scaleFactorLength;
  
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
    const setBoxes = currentLayer === 'odd' ? setOddBoxes : setEvenBoxes;
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === id) {
        const newRotationState = (box.rotate + 1) % 4;
        return { ...box, width: box.length, length: box.width, rotate: newRotationState };
      }
      return box;
    }));
  };

  const removeBox = id => {
    const setBoxes = currentLayer === 'odd' ? setOddBoxes : setEvenBoxes;
    setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== id));
  };

  const submitBoxes = () => {
    const coordinates = [];
    for (let layer = 1; layer <= numLayers; layer++) {
      const boxes = layer % 2 === 1 ? oddBoxes : evenBoxes;
      boxes.forEach(box => {
        const z = box.height * (layer - 0.5);
        const xCenter = ((box.x + (box.width * scaleFactorWidth / 2)) / scaleFactorWidth).toFixed(3);
        const yCenter = ((box.y + (box.length * scaleFactorLength / 2)) / scaleFactorLength).toFixed(3);
        coordinates.push({
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
      });
    }
    
    onSubmit({
      coordinates: coordinates,
      gridWidth: parseFloat(gridWidth),
      gridHeight: parseFloat(gridHeight)
    });
  };

  const handleLayerChange = () => {
    setCurrentLayer(prev => prev === 'odd' ? 'even' : 'odd');
  };

  const copyOddToEven = () => {
    setEvenBoxes([...oddBoxes.map(box => ({...box, id: nextId + box.id}))]);
    setNextId(nextId + oddBoxes.length);
    toast({
      title: "Configuration copied",
      description: "Odd layer configuration has been copied to even layers.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const formBg = useColorModeValue('white', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.50');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');

  return (
    <DndProvider backend={HTML5Backend}>
      <Box position="relative" display="flex" justifyContent="center" w="100%" minH="75vh">
        <Flex direction="column" w="100%" maxW="1200px" px={4}>
          <Box
            bg={useColorModeValue('gray.200', 'gray.200')}
            rounded="lg"
            shadow="lg"
            p={8}
            w="100%"
            display="flex"
            flexDirection={{ base: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems="stretch"
            minH="70vh"
          >
            <Stack spacing={3} w={{ base: '100%', lg: '40%' }} mb={{ base: 8, lg: 0 }}>
              <Heading as="h2" size="lg" color="blue.600">
                Manual Pallet Configuration
              </Heading>
              <Text color="gray.600">
                Enter the width, length, height, and weight of each unit below.
              </Text>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="layer-switch" mb="0">
                  Current Layer: {currentLayer.charAt(0).toUpperCase() + currentLayer.slice(1)}
                </FormLabel>
                <Switch id="layer-switch" onChange={handleLayerChange} />
                {currentLayer === 'even' && (
                <Button size="xs" ml={3} colorScheme="purple" onClick={copyOddToEven}>
                  Copy Odd Config
                </Button>
              )}
              </FormControl>

              <FormControl>

                <FormLabel fontWeight="bold" color="gray.800">
                  Box Dimensions (in meters)
                </FormLabel>
                <Flex gap={2} flexWrap="wrap">
                  <Box flex="1" minW="80px">
                    <FormLabel>Width</FormLabel>
                    <Input
                      type="number"
                      value={boxWidth}
                      onChange={(e) => setBoxWidth(e.target.value)}
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box flex="1" minW="80px">
                    <FormLabel>Length</FormLabel>
                    <Input
                      type="number"
                      value={boxLength}
                      onChange={(e) => setBoxLength(e.target.value)}
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box flex="1" minW="80px">
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
                <Flex gap={2} flexWrap="wrap">
                  <Box flex="1" minW="80px">
                    <FormLabel>Width</FormLabel>
                    <Input
                      type="number"
                      value={gridWidth}
                      onChange={(e) => setGridWidth(e.target.value)}
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box flex="1" minW="80px">
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
                  width="100%"
                  maxW="200px"
                  bg={inputBg}
                  borderColor={inputBorder}
                />
              </FormControl>
              <Flex justify="space-between" mt={4} flexWrap="wrap" gap={2}>
                <Button colorScheme="blue" onClick={addBox} flex="1" minW="130px">
                  Add Box
                </Button>
                <Button colorScheme="teal" onClick={onModalOpen} flex="1" minW="170px">
                  Save Configuration
                </Button>
                <Button colorScheme="green" onClick={submitBoxes} flex="1" minW="130px">
                  Submit Boxes
                </Button>
              </Flex>
            </Stack>
            <Box
              flex="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: '100%', lg: '60%' }}
              mt={{ base: 8, lg: 0 }}
              ml={{ lg: 4 }}
            >
              <Box ref={gridRef}>
                <BoxGrid
                  boxes={currentLayer === 'odd' ? oddBoxes : evenBoxes}
                  gridWidth={displayWidth}
                  gridHeight={displayHeight}
                  moveBox={moveBox}
                  rotateBox={rotateBox}
                  removeBox={removeBox}
                  scaleFactorWidth={scaleFactorWidth}
                  scaleFactorLength={scaleFactorLength}
                />
              </Box>
            </Box>
          </Box>
        </Flex>
        <Button
          position="fixed"
          right="0"
          top="50%"
          transform="translateY(-50%)"
          colorScheme="teal"
          onClick={onDrawerOpen}
          zIndex="1000"
          h={{ base: "60px", md: "100px" }}
          w={{ base: "30px", md: "40px" }}
          borderRightRadius="0"
          borderLeftRadius="md"
          p={1}
        >
          <ChevronLeftIcon boxSize={{ base: 4, md: 6 }} />
        </Button>
        <Modal isOpen={isModalOpen} onClose={onModalClose}>
          <ModalOverlay />
          <ModalContent bg='gray.700'>
            <ModalHeader color="white">Save Configuration</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
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
              <Button variant="ghost" bg='red' onClick={onModalClose}>Cancel</Button>
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
}

export default App;
