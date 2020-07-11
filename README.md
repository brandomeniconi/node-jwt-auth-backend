# NodeJS JWT Authentication App

This is a sample application to showcase a JWT persistent authentication.

## Development 

This project comes with a pre-built dev environment based on docker containers.

### Installation

```bash 
# install all required rependencies
npm install

# clone the .env files from template and set the required env variables
cp .env.dist .env
cp .env.dist .env.test
```

### Run the containerized dev environment

The app is setup to run by default at port `3000`, but you can change it to whatever you like by using the `PORT` env variable.

#### Docker

To run the dev environment with `docker`, run:

```
docker-composer up .devcontainer/docker-compose.yaml
```
This will start the `nodejs` and `mongodb` containers and it will initialize the DB collections automatically


#### Visual Studio Code

With Visual Studio Code you can use [Remote Containers](https://code.visualstudio.com/docs/remote/containers) to run the Docker containers [from the VSCode editor](https://code.visualstudio.com/docs/remote/containers#_quick-start-open-an-existing-folder-in-a-container).

Before starting you need to install:

* [Docker](https://www.docker.com) or [Docker Desktop](https://www.docker.com/products/docker-desktop)
* [Visual Studio Code](https://code.visualstudio.com/) (version >1.35)
* [Remote Develompent](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) VSCode Extension

Start VS Code, run the `Remote-Containers: Open Folder in Container...` command from the Command Palette `(F1)` or quick actions Status bar item


#### Manually

This app uses `nodemon` to hot-reload files during development. To start the dev server manually from your terminal use:

```bash
# Initialize database collections anche schemas
npm run db-init

# Start the dev server
npm run dev
```

_WARNING: you need to start the MongoDb server, too!_

### Coding standards

This app uses the [StandardJS's](https://standardjs.com/) coding standard: `semistandard` (❤️ semicolons). 
To automatically verify and fix the code run

```
npm run fix
```

### Monitoring

To watch backend server output attach to the `node` container:
```
docker container attach <container-name>
```

To use `mongo-cli`, run it in the mongodb container: 
```
docker exec -it <container-name> mongo -u "root" -p "rootpwd"
```


## Testing

To test the app run:

```
npm test
```
