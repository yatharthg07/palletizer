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
  Switch,
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

function ManualPalletConfigurator({ onSubmit }) {
  const [useTwoPallets, setUseTwoPallets] = useState(false);
  const [currentPallet, setCurrentPallet] = useState('left');
  const [currentLayerType, setCurrentLayerType] = useState('odd');
  const [pallets, setPallets] = useState({
    left: {
      oddBoxes: [],
      evenBoxes: [],
      gridWidth: "5",
      gridHeight: "5",
      boxWidth: "1",
      boxLength: "1",
      boxHeight: "1",
      numLayers: 1,
      nextId: 0,
    },
    right: {
      oddBoxes: [],
      evenBoxes: [],
      gridWidth: "5",
      gridHeight: "5",
      boxWidth: "1",
      boxLength: "1",
      boxHeight: "1",
      numLayers: 1,
      nextId: 0,
    }
  });
  const [scaleFactorWidth, setScaleFactorWidth] = useState(100);
  const [scaleFactorLength, setScaleFactorLength] = useState(100);
  const [displayWidth, setDisplayWidth] = useState(500);
  const [displayHeight, setDisplayHeight] = useState(500);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const gridRef = useRef(null);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [configName, setConfigName] = useState('');
  const toast = useToast();

  const currentConfig = pallets[currentPallet];

  useEffect(() => {
    const loadedConfigurations = localStorage.getItem('palletConfigurations');
    if (loadedConfigurations) {
      setSavedConfigurations(JSON.parse(loadedConfigurations));
    }
  }, []);

  const saveConfiguration = async () => {
    if (gridRef.current) {
      const canvas = await html2canvas(gridRef.current);
      const previewImage = canvas.toDataURL();
      const newConfig = {
        name: configName,
        pallets,
        scaleFactorWidth,
        scaleFactorLength,
        displayHeight,
        displayWidth,
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
    setPallets(config.pallets);
    setScaleFactorLength(config.scaleFactorLength);
    setScaleFactorWidth(config.scaleFactorWidth);
    setDisplayWidth(config.displayWidth);
    setDisplayHeight(config.displayHeight);
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
    const widthNum = Number(currentConfig.gridWidth);
    const heightNum = Number(currentConfig.gridHeight);
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
  }, [currentConfig.gridWidth, currentConfig.gridHeight]);

  useEffect(() => {
    const updateBoxes = (boxes) => boxes.map(box => {
      if (box.rotate === 1 || box.rotate === 3) {
        return {
          ...box,
          width: Number(currentConfig.boxLength),
          height: Number(currentConfig.boxHeight),
          length: Number(currentConfig.boxWidth),
        };
      } else {
        return {
          ...box,
          width: Number(currentConfig.boxWidth),
          height: Number(currentConfig.boxHeight),
          length: Number(currentConfig.boxLength),
        };
      }
    });

    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        oddBoxes: updateBoxes(currentConfig.oddBoxes),
        evenBoxes: updateBoxes(currentConfig.evenBoxes)
      }
    }));
  }, [currentConfig.boxWidth, currentConfig.boxHeight, currentConfig.boxLength]);

  const addBox = () => {
    const newBox = {
      id: currentConfig.nextId,
      x: 10,
      y: 10,
      width: Number(currentConfig.boxWidth),
      length: Number(currentConfig.boxLength),
      height: Number(currentConfig.boxHeight),
      rotate: 0
    };
    const updatedBoxes = currentLayerType === 'odd'
      ? [...currentConfig.oddBoxes, newBox]
      : [...currentConfig.evenBoxes, newBox];
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [`${currentLayerType}Boxes`]: updatedBoxes,
        nextId: currentConfig.nextId + 1
      }
    }));
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
    const boxes = currentLayerType === 'odd' ? currentConfig.oddBoxes : currentConfig.evenBoxes;
    const movingBox = boxes.find(box => box.id === id);
    const scaledWidth = movingBox.width * scaleFactorWidth;
    const scaledLength = movingBox.length * scaleFactorLength;
    let newX = Math.max(0, Math.min(Number(currentConfig.gridWidth) * scaleFactorWidth - scaledWidth, x));
    let newY = Math.max(0, Math.min(Number(currentConfig.gridHeight) * scaleFactorLength - scaledLength, y));

    const alignmentThreshold = 15;
    let snapX = newX;
    let snapY = newY;

    boxes.forEach(otherBox => {
      if (otherBox.id !== id) {
        const otherX = otherBox.x;
        const otherY = otherBox.y;
        const otherWidth = otherBox.width * scaleFactorWidth;
        const otherLength = otherBox.length * scaleFactorLength;

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
      const updatedBoxes = boxes.map(box => {
        if (box.id === id) {
          return { ...box, x: snapX, y: snapY };
        }
        return box;
      });
      setPallets(prev => ({
        ...prev,
        [currentPallet]: {
          ...currentConfig,
          [`${currentLayerType}Boxes`]: updatedBoxes
        }
      }));
    } else {
      console.error("Overlap detected, move not allowed. Trying to move Box", id, "to", newX, newY);
    }
  };

  const rotateBox = (id) => {
    const boxes = currentLayerType === 'odd' ? currentConfig.oddBoxes : currentConfig.evenBoxes;
    const updatedBoxes = boxes.map(box => {
      if (box.id === id) {
        const newRotationState = (box.rotate + 1) % 4;
        return { ...box, width: box.length, length: box.width, rotate: newRotationState };
      }
      return box;
    });
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [`${currentLayerType}Boxes`]: updatedBoxes
      }
    }));
  };

  const removeBox = id => {
    const boxes = currentLayerType === 'odd' ? currentConfig.oddBoxes : currentConfig.evenBoxes;
    const updatedBoxes = boxes.filter(box => box.id !== id);
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [`${currentLayerType}Boxes`]: updatedBoxes
      }
    }));
  };

  const submitBoxes = () => {
    const allCoordinates = [];
    const allPalletDimensions = [];
    Object.keys(pallets).forEach(palletKey => {
      const config = pallets[palletKey];
      const coordinates = [];
      for (let layer = 1; layer <= config.numLayers; layer++) {
        const boxes = layer % 2 === 1 ? config.oddBoxes : config.evenBoxes;
        boxes.forEach(box => {
          const z = box.height * (layer - 0.5);
          const xCenter = ((box.x + (box.width * scaleFactorWidth / 2)) / scaleFactorWidth).toFixed(3);
          const yCenter = ((box.y + (box.length * scaleFactorLength / 2)) / scaleFactorLength).toFixed(3);
          coordinates.push({
            id: box.id,
            layer: layer,
            layerType: layer % 2 === 1 ? 'odd' : 'even',
            x: parseFloat(xCenter),
            y: parseFloat(yCenter),
            z: parseFloat(z),
            width: box.width,
            height: box.height,
            length: box.length,
            totalLayers: config.numLayers,
            pallet: palletKey
          });
        });
      }
      allCoordinates.push(...coordinates);
      allPalletDimensions.push({
        pallet: palletKey,
        width: parseFloat(config.gridWidth),
        height: parseFloat(config.gridHeight)
      });
    });

    onSubmit({
      coordinates: allCoordinates,
      palletDimensions: allPalletDimensions
    });
  };

  const handleDimensionChange = (setter) => (e) => {
    const value = e.target.value.replace(/^0+/, '') || '';
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [setter]: value
      }
    }));
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
            p={7}
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
                <FormLabel htmlFor="two-pallets-switch" mb="0">
                  Use Two Pallets
                </FormLabel>
                <Switch id="two-pallets-switch" onChange={() => setUseTwoPallets(!useTwoPallets)} />
              </FormControl>
              {useTwoPallets && (
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="pallet-switch" mb="0">
                    Current Pallet: {currentPallet.charAt(0).toUpperCase() + currentPallet.slice(1)}
                  </FormLabel>
                  <Switch id="pallet-switch" onChange={() => setCurrentPallet(currentPallet === 'left' ? 'right' : 'left')} />
                </FormControl>
              )}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="layer-switch" mb="0">
                  Current Layer: {currentLayerType.charAt(0).toUpperCase() + currentLayerType.slice(1)}
                </FormLabel>
                <Switch id="layer-switch" onChange={() => setCurrentLayerType(currentLayerType === 'odd' ? 'even' : 'odd')} />
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
                      value={currentConfig.boxWidth}
                      onChange={handleDimensionChange('boxWidth')}
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box flex="1" minW="80px">
                    <FormLabel>Length</FormLabel>
                    <Input
                      type="number"
                      value={currentConfig.boxLength}
                      onChange={handleDimensionChange('boxLength')}
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box flex="1" minW="80px">
                    <FormLabel>Height</FormLabel>
                    <Input
                      type="number"
                      value={currentConfig.boxHeight}
                      onChange={handleDimensionChange('boxHeight')}
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
                      value={currentConfig.gridWidth}
                      onChange={handleDimensionChange('gridWidth')}
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box flex="1" minW="80px">
                    <FormLabel>Height</FormLabel>
                    <Input
                      type="number"
                      value={currentConfig.gridHeight}
                      onChange={handleDimensionChange('gridHeight')}
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
                  value={currentConfig.numLayers}
                  onChange={handleDimensionChange('numLayers')}
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
                  boxes={currentLayerType === 'odd' ? currentConfig.oddBoxes : currentConfig.evenBoxes}
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

export default ManualPalletConfigurator;
