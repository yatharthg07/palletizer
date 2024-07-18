import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BoxGrid from './BoxGrid';
import SavedConfigurations from './SavedConfigurations';
import "./draganddrop.css"
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon,ChevronRightIcon } from '@chakra-ui/icons';
import html2canvas from 'html2canvas';
import {
  Box, Flex, VStack, HStack, Text, Button, IconButton, Input, 
  Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  useColorModeValue, useDisclosure, Drawer, DrawerContent, DrawerOverlay,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  useToast, Tooltip
} from '@chakra-ui/react';
import { 
  Sun, Moon, Package, Grid, Layers, Save, Play, Menu, X, RotateCcw, Plus, Minus
} from 'lucide-react';

import { useColorMode } from '@chakra-ui/react';
const MotionBox = motion(Box);

const DimensionInput = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Flex direction="column" w="full">
      <Text fontSize="sm" fontWeight="medium" mb={1}>{label}</Text>
      <Flex alignItems="center">
        <IconButton
          size="sm"
          icon={<Minus size={16} />}
          onClick={() => onChange(Math.max(min, value - step))}
          mr={2}
        />
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          textAlign="center"
          bg={bgColor}
          borderColor={borderColor}
        />
        <IconButton
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => onChange(Math.min(max, Number(value) + Number(step)))}
          ml={2}
        />
      </Flex>
    </Flex>
  );
};
function ManualPalletConfigurator({ onSubmit }) {
  const [useTwoPallets, setUseTwoPallets] = useState(false);
  const [currentPallet, setCurrentPallet] = useState('left');
  const [currentLayer, setCurrentLayer] = useState('odd');
  const [pallets, setPallets] = useState({
    left: {
      odd: { boxes: [], nextId: 0 },
      even: { boxes: [], nextId: 0 },
      gridWidth: "5",
      gridHeight: "5",
      boxWidth: "1",
      boxLength: "1",
      boxHeight: "1",
      numLayers: 1
    },
    right: {
      odd: { boxes: [], nextId: 0 },
      even: { boxes: [], nextId: 0 },
      gridWidth: "5",
      gridHeight: "5",
      boxWidth: "1",
      boxLength: "1",
      boxHeight: "1",
      numLayers: 1
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
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { colorMode, toggleColorMode } = useColorMode();

  const toggleUseTwoPallets = () => {
    setUseTwoPallets(!useTwoPallets);
  };
  
  const switchPallet = () => {
    setCurrentPallet(currentPallet === 'left' ? 'right' : 'left');
  };  

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
        useTwoPallets,
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
    setUseTwoPallets(config.useTwoPallets);
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
    const updatedBoxes = currentConfig[currentLayer].boxes.map(box => {
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
        [currentLayer]: { ...currentConfig[currentLayer], boxes: updatedBoxes }
      }
    }));
  }, [currentConfig.boxWidth, currentConfig.boxHeight, currentConfig.boxLength]);

  const addBox = () => {
    const newBox = {
      id: currentConfig[currentLayer].nextId,
      x: 10,
      y: 10,
      width: Number(currentConfig.boxWidth),
      length: Number(currentConfig.boxLength),
      height: Number(currentConfig.boxHeight),
      rotate: 0
    };
    const updatedBoxes = [...currentConfig[currentLayer].boxes, newBox];
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [currentLayer]: {
          ...currentConfig[currentLayer],
          boxes: updatedBoxes,
          nextId: currentConfig[currentLayer].nextId + 1
        }
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
    const movingBox = currentConfig[currentLayer].boxes.find(box => box.id === id);
    const scaledWidth = movingBox.width * scaleFactorWidth;
    const scaledLength = movingBox.length * scaleFactorLength;
    let newX = Math.max(0, Math.min(Number(currentConfig.gridWidth) * scaleFactorWidth - scaledWidth, x));
    let newY = Math.max(0, Math.min(Number(currentConfig.gridHeight) * scaleFactorLength - scaledLength, y));

    const alignmentThreshold = 15;
    let snapX = newX;
    let snapY = newY;

    currentConfig[currentLayer].boxes.forEach(otherBox => {
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
    const overlapExists = currentConfig[currentLayer].boxes.some(otherBox =>
      otherBox.id !== id && boxesOverlap(testPosition, {
        ...otherBox,
        x: otherBox.x,
        y: otherBox.y,
        width: otherBox.width * scaleFactorWidth,
        length: otherBox.length * scaleFactorLength
      })
    );

    if (!overlapExists) {
      const updatedBoxes = currentConfig[currentLayer].boxes.map(box => {
        if (box.id === id) {
          return { ...box, x: snapX, y: snapY };
        }
        return box;
      });
      setPallets(prev => ({
        ...prev,
        [currentPallet]: {
          ...currentConfig,
          [currentLayer]: { ...currentConfig[currentLayer], boxes: updatedBoxes }
        }
      }));
    } else {
      console.error("Overlap detected, move not allowed. Trying to move Box", id, "to", newX, newY);
    }
  };

  const rotateBox = (id) => {
    const updatedBoxes = currentConfig[currentLayer].boxes.map(box => {
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
        [currentLayer]: { ...currentConfig[currentLayer], boxes: updatedBoxes }
      }
    }));
  };

  const removeBox = id => {
    const updatedBoxes = currentConfig[currentLayer].boxes.filter(box => box.id !== id);
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [currentLayer]: { ...currentConfig[currentLayer], boxes: updatedBoxes }
      }
    }));
  };

  const submitBoxes = () => {
    const allCoordinates = [];
    Object.keys(pallets).forEach(palletKey => {
      if (useTwoPallets || palletKey === 'left') {
        const config = pallets[palletKey];
        const coordinates = [];
        for (let layer = 1; layer <= config.numLayers; layer++) {
          const layerKey = layer % 2 === 1 ? 'odd' : 'even';
          config[layerKey].boxes.forEach(box => {
            const z = box.height * (layer - 0.5);
            const xCenter = ((box.x + (box.width * scaleFactorWidth / 2)) / scaleFactorWidth).toFixed(3);
            const yCenter = ((box.y + (box.length * scaleFactorLength / 2)) / scaleFactorLength).toFixed(3);
            coordinates.push({
              id: box.id,
              rotate: box.rotate,
              layer: layer,
              x: parseFloat(xCenter),
              y: parseFloat(yCenter),
              z: parseFloat(z),
              width: box.width,
              height: box.height,
              length: box.length,
              totalLayers: config.numLayers,
              pallet: palletKey,
              layerType: layerKey
            });
          });
        }
        allCoordinates.push(...coordinates);
      }
    });

    onSubmit({
      coordinates: allCoordinates,
      palletDimensions: {
        left: { width: parseFloat(pallets.left.gridWidth), height: parseFloat(pallets.left.gridHeight) },
        right: useTwoPallets ? { width: parseFloat(pallets.right.gridWidth), height: parseFloat(pallets.right.gridHeight) } : undefined
      }
    });
  };

  const handleDimensionChange = (setter) => (value) => {
    const sanitizedValue = typeof value === 'string' ? value.replace(/^0+/, '') || '' : value.toString();
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        [setter]: sanitizedValue
      }
    }));
  };
  

  const copyOddToEven = () => {
    const updatedEvenBoxes = currentConfig.odd.boxes.map(box => ({ ...box, id: currentConfig.even.nextId + box.id }));
    setPallets(prev => ({
      ...prev,
      [currentPallet]: {
        ...currentConfig,
        even: {
          ...currentConfig.even,
          boxes: updatedEvenBoxes,
          nextId: currentConfig.even.nextId + currentConfig.odd.boxes.length
        }
      }
    }));
    toast({
      title: "Configuration copied",
      description: "Odd layer configuration has been copied to even layers.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <Box minH="100vh" bg={bgColor} color={textColor}>
        <Flex direction="column" h="100vh">
          {/* Header */}
          <Flex as="header" align="center" justify="space-between" p={4} borderBottom="1px" borderColor={borderColor}>
            <Flex align="center">
              <IconButton
                icon={<Menu size={24} />}
                variant="ghost"
                onClick={onDrawerOpen}
                mr={4}
                aria-label="Open menu"
              />
              <Text fontSize="2xl" fontWeight="bold">Pallet Configurator</Text>
            </Flex>
            <HStack>
              <IconButton
                icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
              />
              <Button leftIcon={<Save size={20} />} colorScheme="blue" onClick={onModalOpen}>
                Save Config
              </Button>
              <Button leftIcon={<Play size={20} />} colorScheme="green" onClick={submitBoxes}>
                Submit
              </Button>
            </HStack>
          </Flex>

          {/* Main Content */}
          <Flex flex={1}  overflow="hidden">
            {/* Configuration Panel */}
            <AnimatePresence >
              <MotionBox
                initial={{ width: 0 }}
                animate={{ width: '400px' }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
                borderRight="1px"
                borderColor={borderColor}
                overflowY="auto"
                overflowX="hidden"
              >
                <VStack spacing={6} p={6} align="stretch">
                  <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                      <Tab><Package size={20} /></Tab>
                      <Tab><Grid size={20} /></Tab>
                      <Tab><Layers size={20} /></Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <VStack spacing={4} align="stretch">
                          <Text fontWeight="bold">Box Dimensions (m)</Text>
                          <DimensionInput
  label="Width"
  value={currentConfig.boxWidth}
  onChange={(value) => handleDimensionChange('boxWidth')(value)}
/>
                          <DimensionInput
                            label="Length"
                            value={currentConfig.boxLength}
                            onChange={(value) => handleDimensionChange('boxLength')(  value )}
                          />
                          <DimensionInput
                            label="Height"
                            value={currentConfig.boxHeight}
                            onChange={(value) => handleDimensionChange('boxHeight')( value )}
                          />
                        </VStack>
                      </TabPanel>
                      <TabPanel>
                        <VStack spacing={4} align="stretch">
                          <Text fontWeight="bold">Grid Dimensions (m)</Text>
                          <DimensionInput
                            label="Width"
                            value={currentConfig.gridWidth}
                            onChange={(value) => handleDimensionChange('gridWidth')(value)}
                          />
                          <DimensionInput
                            label="Height"
                            value={currentConfig.gridHeight}
                            onChange={(value) => handleDimensionChange('gridHeight')(value)}
                          />
                        </VStack>
                      </TabPanel>
                      <TabPanel>
                        <VStack spacing={4} align="stretch">
                          <Text fontWeight="bold">Layers</Text>
                          <Slider
                            value={currentConfig.numLayers}
                            onChange={(value) => handleDimensionChange('numLayers')(value)}
                            min={1}
                            max={10}
                            step={1}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <Tooltip label={`${currentConfig.numLayers} layer${currentConfig.numLayers > 1 ? 's' : ''}`}>
                              <SliderThumb boxSize={6} />
                            </Tooltip>
                          </Slider>
                          <HStack justify="space-between">
                            <Text>Current Layer: {currentLayer}</Text>
                            <Button size="sm" onClick={() => setCurrentLayer(currentLayer === 'odd' ? 'even' : 'odd')}>
                              Toggle Layer
                            </Button>
                          </HStack>
                          {currentLayer === 'even' && (
                            <Button leftIcon={<RotateCcw size={16} />} onClick={copyOddToEven} size="sm">
                              Copy Odd Config
                            </Button>
                          )}

<Button onClick={toggleUseTwoPallets}>
    {useTwoPallets ? "Use Single Pallet" : "Use Two Pallets"}
  </Button>
  {useTwoPallets && (
    <Button onClick={switchPallet}>
      Switch to {currentPallet === 'left' ? 'Right' : 'Left'} Pallet
    </Button>
  )}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                  <Button leftIcon={<Plus size={20} />} onClick={addBox} colorScheme="blue" w="full">
                    Add Box
                  </Button>
                </VStack>
              </MotionBox>
            </AnimatePresence>

            {/* Pallet Visualization */}
            <Box flex={1} width='50vw' p={6} ref={gridRef}>
              <BoxGrid
                boxes={currentConfig[currentLayer].boxes}
                gridWidth={displayWidth}
                gridHeight={displayHeight}
                moveBox={moveBox}
                rotateBox={rotateBox}
                removeBox={removeBox}
                scaleFactorWidth={scaleFactorWidth}
                scaleFactorLength={scaleFactorLength}
              />
            </Box>
          </Flex>
        </Flex>

        {/* Drawer for Saved Configurations */}
        <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
          <DrawerOverlay />
          <DrawerContent>
            <Flex justify="space-between" align="center" p={4} borderBottomWidth={1}>
              <Text fontSize="xl" fontWeight="bold">Saved Configurations</Text>
              <IconButton icon={<X size={24} />} onClick={onDrawerClose} variant="ghost" aria-label="Close menu" />
            </Flex>
            <Box p={4}>
              <SavedConfigurations
                configurations={savedConfigurations}
                applyConfiguration={(config) => {
                  applyConfiguration(config);
                  onDrawerClose();
                }}
                deleteConfiguration={deleteConfiguration}
              />
            </Box>
          </DrawerContent>
        </Drawer>

        {/* Modal for Saving Configuration */}
        <Modal isOpen={isModalOpen} onClose={onModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Save Configuration</ModalHeader>
            <ModalBody>
              <Input
                placeholder="Enter configuration name"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={saveConfiguration}>
                Save
              </Button>
              <Button variant="ghost" onClick={onModalClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </DndProvider>
  );
}

export default ManualPalletConfigurator;
