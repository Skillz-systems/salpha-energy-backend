#Creates a layer from node:18 image.
FROM node:19.3.0

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

#Copy new files or directories into the filesystem of the container
COPY package.json /usr/src/app


#Execute commands in a new layer on top of the current image and commit the results
RUN npm install
RUN npm install glob rimraf

##Copy new files or directories into the filesystem of the container
COPY . /usr/src/app

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
