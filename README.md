# README

sunsapp/
* |- backend/     # Ruby on Rails bakend API
* |- frontend/    # React frontend


## host
* backend: localhost:3000
* frontend: localhost:3001

## backend

### Requirements
* Ruby version: 3.4.3
```bash
    brew install ruby
    brew install rbenv ruby-build
    rbenv init
    rbenv install 3.4.3
    rbenv global 3.4.3
    rbenv local 3.4.3
    eval "$(rbenv init - bash)"
    ruby -v
```
* Rails version: 8.0.2
```bash
    gem install rails --version 8.0.2
```

### Dependencies
* HTTParty: For making HTTP requests to the backend.
* Geocoder: For converting location names to coordinates (geocoding).

### Deployment

#### go to backend directory
* cd backend

#### install Ruby dependencies
* bundle install

#### create database
* rake db:create

#### migrate database
* rake db:migrate

#### run server
* rails s


## frontend

### Requirements
* Node version: v20.15.0
```bash
    npm install -g node@20.15.0
```
* React version: 19.1.0
* npm or yarn

### Dependencies
* React: The core JavaScript library for building user interfaces.
* axios: For making HTTP requests to the backend.
* React-datepicker: A react component for date range selection.
* bootstrap: For responsive UI components.
* chart.js: For creating charts.
* react-chartjs-2: For creating charts.

### Deployment

#### go to frontend directory
* cd frontend

#### install npm or yarn dependencies
* npm install 
* (or) yarn install

#### run server
* npm start
* (or) yarn start

## TODO

- add nginx config
- add dockerfile
- add docker-compose
- add tests