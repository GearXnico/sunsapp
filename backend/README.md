# README

## Requirements

* Ruby version: 3.4.3
* Rails version: 8.0.2

## Dependencies
* HTTParty: For making HTTP requests to the backend.
* Geocoder: For converting location names to coordinates (geocoding).

## Deployment

### install Ruby dependencies
* bundle install

### create database
* rails db:create

### migrate database
* rails db:migrate

### run server
* rails s