# README

## Requirements

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