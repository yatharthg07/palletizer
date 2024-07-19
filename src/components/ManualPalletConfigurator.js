import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BoxGrid from './BoxGrid';
import SavedConfigurations from './SavedConfigurations';
import "./draganddrop.css"
import { ChevronLeftIcon } from '@chakra-ui/icons';
import html2canvas from 'html2canvas';
import axios from 'axios';
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
  const [masterPoints, setMasterPoints] = useState({ left: null, right: null });
  const [masterPointButtons, setMasterPointButtons] = useState({ left: 'Set Master Point 1', right: 'Set Master Point 2' });
  const [scaleFactorWidth, setScaleFactorWidth] = useState(100);
  const [scaleFactorLength, setScaleFactorLength] = useState(100);
  const [displayWidth, setDisplayWidth] = useState(500);
  const [displayHeight, setDisplayHeight] = useState(500);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const gridRef = useRef(null);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isTeachRobotModalOpen, onOpen: onTeachRobotModalOpen, onClose: onTeachRobotModalClose } = useDisclosure();
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
        useTwoPallets,
        scaleFactorWidth,
        scaleFactorLength,
        displayHeight,
        displayWidth,
        previewImage,
        masterPoints
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
    setMasterPoints(config.masterPoints || { left: null, right: null });
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
        right: useTwoPallets ? { width: parseFloat(pallets.right.gridWidth), height: parseFloat(pallets.right.gridHeight) } : undefined,
        masterPoints: masterPoints
      }
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

  const setMasterPoint = async (pallet) => {
    try {
      const response = await axios.post(`http://localhost:5000/set-master-point/${pallet}`);
      if (response.status === 200) {
        setMasterPointButtons(prev => ({
          ...prev,
          [pallet]: 'Confirm Position'
        }));
        toast({
          title: "Move Robot",
          description: "Please move the robot to the desired master point position.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(`Failed to set master point for Pallet ${pallet}:`, error);
    }
  };
  
  const confirmMasterPoint = async (pallet) => {
    try {
      const response = await axios.post(`http://localhost:5000/confirm-master-point/${pallet}`);
      if (response.status === 200) {
        setMasterPoints(prev => ({
          ...prev,
          [pallet]: response.data.masterPoint
        }));
        setMasterPointButtons(prev => ({
          ...prev,
          [pallet]: `Set Master Point`
        }));
        toast({
          title: "Master Point Set",
          description: `Master Point for Pallet ${pallet === 'left' ? 1 : 2} is set.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(`Failed to confirm master point for Pallet ${pallet}:`, error);
    }
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
                <Switch id="two-pallets-switch" isChecked={useTwoPallets} onChange={() => setUseTwoPallets(!useTwoPallets)} />
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
                  Current Layer: {currentLayer.charAt(0).toUpperCase() + currentLayer.slice(1)}
                </FormLabel>
                <Switch id="layer-switch" onChange={() => setCurrentLayer(currentLayer === 'odd' ? 'even' : 'odd')} />
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
              <Button mt={4} colorScheme="orange" onClick={onTeachRobotModalOpen} flex="1" minW="130px">
                Teach Robot
              </Button>
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
<Modal isOpen={isTeachRobotModalOpen} onClose={onTeachRobotModalClose}>
  <ModalOverlay />
  <ModalContent bg="gray.100">
    <ModalHeader>Teach Robot</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Text>Please move the robot to the desired master point position and then confirm.</Text>
      <Button colorScheme="blue" onClick={() => {
        if (masterPointButtons.left === 'Confirm Position') {
          confirmMasterPoint('left');
        } else {
          setMasterPoint('left');
        }
      }} mt={4}>
        {masterPointButtons.left}
      </Button>
      {useTwoPallets && (
        <Button colorScheme="blue" onClick={() => {
          if (masterPointButtons.right === 'Confirm Position') {
            confirmMasterPoint('right');
          } else {
            setMasterPoint('right');
          }
        }} mt={4}>
          {masterPointButtons.right}
        </Button>
      )}
      {(
        <Text mt={4}>
          Master Point 1: {JSON.stringify(masterPoints.left)}
        </Text>
      )}
      {useTwoPallets && (
        <Text mt={4}>
          Master Point 2: {JSON.stringify(masterPoints.right)}
        </Text>
      )}
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" onClick={onTeachRobotModalClose}>
        Close
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

      </Box>
    </DndProvider>
  );
}

export default ManualPalletConfigurator;
