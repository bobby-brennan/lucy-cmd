# lucy
lucy is a command-line tool for working with [LucyBot's App Generator API](https://lucybot.com/)

## Installation
```
npm install -g lucy
```

You can get an API key at [https://lucybot.com/register](https://lucybot.com/register).

## Usage
```
lucy build \
  --apikey="your_lucybot_apikey"
  --directory=path/to/app \
  --destination=path/to/dest \
  --server="node" \
  --client="html-ejs" \
  --views="foo,bar" \
  --actions="baz" \
```
