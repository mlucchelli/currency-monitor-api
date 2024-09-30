import express from 'express';
import axios from 'axios';
import { config } from 'dotenv';
import moment from 'moment';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import webPush from 'web-push';
import bodyParser from 'body-parser';
import compression from 'compression';


config();

const PORT = 3000;
const app = express();

app.use(bodyParser.json());
app.use(compression());
app.set('view engine', 'ejs');

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const publicPath = join(currentDir, 'notifications/public');

let currency_data = {};
const currencies = ['EUR']
const cryptos = ['BTC', 'ETH']
const symbols = ['QQQ', 'SPOT', 'NVDA', 'SPY']
const CURRENCIES_ENABLED = true
const binanceConfig = {
  headers: {
    'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
    'Accept': 'application/json'
  },
};

const wiseConfig = {
  headers: {
    'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
    'Accept': 'application/json'
  },
};

const color_currencies = {
  "USD": "0,153,0",
  "USDb": "0,128,255",
  "EUR": "255,102,255",
  "GBP": "153,0,76",
  "JPY": "204,0,0",
  "CAD": "204,0,0",
  "BTC": "247,147,26",
  "ETH": "178,102,255",
  "QQQ": "46,134,193",
  "NVDA": "46,204,113 ",
  "SPOT": "25,111,61 ",
  "SPY": "255,0,127 ",
}

webPush.setVapidDetails("mailto:mario_no_soul@hotmail.com", process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

app.use(express.static(publicPath));

app.listen(PORT, () =>
  console.log(`The Currency Monitor is running on: http://localhost:${PORT}.`)
);

app.get('/health', (request, response) => {
    response.sendStatus(200);
  });

app.get('/latest', async (request, response) => {
  try {
    const dolarResponse = await axios.get('https://api.bluelytics.com.ar/v2/latest');
    const dolarJson = dolarResponse.data;

    const dolarTypes = {
      "oficial": "USD",
      "blue": "USDb"
    };

    const dolarData= {};
    const internationalCurrenciesData = {};
    const CryptoData = {};
    const SymbolData = {};

    for (const dolarType in dolarTypes) {
      if (dolarJson.hasOwnProperty(dolarType)) {
        dolarData[dolarTypes[dolarType]] = {
          "value_avg": parseInt(dolarJson[dolarType].value_avg),
          //"value_sell": dolarJson[dolarType].value_sell.toFixed(2),
          //"value_buy": dolarJson[dolarType].value_buy.toFixed(2),
          "color": color_currencies[dolarTypes[dolarType]]
        };
      }
    }

    if(CURRENCIES_ENABLED){
    try {
        for (const currency of currencies) {

          let url = `https://api.binance.com/api/v3/ticker/price?symbol=${currency}USDT`
          console.log(url, binanceConfig)
          const response = await axios.get(url);
          if (response.status == 200) {
            internationalCurrenciesData[currency] = {
                "value_avg": Number(response.data.price).toFixed(2),
                "color": color_currencies[currency]
              };
          } else {
            console.error(`Failed to fetch data for ${currency}`);
          }
        }
      }
      catch (error) {
        console.error(`Error fetching data from Binance: ${error.message}`);
      }

      try {
          for (const crypto of cryptos) {
            let url = `https://api.binance.com/api/v3/ticker/price?symbol=${crypto}USDT`
            const response = await axios.get(url, binanceConfig);
            if (response.status == 200) {
                CryptoData[crypto] = {
                  "value_avg": Number(response.data.price).toFixed(2),
                  "color": color_currencies[crypto]
                };
            } else {
              console.error(`Failed to fetch data for ${crypto}`);
            }
          }
        }
        catch (error) {
          console.error(`Error fetching data from Binance: ${error.message}`);
        }

        try {
          for (const symbol of symbols) {
            let url = `https://api.marketdata.app/v1/stocks/quotes/${symbol}/?token=${process.env.MARKETDATA_API_KEY}`
            console.log(url)
            const response = await axios.get(url);
            if (response.status == 200 || response.status == 203) {
              const symbol = response.data.symbol[0];
              const lastPrice = response.data.last[0];
              SymbolData[symbol] = {
                  "value_avg": Number(lastPrice).toFixed(2),
                  "color": color_currencies[symbol]
              };
          } else {
              console.error(`Failed to fetch data for ${symbol}`);
            }
          }
        }
        catch (error) {
          console.error(`Error fetching data from Marketdata: ${error.message}`);
        }
      }

    currency_data = {
      ...dolarData,
      ...internationalCurrenciesData,
      ...CryptoData,
      ...SymbolData
    };

    console.log(JSON.stringify(currency_data, null, 2));
    response.send(currency_data);
  } catch (error) {
    console.error('API ERROR', error);
    response.status(500).send('ERROR requesting exchangerate APIs');
  }
});


app.get('/historic/:days', async (request, response) => {
    try {
      const { days } = request.params;
      const formattedPastDate = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
      const formattedPresentDate = new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0];
      const startTime = moment().subtract(days, 'days').unix() * 1000;
      const endTime = moment().unix() * 1000;
      const dolarHistoricResponse = await axios.get(`https://api.bluelytics.com.ar/v2/evolution.json?days=${days*2}`);
      const dolarHistoricoJson = dolarHistoricResponse.data;
      const internationalCurrenciesData = {};
      const cryptoHistoricData = {};
      const SymbolHistoricData = {};

      const dolarHistoricData = {
        USDb: [],
        USD: [],
      };

      for (const dolarData of dolarHistoricoJson) {
        const dolar = {
          date: dolarData.date,
          source: dolarData.source,
          value_sell: dolarData.value_sell,
          value_buy: dolarData.value_buy,
        };

        if (dolarData.source === 'Blue') {
            dolarHistoricData.USDb.push(dolar);
        } else if (dolarData.source === 'Oficial') {
            dolarHistoricData.USD.push(dolar);
        }
      }

      // reverse sort the results this API put newst values at the begin
      dolarHistoricData.USDb.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

      dolarHistoricData.USD.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    try {
          for (const currency of currencies) {
            let url = `https://api.binance.com/api/v3/klines?symbol=${currency}USDT&interval=1d&startTime=${startTime}&endTime=${endTime}`
            console.log(url)
            const response = await axios.get(url, binanceConfig);
            const data = response.data;
            if (response.status == 200) {
              const currencyData = [];
                  for (const rate of data) {
                const date =  moment(rate[0]).format('YYYY-MM-DD');
                currencyData.push({
                    date: date,
                    value_buy: Number(rate[4]).toFixed(2) || 0,
                    });
                }

                internationalCurrenciesData[currency] = currencyData;
             } else {
               console.error(`Failed to fetch data for ${currency}`);
             }
           }
         } catch (error) {
           console.error(`Error fetching hsitorical data from Binance ${error.message}`);
         }

      try {
        for (const crypto of cryptos) {
          let url = `https://api.binance.com/api/v3/klines?symbol=${crypto}USDT&interval=1d&startTime=${startTime}&endTime=${endTime}`
          console.log(url)
          const response = await axios.get(url, binanceConfig);
          const data = response.data;
          if (response.status == 200) {
            const cryptoData = [];
                for (const rate of data) {
              const date =  moment(rate[0]).format('YYYY-MM-DD');
              cryptoData.push({
                  date: date,
                  value_buy: Number(rate[4]).toFixed(2) || 0,
                  });
              }

              cryptoHistoricData[crypto] = cryptoData;
           } else {
             console.error(`Failed to fetch data for ${crypto}`);
           }
         }
       } catch (error) {
         console.error(`Error fetching hsitorical data from Binance ${error.message}`);
       }

      try {
        for (const symbol of symbols) {
          let url = `https://api.marketdata.app/v1/stocks/candles/D/${symbol}?from=${formattedPastDate}&to=${formattedPresentDate}&token=${process.env.MARKETDATA_API_KEY}`
          console.log(url)
          const response = await axios.get(url);
          const data = response.data;
          if (response.status === 200 || response.status == 203 ) {
            const symbolData = [];
            const dates = response.data.t.map(timestamp => moment(timestamp * 1000).format('YYYY-MM-DD'));
            for (let i = 0; i < response.data.h.length; i++) {
                symbolData.push({
                    date: dates[i],
                    value_buy: Number(response.data.h[i]).toFixed(2) || 0,
                });
            }
            SymbolHistoricData[symbol] = symbolData;
        } else {
             console.error(`Failed to fetch data for ${currency}`);
           }
         }
       } catch (error) {
         console.error(`Error fetching hsitorical data from Marketdata ${error.message}`);
       }

      currency_data = {
        ...dolarHistoricData,
        ...internationalCurrenciesData,
        ...cryptoHistoricData,
        ...SymbolHistoricData
      };

      response.send(currency_data);
    } catch (error) {
      console.error('Error:', error);
      response.status(500).send('Request Failed');
    }
  });

// Create route for allow client to subscribe to push notification.
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "IOT Notifications", body: "This is your first push notification" });
  console.log(payload)
  webPush.sendNotification(subscription, payload).catch(console.log);
})
  
app.get('/client.js', function(req, res) {
  res.render(publicPath+'/client.ejs');
});