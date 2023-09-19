import express from 'express';
import axios from 'axios';

const PORT = 3000;
const app = express();

let currency_data = {};

app.listen(PORT, () =>
  console.log(`The Books API is running on: http://localhost:${PORT}.`)
);

app.get('/health', (request, response) => {
    response.sendStatus(200);
  });

app.get('/latest', async (request, response) => {
  try {
    const response1 = await axios.get('https://api.bluelytics.com.ar/v2/latest');
    const data1 = response1.data;

    const propertyMapping1 = {
      "oficial": "dolar_oficial",
      "blue": "dolar_blue"
    };

    const dolarEuroResponse = {};

    for (const apiProperty in propertyMapping1) {
      if (data1.hasOwnProperty(apiProperty)) {
        dolarEuroResponse[propertyMapping1[apiProperty]] = {
          "value_avg": data1[apiProperty].value_avg.toFixed(2),
          "value_sell": data1[apiProperty].value_sell.toFixed(2),
          "value_buy": data1[apiProperty].value_buy.toFixed(2),
        };
      }
    }
    
    currency_data = {
      ...dolarEuroResponse,
    };

    console.log(JSON.stringify(currency_data, null, 2));
    response.send(currency_data);
  } catch (error) {
    console.error('Error al hacer la solicitud a la API:', error);
    response.status(500).send('Error al obtener los datos de las APIs');
  }
});


app.get('/historic', async (request, response) => {
    try {
      const response2 = await axios.get('https://api.bluelytics.com.ar/v2/evolution.json?days=90');
      const data2 = response2.data;
  
      const historicalData = {
        dolar_blue: [],
        dolar_oficial: [],
      };
  
      for (const entry of data2) {
        const mappedEntry = {
          date: entry.date,
          source: entry.source,
          value_sell: entry.value_sell,
          value_buy: entry.value_buy,
        };
  
        if (entry.source === 'Blue') {
          historicalData.dolar_blue.push(mappedEntry);
        } else if (entry.source === 'Oficial') {
          historicalData.dolar_oficial.push(mappedEntry);
        }
      }
    response.send(historicalData);
    } catch (error) {
      console.error('Error al obtener datos históricos de la API:', error);
      response.status(500).send('Error al obtener datos históricos');
    }
  });
    
