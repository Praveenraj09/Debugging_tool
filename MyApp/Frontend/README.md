# Getting Started with Create React App

This project was bootstrapped with [Create React App]

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
MyApplication/README.md
# Data Discovery Tool
This Python-based tool using Ployly/Dash can be used to perform many SQL discovery tasks on
tables in an Ocient database.

#### Prerequisites

A Python >= 3.7 installation. 


### Installation
The package gets installed into a Python virtual enviroment as follows.
Choose the 'requirements' file that matches your Python version.

```
git clone https://github.com/Xeograph/sales.git
cd tools/sql_discovery
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r ./requirement.txt
```

### Startup

First update file `config/ocient_db.ini` with the Ocient connection and Calendar info.
```
./app.py
Dash is running on http://127.0.0.1:8050/

 * Serving Flask app 'app'
 * Debug mode: on
```
### Access the application from a browser
```
Go to URL:  http://127.0.0.1:8050/
```

### INSTALLATION
cd src/backend
pip3 install requirement.txt
python -m venv .venv
source .venv/bin/activate
python app.py

npm install axios
cd my-react-app/
npm start
