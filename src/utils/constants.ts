import { AppConfig } from 'blockstack'
import { createMuiTheme } from '@material-ui/core';
import { amber, pink } from '@material-ui/core/colors';

export const appConfig = new AppConfig(['store_write', 'publish_data'])

export const EXPLORER_URL = 'https://explorer.blockstack.org'

export const theme = createMuiTheme({
  palette: {
    primary: amber,
    secondary: pink,
  },
});
