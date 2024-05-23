import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UnitInformation from './components/UnitInformation';
import Results from './components/Results';
import './App.css';

const App = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <UnitInformation nextStep={nextStep} />;
      case 2:
        return <Results prevStep={prevStep} />;
      default:
        return <UnitInformation nextStep={nextStep} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="w-full flex flex-wrap items-center justify-between bg-gray-100 shadow-md py-4 px-8">
        <img src={`${process.env.PUBLIC_URL}/orangewoodLogo.png`} alt="Logo" className="h-8" />
        <h1 className="text-2xl font-bold text-gray-800">3D Pallet Calculator and Configurator</h1>
      </header>
      <Navbar step={step} />
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
  );
};

export default App;
