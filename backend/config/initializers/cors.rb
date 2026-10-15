# Be sure to restart your server when you modify this file.

# Allows the frontend to call the API from another origin. Origins come from CORS_ORIGINS
# (comma-separated, see .env.example); the default is the local Vite server.
# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ENV.fetch("CORS_ORIGINS", "http://localhost:3001").split(",").map(&:strip).reject(&:empty?))

    resource "/api/*", headers: :any, methods: [ :get, :options, :head ]
  end
end
