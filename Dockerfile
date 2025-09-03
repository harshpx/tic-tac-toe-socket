FROM node:22
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5002
CMD ["npm", "start"]
