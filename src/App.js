import React, { useState } from 'react';
import { ChakraProvider, Box, Flex, Image, Heading, VStack, useColorModeValue, extendTheme, ColorModeScript } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import UnitInformation from './components/UnitInformation';
import Results from './components/Results';
import DragAndDropPallet from './components/ManualPalletConfigurator';
import Results2 from './components/Results2';
import ModeToggle from './components/ModeToggle';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      'body': {
        bg: 'gray.100',
        color: 'black'
      },
      'input, textarea, select': {
        bg: 'white',
        color: 'black',
      },
    },
  },
});

const App = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('manual');
  const [coordinates, setCoordinates] = useState([]);
  const [palletDimensions, setPalletDimensions] = useState({ width: 0, height: 0 });

  const bgOverlay = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const headerBgColor = useColorModeValue('white', 'gray.800');
  const headerShadow = useColorModeValue('sm', 'md');
  const contentBgColor = useColorModeValue('whiteAlpha.800', 'blackAlpha.600');

  const handleManualSubmit = (data) => {
    setCoordinates(data.coordinates);
    setPalletDimensions({ width: data.gridWidth, height: data.gridHeight });
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
      return <DragAndDropPallet onSubmit={handleManualSubmit} />;
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Box
        minH="100vh"
        backgroundImage={`url(${process.env.PUBLIC_URL}/backgroundImage_2.png)`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
      >
        <Box  minH="100vh">
          <Flex
            as="header"
            align="center"
            justify="space-between"
            wrap="wrap"
            padding="1.2rem"
            bg={headerBgColor}
            color="gray.800"
            boxShadow={headerShadow}
          >
            <Image src={`${process.env.PUBLIC_URL}/orangewoodLogo.png`} alt="Logo" h="8" />
            <Heading as="h1" size="lg" letterSpacing={'tight'}>
              3D Pallet Calculator and Configurator
            </Heading>
          </Flex>

          <VStack spacing={2} align="stretch" >
            <Navbar step={step} />
            <Flex justify="flex-end" w="full" >
              <ModeToggle mode={mode} toggleMode={toggleMode} />
            </Flex>
            <Box
              flex="1"
              display='flex'
              justifyContent='center'
            >
              {renderStep()}
            </Box>
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default App;