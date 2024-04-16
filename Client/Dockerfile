#Use the official Node.js 16 image as the base image
FROM node:16

#Set the working directory in the container to /app
WORKDIR /app

#Copy the package.json file into the container at /app
COPY package*.json ./

#Install all the dependencies
RUN npm install

#Copy the rest of the application code into the container at /app
COPY . .

#Set the PORT environment variable to 8080
ENV PORT=8080

#Expose the port the app runs on
EXPOSE 8080

#Start the application, no shell form
CMD ["npm", "run", "dev"]