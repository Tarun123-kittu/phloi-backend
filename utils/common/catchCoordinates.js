const axios = require('axios');

async function getLatLongFromAddress(address) {
    const apiKey = 'AIzaSyD6jXSNWyQsHj3ITH_4CCeXJPI8vNhhUGM'; 
    const formattedAddress = `${address.streetAddress}, ${address.suiteUnitNumber}, ${address.city}, ${address.state}, ${address.pinCode}, ${address.country}`;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formattedAddress)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            throw new Error(`Geocoding error: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error fetching geolocation:', error.message);
        return null;
    }
}


module.exports = getLatLongFromAddress

