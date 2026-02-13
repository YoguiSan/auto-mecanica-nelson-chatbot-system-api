# Use an official Node.js runtime as a parent image
FROM node:24-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the application source code to the container
COPY . .

# Install application dependencies
RUN npm install --legacy-peer-deps

# Expose port 3000 to the outside world
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
