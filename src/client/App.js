import React from 'react';
import { Route, BrowserRouter as Router, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import clsx from 'clsx';
import {
  useTheme, fade, makeStyles
} from '@material-ui/core/styles';
import {
  useMediaQuery, Box
} from '@material-ui/core/';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignInAlt, faHome, faPowerOff, faBell, faSearch
} from '@fortawesome/free-solid-svg-icons';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {
  Item, Space, Grid, Search, Auth
} from './views';
import rootSaga from './sagas';
import allReducers from './reducers';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(allReducers, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

// align with item width
const drawerWidth = 170;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto'
    }
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch'
      }
    }
  }
}));

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const [openAuth, setOpenAuth] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    if (open === true) {
      setOpen(false);
    }
  };

  const onSearch = (event) => {
    console.log(event.target.value);
  };

  const handleCloseAuth = () => {
    setOpenAuth(false);
  };

  const handleOpenAuth = () => {
    setOpenAuth(true);
  };

  const isLargeDevice = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Provider store={store}>
      <Router>
        <Route render={({ location, history }) => (
          <div className={classes.root}>
            <CssBaseline />
            <AppBar
              position="fixed"
              className={clsx(classes.appBar, {
                [classes.appBarShift]: open
              })}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  className={clsx(classes.menuButton, open && classes.hide)}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap>
                  Space Master
                  {/* {
                    isLargeDevice === true ? (
                      // large device
                      <Box display="flex" justifyContent="flex-end">
                        L
                      </Box>
                    ) : (
                    // small device
                      <Box display="flex" justifyContent="flex-end">
                        S
                      </Box>
                    )
                  } */}
                </Typography>

                {/* <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={onSearch}
                  />
                </div> */}
              </Toolbar>
            </AppBar>
            <Drawer
              className={classes.drawer}
              variant="persistent"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper
              }}
              onClose={handleDrawerClose}
            >
              <div className={classes.drawerHeader}>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
                <Typography
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  Hi Peter!

                </Typography>
              </div>
              <Divider />
              <List
                role="presentation"
                onClick={handleDrawerClose}
              >
                <ListItem
                  button
                  onClick={handleOpenAuth}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faSignInAlt} style={{ fontSize: '1.75em', verticalAlign: 'middle' }} />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={Link} to="/space">
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faHome} style={{ fontSize: '1.75em', verticalAlign: 'middle' }} />
                  </ListItemIcon>
                  <ListItemText primary="Home" />
                </ListItem>
                <ListItem button component={Link} to="/search">
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faSearch} style={{ fontSize: '1.75em', verticalAlign: 'middle' }} />
                  </ListItemIcon>
                  <ListItemText primary="Search" />
                </ListItem>
                <ListItem button component={Link} to="/grid">
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faBell} style={{ fontSize: '1.75em', verticalAlign: 'middle' }} />
                  </ListItemIcon>
                  <ListItemText primary="Reminder" />
                </ListItem>
                <Divider />
                <ListItem button component={Link} to="/logout">
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faPowerOff} style={{ fontSize: '1.75em', verticalAlign: 'middle' }} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Drawer>
            <main
              className={clsx(classes.content, {
                [classes.contentShift]: open
              })}
              role="presentation"
              onClick={handleDrawerClose}
            >
              <div>
                {/* // padding space is added in BaseUIComp */}
                <Route exact path="/" component={Item} />
                {/* <Route path="/login" component={Space} /> */}
                <Route path="/space" component={Space} />
                <Route path="/grid" component={Grid} />
                <Route path="/item" component={Item} />
                <Route path="/search" component={Search} />
                <Route path="/logout" component={Space} />

                {/* // for login popup  */}
                <Auth
                  isShow={openAuth}
                  handleClose={handleCloseAuth}
                />
              </div>
            </main>
          </div>
        )}
        />
      </Router>
    </Provider>
  );
}
export default App;
