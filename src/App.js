import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UnitInformation from './components/UnitInformation';
import Results from './components/Results';
import DragAndDropPallet from './components/ManualPalletConfigurator'; // Assuming this is the drag-and-drop component
import './App.css';
// App.js
// App.js
import Results2 from './components/Results2'; // Import the new component
import { ChakraProvider,extendTheme } from '@chakra-ui/react';
const theme = extendTheme({
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
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [coordinates, setCoordinates] = useState([]); // State to hold coordinates from manual mode

  const [palletDimensions, setPalletDimensions] = useState({ width: 0, height: 0 });

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="w-full flex flex-wrap items-center justify-between bg-gray-100 shadow-md py-4 px-8">
        <img src={`${process.env.PUBLIC_URL}/orangewoodLogo.png`} alt="Logo" className="h-8" />
        <h1 className="text-2xl font-bold text-gray-800">3D Pallet Calculator and Configurator</h1>
      </header>
      <Navbar step={step} />
      <div className="w-full py-2 flex justify-end pr-8">
        <div className="flex items-center">
          <span className="mr-2 text-gray-600 font-medium">{mode === 'auto' ? 'Auto Mode' : 'Manual Mode'}</span>
          <label className="switch cursor-pointer">
            <input type="checkbox" checked={mode === 'manual'} onChange={toggleMode} className="sr-only"/>
            <div className="toggle-bg bg-gray-200 border-2 border-gray-200 h-6 w-11 rounded-full p-1 duration-300 ease-in-out">
              <div className={`toggle-dot bg-white w-4 h-4 rounded-full shadow-md transform ${mode === 'manual' ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
      </div>
      <div
        className="w-full flex-1 bg-white p-4 rounded shadow-md flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/backgroundImage_2.png)`,
          backgroundSize: 'cover',
        }}
      >
        {renderStep()}
      </div>
    </div>
    </ChakraProvider>
  );
};

export default App;
