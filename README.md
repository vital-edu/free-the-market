# Free the Market

A simple decentralized e-commerce built with Blockstack

## Needed Configurations

This application needs a radiks server to work.
You can create your own radiks server using as template the [Free the Market - Radiks Server](http://github.com/vital-edu/serve-the-market).

After deploying it or running it locally you just need to use the file `env.local.template`:

```sh
cp .env.local.template .env.local
```

replacing the `REACT_APP_RADIKS_SERVER=https://my-radiks-server-url.com` inside the file with the correct url.

## Available Scripts

In the project directory, you can run:

### `npm install`

Install all the dependencies necessary to run the application.


### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
