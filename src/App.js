import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Image,
  Heading,
  HStack,
  useColorModeValue,
  extendTheme,
  ColorModeScript,
  IconButton,
  useColorMode
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import Navbar from './components/Navbar';
import UnitInformation from './components/UnitInformation';
import Results from './components/Results';
import ManualPalletConfigurator from './components/ManualPalletConfigurator';
import Results2 from './components/Results2';
import ModeToggle from './components/ModeToggle';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const App = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('manual');
  const [coordinates, setCoordinates] = useState([]);
  const [palletDimensions, setPalletDimensions] = useState({ left: { width: 0, height: 0 }, right: undefined });
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('white', 'gray.800');
  const headerShadow = useColorModeValue('sm', 'md');

  const handleManualSubmit = (data) => {
    setCoordinates(data.coordinates);
    setPalletDimensions(data.palletDimensions);
    setStep(4);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const toggleMode = () => setMode(mode === 'auto' ? 'manual' : 'auto');

  const renderStep = () => {
    if (mode === 'auto') {
      switch (step) {
        case 1:
          return <UnitInformation nextStep={nextStep} />;
        case 2:
          return <Results prevStep={prevStep} />;
        default:
          return <UnitInformation nextStep={nextStep} />;
      }
    } else if (mode === 'manual') {
      if (step === 4) {
        return <Results2 coordinates={coordinates} palletDimensions={palletDimensions} prevStep={prevStep} />;
      }
      return <ManualPalletConfigurator onSubmit={handleManualSubmit} />;
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Flex direction="column" minH="100vh" bg={bgColor}>
        <Flex
          as="header"
          align="center"
          justify="space-between"
          wrap="wrap"
          padding="1rem"
          bg={headerBgColor}
          color={useColorModeValue('gray.800', 'white')}
          boxShadow={headerShadow}
        >
          <HStack spacing={4}>
            <Image src={`${process.env.PUBLIC_URL}/orangewoodLogo.png`} alt="Logo" h="8" />
            <Heading as="h1" size="lg" letterSpacing={'tight'}>
              3D Pallet Calculator
            </Heading>
          </HStack>
          <HStack spacing={4}>
            <ModeToggle mode={mode} toggleMode={toggleMode} />
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle color mode"
            />
          </HStack>
        </Flex>

        <Navbar step={step} />
        
        <Box flex={1} overflow="hidden">
          {renderStep()}
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default App;