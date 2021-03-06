import React from 'react';
import PropTypes from 'prop-types';

// ui
import '../css/Form.css';
import {
  Spinner, Alert
} from 'react-bootstrap';

import {
  useMediaQuery
} from '@material-ui/core/';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles(theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),

    // adding sapce between header and content
    minHeight: '55px',
    // ...theme.mixins.toolbar, // by using this setting, it cause too large gap  between two parts
    justifyContent: 'flex-end'
  }
}));

function BaseUIComp(props) {
  const classes = useStyles();

  return (
    <div>
      {/* // add space for padding app bar */}
      <div className={classes.drawerHeader} />

      {
        // page loading mask
        props.pageLoading === true
          && (
          <div className="overlay">
            <br />
            <Spinner
              animation="border"
              role="status"
              size="lg"
              style={{ width: `${10}rem`, height: `${10}rem` }}
              className="mt-5"
            >
              <span className="sr-only">Loading...</span>
            </Spinner>
            <h5>Loading...</h5>
          </div>
          )
      }

      <ToastContainer
        position="bottom-right"
        autoClose={false}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnVisibilityChange
        draggable
        pauseOnHover
      />
    </div>
  );
}

BaseUIComp.propTypes = {
  // displayMsg: PropTypes.oneOfType([PropTypes.object]).isRequired,
  pageLoading: PropTypes.bool.isRequired
};

// use memo to skip unnecessary reload
export default React.memo(BaseUIComp);
