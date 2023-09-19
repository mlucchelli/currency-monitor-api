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

    const dolarData= {};

    for (const apiProperty in propertyMapping1) {
      if (data1.hasOwnProperty(apiProperty)) {
        dolarData[propertyMapping1[apiProperty]] = {
          "value_avg": data1[apiProperty].value_avg.toFixed(2),
          "value_sell": data1[apiProperty].value_sell.toFixed(2),
          "value_buy": data1[apiProperty].value_buy.toFixed(2),
        };
      }
    }

    const currencies = ['EUR', 'GBP' ,'JPY']
    const internationalCurrenciesData = {};
    try {
        for (const currency of currencies) {

          const response = await axios.get(`https://api.exchangerate.host/convert?from=USD&to=${currency}`);
          const data = response.data;
    
          if (data.success) {
            internationalCurrenciesData[currency] = {
                "value_avg": data.result.toFixed(2),
                //"value_sell": data1[apiProperty].value_sell.toFixed(2),
                //"value_buy": data1[apiProperty].value_buy.toFixed(2),
              };
          } else {
            console.error(`Failed to fetch data for ${currency}`);
          }
        }
      }
      catch (error) {
        console.error(`Error fetching data for ${currency}: ${error.message}`);
      }

      const cryptos = ['BTC', 'ETH']
      const CryptoData = {};
      try {
          for (const crypto of cryptos) {
            const response = await axios.get(`https://api.exchangerate.host/convert?from=${crypto}&to=USD`);
            const data = response.data;

            if (data.success) {
                CryptoData[crypto] = {
                  "value_avg": data.result.toFixed(2),
                  //"value_sell": data1[apiProperty].value_sell.toFixed(2),
                  //"value_buy": data1[apiProperty].value_buy.toFixed(2),
                };
            } else {
              console.error(`Failed to fetch data for ${crypto}`);
            }
          }
        }
        catch (error) {
          console.error(`Error fetching data for ${crypto}: ${error.message}`);
        }

    currency_data = {
      ...dolarData,
      ...internationalCurrenciesData,
      ...CryptoData
    };

    console.log(JSON.stringify(currency_data, null, 2));
    response.send(currency_data);
  } catch (error) {
    console.error('Error al hacer la solicitud a la API:', error);
    response.status(500).send('Error al obtener los datos de las APIs');
  }
});


app.get('/historic/:days', async (request, response) => {
    try {
      const { days } = request.params;
      
      const apiUrl = `https://api.bluelytics.com.ar/v2/evolution.json?days=${days}`;
      
      const response2 = await axios.get(apiUrl);
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
      console.error('Error:', error);
      response.status(500).send('Request Failed');
    }
  });
  
