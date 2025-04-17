# Astrawiki CLI

This is a command-line interface to manage an astrawiki node. It runs a
background service to help pin articles and offers tools for creating,
updating, and reading wiki content — either locally or via Docker.

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

- `npm`: for the installation.

## Install

This tool comes packaged as a Node.js binary, but it also comes with its own
Docker container.

### Local

To install it locally, run:

```sh
npm install -g @bitxenia/astrawiki-cli
```

And then run `astrawiki -V` to check the installation was successful.

### Docker

For this version, you'll need both Docker and Docker Compose installed. To run
the container, run:

```sh
git clone git@github.com:bitxenia/astrawiki-cli.git
cd astrawiki-cli
mkdir config
cp ./config.example.json ./config/config.json
```

Then open the `config/config.json` file and add your public IP to the file.
After that, you can run:

```sh
docker compose up
```

Similarly, to stop the container, you can run:

```sh
docker compose down
```

### Ports

For the tool to work as intended, it's necessary to open the ports `40001`,
`40002` and `40003` to your machine. This is the same for containers and local
installs, and enables the IPFS node to communicate with other peers.

## Quick start

```sh
npm install -g @bitxenia/astrawiki-cli
# Starts your wiki given the name an your public IP
astrawiki start --wikiName "my-wiki" --ip "<your-ip>"

# Adds an article to the wiki
astrawiki add "An article" "/path/to/your/article/content"

# Print the article content
astrawiki get "An article"
```

## Usage

### CLI

#### Start the service

```sh
astrawiki start [flags]
```

This command starts the service and connects to the network with other
astrawiki nodes.

#### Add an article

```sh
astrawiki add <name> [file]
```

Adds an article to the wiki given the name of the article. The `file` argument
lets the user choose a file to be the article's content. If `file` isn't
present, the tool lets the user write the content of the article from within an
editor. The editor of choice depends on the `$EDITOR` variable.

#### Get an article

```sh
astrawiki get <name>
```

Prints out an article from the wiki, as long as it exists.

#### List all articles

```sh
astrawiki list
```

Lists all articles in the wiki as a newline separated list.

#### View logs

```sh
astrawiki logs
```

This command shows the current standard output of the service. To view the
errors, run:

```sh
astrawiki logs -e
```

Also, you can follow the logs with the `-f` flag. This acts like `tail -f`.

### Container

#### Start the service

You can run the following command to build the container:

```sh
docker build -t bitxenia/astrawiki-cli:local .
```

Then, to run it, run the following:

```sh
docker run -p 40001:40001 -p 40002:40002 -p 40003:40003 \
  -e ASTRAWIKI_WIKI_NAME="bitxenia-wiki" \
  -e ASTRAWIKI_PUBLIC_IP="0.0.0.0" \
  -e ASTRAWIKI_IS_COLLABORATOR="" \
  bitxenia/astrawiki-cli:local
```

Make sure to replace the `ASTRAWIKI_PUBLIC_IP` environment variable to your
actual IPv4 address.

#### Add an article

```sh
cat ./some-file.txt | docker exec -i astrawiki astrawiki add "An article" -
```

This has to be done through `stdin`, because passing a path or editing in-place
is unsupported.

#### Get an article

```sh
docker exec -i astrawiki astrawiki get "An article"
```

#### List all articles

```sh
docker exec -i astrawiki astrawiki list
```

### View logs

```sh
docker exec -i astrawiki astrawiki logs
```

Or, to view errors:

```sh
docker exec -i astrawiki astrawiki logs -e
```

### HTTP API

There's a REST API that's in development, but it still works both in the local
and the Docker versions after running `astrawiki start`.

Available at `http://localhost:31337`, and supports the following
endpoints:

#### Add an article

```http
POST /articles
```

This accepts the following body:

```json
{
  "name": "<name of the article>",
  "content": "<content of the article as a raw string>"
}
```

On success, the server returns a `201 Created` status code.

#### Get an article

```http
GET /articles/<name>
```

This returns the following body:

```json
{
  "name": "<name of the article>",
  "content": "<content of the article as a raw string>"
}
```

On success, the server returns a `200 OK` status code.

#### List all articles

```http
GET /articles
```

This returns the following body:

```json
{
  "articles": [
    "article1",
    "article2"
    // ...
  ]
}
```

On success, the server returns a `200 OK` status code.

#### Get server status

```http
GET /
```

This returns a `200 OK` if the server is running.

## Configuration

Flags can handle the configuration, but the user can also set a config file to
reuse the same configuration upon start.

Path of the config file:

```sh
~/.config/astrawiki-cli/config.json
```

It consists of a JSON file with all the configurations needed.

### Example structure

```json
{
  "wikiName": "<name of the wiki to open>",
  "publicIp": "<ipv4 address, must be public>",
  "isCollaborator": true
}
```

The priority of configuration values is the following:

1. Flags
2. Config file
3. Defaults

Note that the IP value is mandatory and doesn't have a default value.

## Collaborating

Setting the `--collaborator` flag when starting the service will pin all the
articles of the wiki you chose. But what does this mean?

Since IPFS is a decentralized service, it needs users hosting the content
as opposed to servers. If you want to help your favorite wiki, it's useful to
pin the articles. This means that anytime another user wants to access the
wiki, they can get the content from you, or any other collaborator. That is, as
long as you keep the service running in your machine.

## Development

To work on this you can follow these steps:

```sh
git clone git@github.com:bitxenia/astrawiki-cli.git
cd astrawiki-cli
npm install
npm run build
```

This installs the dependencies and builds the JS files.

### Testing

Please make sure you don't have the npm package installed globally first. Just
in case, you can run:

```sh
npm remove -g @bitxenia/astrawiki-cli
```

To test the tool locally, you can run:

```sh
npm link
```

This creates a symlink to the built binary, allowing you to run it from
anywhere using the `astrawiki` command.

## Limitations

- It doesn't support astrawiki-eth.

## Contributing

Feel free to contribute by adding PRs, commenting, or creating issues.

## License

MIT (LICENSE-MIT / http://opensource.org/licenses/MIT)
