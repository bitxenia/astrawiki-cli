# Astrawiki CLI

This is a command-line interface to interact and manage an astrawiki-ipfs node.
It runs a background service that can be used to help pin a given wiki's
articles.

## Motivation

The main purpose of this tool is to be able to easily spin up a collaborator
node for a wiki. By providing a reasonably straightforward way for a community
to contribute to their wiki, anyone with access to a terminal can support the
community they choose.

## Features

- Create a new wiki and pin its articles for all to access.
- Connect with any existing wiki and help host it by pinning all its articles.
- Run it in the background as a service.

## Prerequisites

Users should be familiar with [port
forwarding](https://en.wikipedia.org/wiki/Port_forwarding) to open the
needed ports for other peers to get the articles. It's recommended, but not
necessary, that the user is familiar with [IPFS](https://docs.ipfs.tech) and
specifically [OrbitDB](https://orbitdb.org).

## Dependencies

- `npm`: for installing it.

## Install

This tool comes packaged as a Node.js binary, but it also comes with its own
Docker container.

### Local

To install it locally, run:

```sh
npm install -g astrawiki-cli
```

## Docker

For this version, you'll need both Docker abd Docker Compose installed. To run
the container, clone the repo and run:

```sh
docker compose up
```

Similarly, whenener you want to stop the container, you can run:

```sh
docker compose down
```

## Usage

### CLI

#### Start the service

```sh
astrawiki start
```

This command starts the service and connects to the network with other
astrawiki nodes. See `--help` for more information about the flags.

#### List all articles

```sh
astrawiki list
```

Lists all articles in a wiki, pinned, or otherwise.

#### View logs

```sh
astrawiki logs
```

This command shows the current standard output of the service. To view the
errors, run:

```sh
astrawiki errors
```

### Docker

Running commands using the containerized version can be done with `docker
exec`. Simply prepend any command found in the command-line interface with]
`docker exec astrawiki`.

### HTTP API

There's a REST API that's in development, but it still works both in the local
and the Docker versions.

It's accesed by `http://localhost:31337`, and supports the following endpoints:

- Get a list of articles: `GET http://localhost:3133/articles`

## Development

To work on this you must clone the repository, and run it.

## Limitations

- It doesn't support astrawiki-eth.
- Doesn't implement all the features astrawki can bring, like adding, viewing,
  and deleting articles.

## Contributing

Feel free to contribute by adding PRs, commenting, or creating issues.

## License

MIT (LICENSE-MIT / http://opensource.org/licenses/MIT)

