import React, { useState } from 'react';
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
  useColorModeValue,
  Image,
  Checkbox
} from '@chakra-ui/react';


const UnitInformation = ({ nextStep }) => {
  const inputBg = useColorModeValue('white', 'gray.200');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
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
    
      <Flex
      position="relative"
      display="flex"
      justifyContent="center"
      w="100%"
      h="75vh"
      overflow="hidden"
    >
      <Flex direction="row" w="80%" h="100%" overflow="hidden">
        <Box
          bg={useColorModeValue('white', 'gray.200')}
          rounded="lg"
          shadow="lg"
          p={6}
          w="100%"
          display="flex"
          flexDirection={{ base: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          h="100%"
        >
          <Stack
            spacing={2}
            w={{ base: '100%', lg: '40%' }}
            mb={{ base: 'auto', lg: 'auto' }}
            overflowY="auto"
            maxH="calc(100vh - 64px)" // Adjust max height to fit within the viewport
          >
            <Heading as="h2" size="lg" color="blue.600">
              Unit Information
            </Heading>
            <Text color="gray.600">
              Enter the width, length, height, and weight of each unit below.
            </Text>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <FormControl>
                <FormLabel fontWeight="bold" color="gray.800">
                  Unit Dimensions (in Cm)
                </FormLabel>
                <Flex gap={4}>
                  <Box>
                    <FormLabel>Width</FormLabel>
                    <Input
                      type="number"
                      name="width"
                      value={unitData.width}
                      onChange={handleChange}
                      required
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Length</FormLabel>
                    <Input
                      type="number"
                      name="length"
                      value={unitData.length}
                      onChange={handleChange}
                      required
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Height</FormLabel>
                    <Input
                      type="number"
                      name="height"
                      value={unitData.height}
                      onChange={handleChange}
                      required
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.800">
                  Unit Weight (in Kg)
                </FormLabel>
                <Input
                  type="number"
                  name="weight"
                  value={unitData.weight}
                  onChange={handleChange}
                  required
                  bg={inputBg}
                  borderColor={inputBorder}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.800">
                  Pallet Dimensions (in Cm)
                </FormLabel>
                <Flex gap={4}>
                  <Box>
                    <FormLabel>Pallet Width</FormLabel>
                    <Input
                      type="number"
                      name="palletWidth"
                      value={unitData.palletWidth}
                      onChange={handleChange}
                      required
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Pallet Length</FormLabel>
                    <Input
                      type="number"
                      name="palletLength"
                      value={unitData.palletLength}
                      onChange={handleChange}
                      required
                      bg={inputBg}
                      borderColor={inputBorder}
                    />
                  </Box>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.800">
                  Clearance
                </FormLabel>
                <Flex align="center" gap={2}>
                  <Checkbox
                    name="clearanceEnabled"
                    isChecked={unitData.clearanceEnabled}
                    onChange={handleChange}
                    borderColor={inputBorder}
                  />
                  <Input
                    type="number"
                    name="clearance"
                    value={unitData.clearance}
                    onChange={handleChange}
                    isDisabled={!unitData.clearanceEnabled}
                    bg={inputBg}
                    borderColor={inputBorder}
                    _disabled={{ bg: 'gray.200' }}
                  />
                </Flex>
              </FormControl>

              <Flex justify="space-between" mt={4}>
                <Button
                  type="button"
                  bg="gray.300"
                  color="gray.900"
                  _hover={{ bg: 'gray.400' }}
                  focus={{ outline: 'none', ring: 2, ringColor: 'blue.600' }}
                >
                  Previous Step
                </Button>
                <Button
                  type="submit"
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: 'blue.700' }}
                  focus={{ outline: 'none', ring: 2, ringColor: 'blue.600' }}
                >
                  Next Step
                </Button>
              </Flex>
            </form>
          </Stack>
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={{ base: '100%', lg: '50%' }}
            ml={{ lg: 4 }}
            maxH="100%"
          >
            <Box>
              <Image
                src={`${process.env.PUBLIC_URL}/box.png`}
                alt="box"
                maxW="full"
                h="auto"
                rounded="lg"
                shadow="lg"
              />
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
    );
};

export default UnitInformation;
