import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import '../css/react-grid-layout-styles.css';
import '../css/react-resizable-styles.css';
import '../css/SpaceGrid.css';
import PropTypes from 'prop-types';

import {
  Row, Col, ButtonToolbar, Spinner, Alert
} from 'react-bootstrap';
import { IconButton } from '@material-ui/core/';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import TouchAppIcon from '@material-ui/icons/TouchApp';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function SpaceGrid(props) {
  const [mode, setMode] = React.useState('edit');

  return (
    <div>
      {
        // page loading mask
        props.formState.pageLoading === true && (
          <div className="overlay">
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
      <Row className="justify-content-md-center">
        <Col xs={12} md={9}>
          <ButtonToolbar>
            <IconButton aria-label="New" onClick={props.handleNew}>
              <AddCircleOutlineIcon />
            </IconButton>
            <IconButton aria-label="Save" onClick={props.handleSave}>
              <SaveIcon />
            </IconButton>
            <IconButton aria-label="Cancel" onClick={props.handleCancel}>
              <HighlightOffIcon />
            </IconButton>
          </ButtonToolbar>
        </Col>
        <Col xs={12} md={3}>
          {props.gridList != null && props.gridList.length > 0 && (
            <div>
              Current Mode:
              <select
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value);
                  props.handleToggleMode(mode === 'edit');
                }}
              >
                <option value="edit">Edit</option>
                <option value="view">View</option>
              </select>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={12}>
          {props.gridList != null && props.gridList.length > 0 ? (
            <ResponsiveReactGridLayout
              // layouts={props.gridLayout}
              onLayoutChange={
                (currLayout, allLayouts) => props.handleUpdateLayout(currLayout, allLayouts)
              }
            >
              {props.gridList.map(grid => (
                <div
                  key={grid.i}
                  className={
                    grid.static ? 'spaceGrid-grid-static' : 'spaceGrid-grid'
                  }
                  data-grid={grid}
                >
                  <h1>{grid.i}</h1>
                  <ButtonToolbar className="spaceGrid-btn">
                    <IconButton
                      aria-label="select"
                      onClick={() => props.handleSelect(grid.i)}
                    >
                      <TouchAppIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={() => props.handleRemove(grid.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ButtonToolbar>
                </div>
              ))}
            </ResponsiveReactGridLayout>
          ) : (
            <Alert variant="info">
              Please add new grid to start manage your space!
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
}

SpaceGrid.propTypes = {
  gridList: PropTypes.arrayOf(PropTypes.object).isRequired,
  formState: PropTypes.oneOfType([PropTypes.object]).isRequired,

  // gridLayout: PropTypes.array,
  // spaceId: PropTypes.number,
  // formState: PropTypes.object,
  handleNew: PropTypes.func.isRequired,
  handleToggleMode: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdateLayout: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired
};

export default SpaceGrid;
