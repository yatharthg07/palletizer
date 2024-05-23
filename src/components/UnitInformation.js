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
        clearance: '',
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
        <div className="flex justify-between p-4 bg-gray-100 rounded-lg shadow-lg w-3/4 m-auto flex-wrap">
            <div className="w-1/2 p-2 flex flex-col">
                <h2 className="text-xl font-bold text-blue-600 mb-2">Unit Information</h2>
                <p className="mb-4 text-gray-700">Enter the width, length, height, and weight of each unit below.</p>

                <form onSubmit={handleSubmit} className="flex flex-col flex-wrap space-y-4">
                    <div>
                        <label className="block text-lg font-semibold mb-1 text-gray-800">Unit Dimensions</label>
                        <div className="flex space-x-2">
                            <div className="flex flex-col">
                                <label className="text-sm mb-1 text-gray-600">Width</label>
                                <input
                                    type="number"
                                    name="width"
                                    value={unitData.width}
                                    onChange={handleChange}
                                    required
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm mb-1 text-gray-600">Length</label>
                                <input
                                    type="number"
                                    name="length"
                                    value={unitData.length}
                                    onChange={handleChange}
                                    required
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm mb-1 text-gray-600">Height</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={unitData.height}
                                    onChange={handleChange}
                                    required
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-1 text-gray-800">Unit Weight</label>
                        <input
                            type="number"
                            name="weight"
                            value={unitData.weight}
                            onChange={handleChange}
                            required
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-1 text-gray-800">Pallet Dimensions</label>
                        <div className="flex space-x-2">
                            <div className="flex flex-col">
                                <label className="text-sm mb-1 text-gray-600">Pallet Height</label>
                                <input
                                    type="number"
                                    name="palletHeight"
                                    value={unitData.palletHeight}
                                    onChange={handleChange}
                                    required
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm mb-1 text-gray-600">Pallet Width</label>
                                <input
                                    type="number"
                                    name="palletWidth"
                                    value={unitData.palletWidth}
                                    onChange={handleChange}
                                    required
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-1 text-gray-800">Clearance</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="clearanceEnabled"
                                checked={unitData.clearanceEnabled}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <input
                                type="number"
                                name="clearance"
                                value={unitData.clearance}
                                onChange={handleChange}
                                disabled={!unitData.clearanceEnabled}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button type="button" className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">Previous Step</button>
                        <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Next Step</button>
                    </div>
                </form>
            </div>

            <div className="w-1/2 flex items-center justify-center p-2">
                <img src={`${process.env.PUBLIC_URL}/box.png`} alt="box" className="max-w-full h-auto rounded shadow-lg" />
            </div>
        </div>
    );
};

export default UnitInformation;
