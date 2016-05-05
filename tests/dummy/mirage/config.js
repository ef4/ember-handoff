import { Response } from 'ember-cli-mirage';

export default function() {

  let getHTTP = (path, body) => {
    this.get(path, () => {
      return new Response(200, {'Content-Type': 'text/http'}, body);
    });
  };

  getHTTP('/', `
    <html>
      <head>
        <title>Sample Index</title>
      </head>
      <body>
        <h1>This is sample index.</h1> <a href="one">Go to one.</a> <a href="two">Go to two.</a>
      </body>
    </html>
  `);

  getHTTP('/one', `
    <html>
      <head>
        <title>Sample One</title>
      </head>
      <body>
        <h1>This is sample one.</h1> <a href="../">Go to index.</a> <a href="two">Go to two.</a>
        <a href="${window.location.origin}/two">absoluteLink2</a>
        <a href="http://google.com">externalLink</a>
      </body>
    </html>
  `);

  getHTTP('/two', `
    <html>
      <head>
        <title>Sample Two</title>
      </head>
      <body>
        <h1>This is sample two.</h1> <a href="../">Go to index.</a> <a href="one">Go to one.</a>
      </body>
    </html>
  `);

}
