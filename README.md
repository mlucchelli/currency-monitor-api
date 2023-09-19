# currency-monitor-api
Welcome to the Currency Monitor API! This API provides real-time and historical currency exchange rate data for the Argentine Peso (ARS) against the US Dollar (USD) and the Euro (EUR).
![image](https://github.com/mlucchelli/currency-monitor-api/assets/17179003/5bf96016-f9dc-4f87-8759-d16aefb0c671)

## Table of Contents
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Latest Exchange Rates](#latest-exchange-rates)
  - [Historical Data](#historical-data)
- [Tools](#tools)
- [Contributing](#contributing)
- [Reading Material](#reading-material)

## Getting Started

### Installation
1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Start the server with `npm start`.

### Usage
- Access the API via `http://localhost:3000` (by default).
- Use the API endpoints described below.

## API Endpoints

### Health Check

- **Endpoint:** `/health`
- **Description:** Check the health of the API.
- **HTTP Method:** GET
- **Response:** 200 OK if the API is healthy.

### Latest Exchange Rates

- **Endpoint:** `/latest`
- **Description:** Get the latest exchange rates for the Argentine Peso (ARS) against the US Dollar (USD) and the Euro (EUR).
- **HTTP Method:** GET
- **Response:** JSON object with the latest exchange rate data.

### Historical Data

- **Endpoint:** `/historic/:days`
- **Description:** Get historical exchange rate data for a specified number of days.
- **HTTP Method:** GET
- **Parameters:** `days` (integer) - Number of days for historical data.
- **Response:** JSON object with historical exchange rate data.

##Tools
- https://chatuml.com/ for diagrams
- https://chat.openai.com/ for documentation and code review
- https://render.com/ for hosting

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Create a pull request with a clear description of your changes.

## Reading Material
- [Your First Node API](https://herewecode.io/blog/step-by-step-guide-create-first-api-with-node-express/)
- [Deploy app with Render](https://www.freecodecamp.org/news/how-to-deploy-nodejs-application-with-render/)
