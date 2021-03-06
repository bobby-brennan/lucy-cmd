# lucy
lucy is a command-line tool for working with [LucyBot's App Generator API](https://lucybot.com/blog/app-generator)

## Installation
```
npm install -g lucy
```

You can get an API key at [https://lucybot.com/register](https://lucybot.com/register).

## Usage
```
lucy build \
  --apikey="your_lucybot_apikey" \
  --directory=path/to/app \
  --destination=path/to/dest \
  --server="node" \
  --client="html-ejs" \
  --views="view1,view2" \
  --actions="action1"
  
lucy publish \
  --apikey="your_lucybot_apikey" \
  --apisecret="your_lucybot_apisecret" \
  --name="my_app" \
  --directory=path/to/app \
  --views="view1,view2" \
  --actions="action1"
```

`lucy publish` will publish the contents of `--directory` to the App Generator API

`lucy build` will build your app in the specified languages, using these files instead of the files currently published. This allows you to work on your app locally before publishing it.

## App Directory Structure
A sample directory is at [http://github.com/lucybot/hacker-news](http://github.com/lucybot/hacker-news)

The directory specified by `--directory` should be structured as

```
+ actions/
    + node/
        - action1.ejs.js
    + ruby/
        - action1.ejs.rb
    + ...
    + request/
        - action1.ejs.js
+ views/
    + html/
        - view1.ejs.html
        - view2.ejs.html
```
