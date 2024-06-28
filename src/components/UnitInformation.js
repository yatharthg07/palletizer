import React, { useState } from 'react';
import axios from 'axios';


const UnitInformation = ({ nextStep }) => {
    const [unitData, setUnitData] = useState({
        width: '',
        length: '',
        height: '',
        weight: '',
        palletHeight: '',
        palletWidth: '',
        clearance: '0',
        clearanceEnabled: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setUnitData({ ...unitData, [name]: checked });
        } else {
            setUnitData({ ...unitData, [name]: value });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/', unitData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                console.log(response.data);
                nextStep();
            } else {
                console.error('Failed to send data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
       
    //     <div className="flex flex-1 justify-between px-8 pt-6 pb-8 bg-white rounded-lg shadow-md w-3/4 m-auto flex-wrap">
    //     <div className="w-full lg:w-1/2 p-4 flex flex-col">
    //       <h2 className="text-2xl font-bold text-blue-700 mb-4">Unit Information</h2>
    //       <p className="mb-6 text-gray-800">Enter the width, length, height, and weight of each unit below.</p>
  
    //       <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
    //         <div>
    //           <label className="block text-lg font-semibold mb-2 text-gray-900">Unit Dimensions (in Cm)</label>
    //           <div className="flex space-x-4">
    //             <div className="flex flex-col">
    //               <label className="text-sm mb-2 text-black-800">Width</label>
    //               <input
    //                 type="number"
    //                 name="width"
    //                 value={unitData.width}
    //                 onChange={handleChange}
    //                 required
    //                 className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
    //               />
    //             </div>
    //             <div className="flex flex-col">
    //               <label className="text-sm mb-2 text-black-800">Length</label>
    //               <input
    //                 type="number"
    //                 name="length"
    //                 value={unitData.length}
    //                 onChange={handleChange}
    //                 required
    //                 className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
    //               />
    //             </div>
    //             <div className="flex flex-col">
    //               <label className="text-sm mb-2 text-black-800">Height</label>
    //               <input
    //                 type="number"
    //                 name="height"
    //                 value={unitData.height}
    //                 onChange={handleChange}
    //                 required
    //                 className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
    //               />
    //             </div>
    //           </div>
    //         </div>
  
    //         <div>
    //           <label className="block text-lg font-semibold mb-2 text-gray-900">Unit Weight (in Kg)</label>
    //           <input
    //             type="number"
    //             name="weight"
    //             value={unitData.weight}
    //             onChange={handleChange}
    //             required
    //             className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
    //           />
    //         </div>
  
    //         <div>
    //           <label className="block text-lg font-semibold mb-2 text-gray-900">Pallet Dimensions (in Cm)</label>
    //           <div className="flex space-x-4">
    //             <div className="flex flex-col">
    //               <label className="text-sm mb-2 text-black-700">Pallet Width</label>
    //               <input
    //                 type="number"
    //                 name="palletWidth"
    //                 value={unitData.palletWidth}
    //                 onChange={handleChange}
    //                 required
    //                 className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
    //               />
    //             </div>
    //             <div className="flex flex-col">
    //               <label className="text-sm mb-2 text-black-700">Pallet Length</label>
    //               <input
    //                 type="number"
    //                 name="palletLength"
    //                 value={unitData.palletLength}
    //                 onChange={handleChange}
    //                 required
    //                 className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
    //               />
    //             </div>
    //           </div>
    //         </div>
  
    //         <div>
    //           <label className="block text-lg font-semibold mb-2 text-gray-900">Clearance</label>
    //           <div className="flex items-center space-x-4">
    //             <input
    //               type="checkbox"
    //               name="clearanceEnabled"
    //               checked={unitData.clearanceEnabled}
    //               onChange={handleChange}
    //               className="h-5 w-5 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
    //             />
    //             <input
    //               type="number"
    //               name="clearance"
    //               value={unitData.clearance}
    //               onChange={handleChange}
    //               disabled={!unitData.clearanceEnabled}
    //               className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-200"
    //             />
    //           </div>
    //         </div>
  
    //         <div className="flex justify-between mt-6">
    //           <button
    //             type="button"
    //             className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
    //           >
    //             Previous Step
    //           </button>
    //           <button
    //             type="submit"
    //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
    //           >
    //             Next Step
    //           </button>
    //         </div>
    //       </form>
    //     </div>
  
    //     <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
    //       <img src={`${process.env.PUBLIC_URL}/box.png`} alt="box" className="max-w-full h-auto rounded shadow-lg" />
    //     </div>
    //   </div>
    <div className="flex flex-1 justify-between px-4 pt-4 pb-4 bg-white rounded-lg shadow-md w-4/5 m-auto flex-wrap">
      <div className="w-full lg:w-1/2 p-2 flex flex-col">
        <h2 className="text-lg font-bold text-blue-700 mb-2">Unit Information</h2>
        <p className="mb-4 text-gray-800">Enter the width, length, height, and weight of each unit below.</p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block text-lg font-semibold mb-1 text-gray-900">Unit Dimensions (in Cm)</label>
            <div className="flex space-x-2">
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-700">Width</label>
                <input
                  type="number"
                  name="width"
                  value={unitData.width}
                  onChange={handleChange}
                  required
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-700">Length</label>
                <input
                  type="number"
                  name="length"
                  value={unitData.length}
                  onChange={handleChange}
                  required
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-700">Height</label>
                <input
                  type="number"
                  name="height"
                  value={unitData.height}
                  onChange={handleChange}
                  required
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-1 text-gray-900">Unit Weight (in Kg)</label>
            <input
              type="number"
              name="weight"
              value={unitData.weight}
              onChange={handleChange}
              required
              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-1 text-gray-900">Pallet Dimensions (in Cm)</label>
            <div className="flex space-x-2">
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-700">Pallet Width</label>
                <input
                  type="number"
                  name="palletWidth"
                  value={unitData.palletWidth}
                  onChange={handleChange}
                  required
                  className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-700">Pallet Length</label>
                <input
                  type="number"
                  name="palletLength"
                  value={unitData.palletLength}
                  onChange={handleChange}
                  required
                  className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-1 text-gray-900">Clearance</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="clearanceEnabled"
                checked={unitData.clearanceEnabled}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
              />
              <input
                type="number"
                name="clearance"
                value={unitData.clearance}
                onChange={handleChange}
                disabled={!unitData.clearanceEnabled}
                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-200"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Previous Step
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Next Step
            </button>
          </div>
        </form>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-2">
        <img src={`${process.env.PUBLIC_URL}/box.png`} alt="box" className="max-w-full h-auto rounded shadow-lg" />
      </div>
    </div>
    );
};

export default UnitInformation;
