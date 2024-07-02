FROM node:18.15.0

# Create app directory
RUN mkdir -p /usr/source

# Initialize the runtime directory
COPY ./* /usr/source/
WORKDIR /usr/source
RUN npm install
RUN npm run build

CMD ["npm", "start"]