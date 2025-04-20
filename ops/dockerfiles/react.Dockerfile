FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
COPY ops/svcs/react-client/package.json ./ops/svcs/react-client/
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the packages
RUN npm run build:packages

# Build the React app
WORKDIR /app/ops/svcs/react-client
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/ops/svcs/react-client/dist /usr/share/nginx/html

# Copy custom nginx config
COPY ops/svcs/react-client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
