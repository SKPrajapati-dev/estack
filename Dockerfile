FROM node:14.15.0-alpine3.11
WORKDIR /src
COPY package*.json .
COPY . .
ENV JWT_SECRET_KEY=jhduwiyehduwyeiusdguw
RUN npm install
EXPOSE 8080
CMD ["npm","run","dev"]