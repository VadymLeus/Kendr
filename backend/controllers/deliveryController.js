// backend/controllers/deliveryController.js
const axios = require('axios');
const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
exports.getCities = async (req, res) => {
    try {
        const { search = '' } = req.query;
        const response = await axios.post(NP_API_URL, {
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: 'Address',
            calledMethod: 'getCities',
            methodProperties: { 
                FindByString: search, 
                Limit: '50' 
            }
        });
        const cities = response.data.data.map(city => ({
            ref: city.Ref,
            description: city.Description
        }));
        
        res.status(200).json(cities);
    } catch (error) {
        console.error('NP API Error:', error.message);
        res.status(500).json({ message: 'Помилка зв\'язку з Новою Поштою' });
    }
};

exports.getWarehouses = async (req, res) => {
    try {
        const { cityRef, search = '' } = req.query;
        if (!cityRef) return res.status(400).json({ message: 'cityRef обов\'язковий' });
        const response = await axios.post(NP_API_URL, {
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: 'Address',
            calledMethod: 'getWarehouses',
            methodProperties: { 
                CityRef: cityRef,
                FindByString: search,
                Limit: '100'
            }
        });

        const warehouses = response.data.data.map(w => ({
            ref: w.Ref,
            description: w.Description,
            latitude: w.Latitude,
            longitude: w.Longitude,
        })).filter(w => w.latitude && w.longitude);

        res.status(200).json(warehouses);
    } catch (error) {
        console.error('NP API Error:', error.message);
        res.status(500).json({ message: 'Помилка зв\'язку з Новою Поштою' });
    }
};