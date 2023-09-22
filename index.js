import express from 'express';
import axios from 'axios';

const PORT = 3000;
const app = express();

let currency_data = {};
const currencies = ['EUR', 'GBP' ,'JPY']
const cryptos = ['BTC', 'ETH']

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
      const formattedPastDate = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
      const formattedPresentDate = new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0];

      const dolarHistoricResponse = await axios.get(`https://api.bluelytics.com.ar/v2/evolution.json?days=${days*2}`);
      const data1 = dolarHistoricResponse.data;

      const dolarHistoricData = {
        dolar_blue: [],
        dolar_oficial: [],
      };

      for (const entry of data1) {
        const mappedEntry = {
          date: entry.date,
          source: entry.source,
          value_sell: entry.value_sell,
          value_buy: entry.value_buy,
        };

        if (entry.source === 'Blue') {
            dolarHistoricData.dolar_blue.push(mappedEntry);
        } else if (entry.source === 'Oficial') {
            dolarHistoricData.dolar_oficial.push(mappedEntry);
        }
      }

      const internationalCurrenciesData = {};
      currencies_url = ``
      try {
        for (const currency of currencies) {
          currencies_url = `https://api.exchangerate.host/timeseries?start_date=${formattedPastDate}&end_date=${formattedPresentDate}&symbols=${currency}&base=USD`
  
          const response = await axios.get(currencies_url);
          const data = response.data;

          if (data.success && data.timeseries && data.rates) {
            const rates = data.rates;
            const currencyData = [];

            for (const date in rates) {
              if (rates.hasOwnProperty(date)) {
                const valueBuy = rates[date][currency] || 0;
                currencyData.push({
                  date: date,
                  value_buy: valueBuy.toFixed(3),
                });
              }
            }

            internationalCurrenciesData[currency] = currencyData;
          } else {
            console.error(`Failed to fetch data for ${currency}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching data from ${currencies_url}: ${error.message}`);
      }

      const cryptoHistoricData = {};

      try {
        for (const crypto of cryptos) {
          const response = await axios.get(`https://api.exchangerate.host/timeseries?start_date=${formattedPastDate}&end_date=${formattedPresentDate}&base=${crypto}&symbols=USD`);
          const data = response.data;
      
          if (data.success && data.timeseries && data.rates) {
            const rates = data.rates;
            const cryptoData = [];

            for (const date in rates) {
              if (rates.hasOwnProperty(date)) {
                const valueBuy = rates[date]["USD"] || 0;
                cryptoData.push({
                  date: date,
                  value_buy: valueBuy.toFixed(3),
                });
              }
            }

            cryptoHistoricData[crypto] = cryptoData;
          } else {
            console.error(`Failed to fetch data for ${crypto}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${crypto}: ${error.message}`);
      }

      currency_data = {
        ...dolarHistoricData,
        ...internationalCurrenciesData,
        ...cryptoHistoricData
      };

      response.send(currency_data);
    } catch (error) {
      console.error('Error:', error);
      response.status(500).send('Request Failed');
    }
  });
  
