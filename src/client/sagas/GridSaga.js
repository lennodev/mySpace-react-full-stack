import { put, call, takeEvery } from 'redux-saga/effects';
import * as Service from '../services/Grid';
import * as Actions from '../actions/Grid';
import * as ActionTypes from '../actionTypes/Grid';
import * as Constants from '../constants/Grid';

export function* handleGetGridList({ gridId }) {
  try {
    yield put(Actions.startLoading());
    const operResult = yield call(Service.getGridList, gridId);

    if (operResult.isSuccess) {
      yield put(Actions.getGridList(operResult.data));
    } else {
      yield put(Actions.getGridList(null));
    }
  } catch (error) {
    yield put(Actions.getGridList(null));
  }
}

export function* handleDeleteGrid({ gridId }) {
  try {
    yield put(Actions.startLoading());
    const operResult = yield call(Service.deleteGrid, gridId);

    if (operResult.isSuccess) {
      yield put(Actions.completeEdit(operResult.data, Constants.OPERATION_DELETE));
    } else {
      yield put(Actions.failEdit(operResult.message, Constants.OPERATION_DELETE));
    }
  } catch (error) {
    yield put(Actions.failEdit(error.message, Constants.OPERATION_DELETE));
  }
}

export function* handleSaveGrids({ grids }) {
  try {
    yield put(Actions.startLoading());
    const operResult = yield call(Service.saveGrids, grids);

    if (operResult.isSuccess) {
      yield put(Actions.completeEdit(operResult.data, Constants.OPERATION_SAVE));
    } else {
      yield put(Actions.failEdit(operResult.message, Constants.OPERATION_SAVE));
    }
  } catch (error) {
    yield put(Actions.failEdit(error.message, Constants.OPERATION_SAVE));
  }
}


export function* watchGetGridList() {
  yield takeEvery(ActionTypes.SAGA_GET_GRID_LIST, handleGetGridList);
}

export function* watchSaveGrids() {
  yield takeEvery(ActionTypes.SAGA_SAVE_GRIDS, handleSaveGrids);
}

export function* watchDeleteGrid() {
  yield takeEvery(ActionTypes.SAGA_DELETE_GRID, handleDeleteGrid);
}

export default {
  watchGetGridList,
  watchSaveGrids,
  watchDeleteGrid
};
